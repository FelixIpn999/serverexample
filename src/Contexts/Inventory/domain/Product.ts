import {ProductID} from "./valueObjects/ProductID";
import {ProductName} from "./valueObjects/ProductName";
import {ProductStock} from "./ProductStock";


export class Product {
    readonly id: ProductID;
    readonly name: ProductName;
    readonly stock: ProductStock;

    private constructor(id: ProductID, name: ProductName, stock: ProductStock) {
        this.id = id;
        this.name = name;
        this.stock = stock;
    }

    static create(id: ProductID, name: ProductName, stock: ProductStock) {
        const product = new Product(id, name, stock);
        // Here you can add domain events or other logic related to product creation
        return product;
    }

    // Método para reconstruir desde base de datos (sin validaciones de creación si fuera necesario)
    static fromPrimitives(plainData: { id: string; name: string; stock: number }): Product {
        return new Product(
            new ProductID(plainData.id),
            new ProductName(plainData.name),
            new ProductStock(plainData.stock)
        );
    }


    toPrimitives() {
        return {
            id: this.id.value,
            name: this.name.value,
            stock: this.stock.value,
        };


    }
}