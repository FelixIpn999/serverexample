import {pino} from "pino";
import {v4 as uuidv4} from "uuid"


// Configuramos Pino.
// En producción, pino escupirá JSON rapidísimo.
// En desarrollo (si usamos pino-pretty), formateará el texto para que sea legible.

export const Logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    base : {
        service: 'inventory-api',
        env: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0'
    },
    transport: process.env.NODE_ENV !== 'production'
        ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },

        }
        : undefined
});

export function requestMiddleware(req: any, _res: any, next:any){
    req.id = req.headers['x-request-id'] || uuidv4();
    next();
}
