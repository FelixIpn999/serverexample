import {Product} from "../../Product";
import {InvalidArgumentError} from "../../../../Shared/domain/Errors/InvalidArgumentError";
import {ProductStock} from "../../ProductStock";

describe('Product Stock Value Object', () => {

    it('should create a valid product stock', () =>{
        const validStock = 50;

        const productStock = new ProductStock(validStock);
        expect(productStock.value).toBe(validStock);

    });
    it('should throw an error if the stock is negative', () => {
        const invalidStock = -5;
        expect(() => new ProductStock(invalidStock)).toThrow(InvalidArgumentError);
        expect(() => new ProductStock(invalidStock)).toThrow(`The Product Stock <${invalidStock}> is negative`);
    });
})
