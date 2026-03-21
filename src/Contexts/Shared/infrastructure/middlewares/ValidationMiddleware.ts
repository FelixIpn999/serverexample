// src/Contexts/Shared/infrastructure/middlewares/ValidationMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { InvalidArgumentError } from '../../../Shared/domain/Errors/InvalidArgumentError'; // Reutilizamos nuestro error de dominio

// Esta es la función "Factory" que crea el middleware
export function validationMiddleware<T extends object>(dtoClass: new () => T) {
    return async (req: Request, res: Response, next: NextFunction) => {
        // 1. Combinamos todas las fuentes de datos (body, query, params) en un solo objeto
        const combinedData = { ...req.body, ...req.query, ...req.params };

        // 2. Usamos 'class-transformer' para convertir el objeto plano en una instancia de nuestra clase DTO
        const dtoInstance = plainToInstance(dtoClass, combinedData);

        // 3. Usamos 'class-validator' para validar la instancia del DTO
        const errors = await validate(dtoInstance);

        // 4. Si hay errores, los formateamos y los pasamos a nuestro ErrorHandler global
        if (errors.length > 0) {
            const errorMessages = errors.map(error => Object.values(error.constraints || {})).join(', ');
            // Lanzamos un error que nuestro ErrorHandler ya sabe cómo manejar (400 Bad Request)
            return next(new InvalidArgumentError(errorMessages));
        }

        // 5. Si no hay errores, adjuntamos el DTO validado y transformado al request para uso posterior
        // y continuamos al siguiente middleware (el controlador)
        req.body = dtoInstance; // Sobreescribimos el body con la instancia validada y transformada
        next();
    };
}