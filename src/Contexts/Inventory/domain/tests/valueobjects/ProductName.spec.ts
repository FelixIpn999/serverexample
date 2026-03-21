import {Product} from "../../Product";
import {InvalidArgumentError} from "../../../../Shared/domain/Errors/InvalidArgumentError";
import {ProductName} from "../../valueObjects/ProductName";


describe('Product Name Value Object', () => {
    //Caso de exito
    it('should create a valid product name', () =>{
        const validName = 'Macbook Pro M2';

        const productName = new ProductName(validName);

        expect(productName.value).toBe(validName);

    });

    it('Should throw an error due to shortest productname', () =>{
        // Arrange
        const shortName = 'ab';

        // Act & Assert
        // Cuando probamos excepciones, envolvemos la ejecución en una función anónima
        expect(() => new ProductName(shortName)).toThrow(InvalidArgumentError);
        expect(() => new ProductName(shortName)).toThrow('Product name must be between 3 and 100 characters. \n' );
    });

    it('should throw an error if the name has more than 100 characters', () => {
        const longName = 'a'.repeat(101);
        expect(() => new ProductName(longName)).toThrow(InvalidArgumentError);
        expect(() => new ProductName(longName)).toThrow('Product name must be between 3 and 100 characters. \n');
    });
});