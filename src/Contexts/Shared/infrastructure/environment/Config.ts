import { IsString, IsNumber, IsIn, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import * as dotenv from 'dotenv';
import { injectable } from 'tsyringe';


// 1. Cargamos las variables del archivo .env a process.env
dotenv.config();

@injectable()
export class Config{
    @IsNumber()
    readonly port!: number;

    @IsString()
    @IsIn(['development', 'production', 'test'])
    readonly nodeEnv!: string;

    @IsString()
    @IsIn(['debug', 'info', 'warn', 'error'])
    readonly logLevel!: string;

    @IsString()
    @IsIn(['memory', 'postgres','sqlite','dynamodb'])
    readonly dbEngine!: string;

    public constructor(){}


public static load() : Config {
    const rawConfig = {
        port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
        nodeEnv: process.env.NODE_ENV || 'development',
        logLevel: process.env.LOG_LEVEL || 'info',
        dbEngine: process.env.DB_ENGINE || 'memory',
    };

    // Transformamos el objeto plano en una instancia de Config
    const configInstance = plainToInstance(Config, rawConfig);

    // Validamos la instancia
    const errors = validateSync(configInstance);

    if (errors.length > 0) {
        const errorMessages = errors.map(error => Object.values(error.constraints || {})).join(', ');
        // ¡FAIL FAST! Abortamos el proceso de Node.js si la configuración es inválida
        console.error('Configuration validation error:', errorMessages);
        process.exit(1);
    }

    return configInstance;
}

}

