// Ejemplo de ProductPut.dto.ts
import { IsString, IsNumber, Min, MinLength, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
export class ProductPutDto {
    @IsUUID()
    id!: string;

    @IsString()
    @MinLength(3)
    name!: string;


    // Transformamos el valor a número antes de validarlo
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'El stock debe ser un número.' })
    @Min(0, { message: 'El stock no puede ser negativo.' })
    stock!: number;
}
