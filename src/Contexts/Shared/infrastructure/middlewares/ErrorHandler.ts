import {Request, Response, NextFunction} from "express";
import {DomainError} from "../../domain/Errors/DomainError";
import {InvalidArgumentError} from "../../domain/Errors/InvalidArgumentError";
import {Logger} from "../logger/Logger";


export class ErrorHandler{
    // En Express, un middleware de errores TIENE que tener exactamente estos 4 parámetros
    static handle(err: Error, req: Request, res: Response, next: NextFunction){

        // 1. ¿Es un error de nuestro negocio (DomainError)?
        if(err instanceof DomainError){
            // Mapeamos errores especificos a codigos HTTP especificos
            if(err instanceof InvalidArgumentError){
                res.status(400).json({
                    error: err.name,
                    message: err.message

                });
                return;

            }
            res.status(422).json({

                error: err.name,
                message: err.message

            });
            return;
        }

        // 2. ¿Es un error técnico/inesperado? (Base de datos caída, error de sintaxis, etc.)
        // Aquí en el futuro conectaríamos un Logger profesional (como Datadog, Pino o Sentry)
        Logger.error(err,'Unhandled Technical Error occurred during request processing');


        // Jamás exponemos el stacktrace al cliente (Seguridad)
        res.status(500).json({
            error: 'InternalServerError',
            message: 'Something went wrong processing your request',
        });

    }

}