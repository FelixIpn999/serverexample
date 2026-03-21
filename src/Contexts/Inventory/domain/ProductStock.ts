import { InvalidArgumentError} from "../../Shared/domain/Errors/InvalidArgumentError";

export class ProductStock {
  readonly value: number;

  constructor(value: number) {
    this.ensureIsNotNegative(value);
    this.value = value;
  }

  private ensureIsNotNegative(value: number): void {
    if (value < 0) {
      throw new InvalidArgumentError(`The Product Stock <${value}> is negative`);
    }
  }
}
