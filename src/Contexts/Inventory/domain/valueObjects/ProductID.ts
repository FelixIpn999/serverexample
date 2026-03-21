import {v4 as uuidv4, validate as uuidValidate} from 'uuid'
import {InvalidArgumentError} from "../../../Shared/domain/Errors/InvalidArgumentError";

export class ProductID {
    readonly value: string;
    constructor(value: string) {
        this.ensureIsValidUuid(value);
        this.value = value;

    }

    static random(): ProductID {
        return new ProductID(uuidv4());
    }

    private ensureIsValidUuid(id: string): void{
        if (!uuidValidate(id)) {
            throw new InvalidArgumentError(`Invalid Product ID: ${id}`);
        }
    }

    toString(): string {
        return this.value;
    
    }
}