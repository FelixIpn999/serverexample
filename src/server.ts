import 'reflect-metadata';
import express from 'express';
import { validationMiddleware } from './Contexts/Shared/infrastructure/middlewares/ValidationMiddleware';
import { ProductPutDto } from './Contexts/Inventory/infrastructure/dtos/ProductPut';
import { InMemoryProductRepository } from './Contexts/Inventory/infrastructure/InMemoryProductRepository';
import { ProductPutController } from './Contexts/Inventory/infrastructure/ProductPutController';
import pinoHttp from 'pino-http';
import {Logger} from "./Contexts/Shared/infrastructure/logger/Logger";
import { container } from 'tsyringe'; // <--- Importamos el contenedor global
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from "express-rate-limit";
import { PostgreSqlProductRepository} from "./Contexts/Inventory/infrastructure/dbadapters/PostgreSqlProductRepository";
import {DynamoDbProductRepository} from "./Contexts/Inventory/infrastructure/dbadapters/DynamoDbProductRepository";

// NUEVO: Importamos nuestra clase de Configuración
import { Config } from './Contexts/Shared/infrastructure/environment/Config';

// IMPORTA EL ERROR HANDLER AQUÍ
import { ErrorHandler } from './Contexts/Shared/infrastructure/middlewares/ErrorHandler';

// ==========================================
// 1. CARGA Y VALIDACIÓN DE CONFIGURACIÓN
// ==========================================
// Fail Fast: Si el .env está mal, la app muere aquí y no arranca
const appConfig = Config.load();

const app = express();
// ==========================================
// 1.5 Middleares globales de seguridad
// ==========================================
// Levantar head limiter, cors, rate limiter, logging, body parser
app.use(helmet());
app.use(cors({
    origin: appConfig.nodeEnv === 'production'
    ? ['https://midominio-seguro.com']
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.set('trust-proxy', 1);
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

//Habilitar observabilidad registrar si la peticion supero los escudos de seguridad
app.use(pinoHttp({logger: Logger}));

// Parseo de datos en JSON
app.use(express.json());


// ==========================================
// 2. CONFIGURACIÓN DEL CONTENEDOR DE INYECCIÓN (IoC)
// ==========================================
// Registramos la configuración por si alguna otra clase la necesita
container.registerInstance(Config, appConfig);
if(appConfig.dbEngine === 'postgres'){
    Logger.info('Using Postgres as database engine');
    container.registerSingleton('ProductRepository', PostgreSqlProductRepository);
} else if(appConfig.dbEngine === 'dynamodb'){
    Logger.info('Using DynamoDB as database engine');
    container.registerSingleton('ProductRepository', DynamoDbProductRepository);
}else if (appConfig.dbEngine === 'sqlite'){
    Logger.error('Using SQLite as database engine');
    //container.registerSingleton('ProductRepository', InMemoryProductRepository);
    throw new Error('SQLite not implemented yet');

} else if(appConfig.dbEngine === 'memory'){
    Logger.info('🔌 Plugin de Persistencia: Usando base de datos En Memoria (Solo para Dev/Test)');
    container.registerSingleton('ProductRepository', InMemoryProductRepository);
} else {
    Logger.error('Unsupported Engine');
    throw new Error(`Unsupported Engine: ${appConfig.dbEngine}`);

}

// ¡Magia! Le pedimos a TSyringe que nos dé el controlador.
// Él automáticamente buscará las dependencias (ProductCreator), y las dependencias de este (ProductRepository), y las construirá todas.
const productPutController = container.resolve(ProductPutController);

// ==========================================
// 3. RUTAS
// ==========================================
app.put(
    '/products/:id',
    validationMiddleware(ProductPutDto),
    productPutController.run.bind(productPutController)
);

// ==========================================
// ¡AQUÍ VA EL MIDDLEWARE DE ERRORES!
// Debe ir SIEMPRE después de las rutas.
// ==========================================
app.use(ErrorHandler.handle);

// ==========================================
// 4. ARRANQUE DEL SERVIDOR DINÁMICO
// ==========================================
// Usamos el puerto validado desde nuestro objeto Config
app.listen(appConfig.port, () => {
    Logger.info(`Server is running at http://localhost:${appConfig.port}`);
    Logger.info(`Environment: ${appConfig.nodeEnv}`);
});

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
