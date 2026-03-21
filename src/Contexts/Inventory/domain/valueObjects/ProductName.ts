import {InvalidArgumentError} from "../../../Shared/domain/Errors/InvalidArgumentError";

export class ProductName {
    readonly value: string;

    constructor(value: string) {
        this.ensureLengthIsCorrect(value);
        this.value = value;
    }

    private ensureLengthIsCorrect(name: string): void {
        if (name.length < 3 || name.length > 100) {
            throw new InvalidArgumentError(`Product name must be between 3 and 100 characters. 
            Given: ${name}`);
        }
    }
}