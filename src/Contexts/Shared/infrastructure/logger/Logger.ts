import {pino} from "pino";


// Configuramos Pino.
// En producción, pino escupirá JSON rapidísimo.
// En desarrollo (si usamos pino-pretty), formateará el texto para que sea legible.

export const Logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production'
        ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },

        }
        : undefined
});
