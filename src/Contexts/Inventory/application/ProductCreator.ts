import {Product} from "../domain/Product";
import {ProductID} from "../domain/valueObjects/ProductID";
import {ProductName} from "../domain/valueObjects/ProductName";
import  {ProductStock} from "../domain/ProductStock";
import {ProductRepository} from "../domain/ProductRepository";
import { injectable, inject } from 'tsyringe';


@injectable()
export class ProductCreator {


    // Usamos @inject('ProductRepository') porque ProductRepository es una interfaz
    constructor(
        @inject('ProductRepository') private repository: ProductRepository
    ) {}


    // Recibimos primitivos desde el controlador, los convertimos a Value Objects,
    // creamos la entidad y la guardamos.

    async run(id: string, name: string, stock: number): Promise <void>{
        // 1. Instanciar los Value Objects (aquí se validan las reglas de negocio)
        const productId =  new ProductID(id);
        const productName = new ProductName(name);
        const productStock = new ProductStock(stock);
        // 2. Crear la Entidad
        const product = Product.create(productId, productName, productStock);
        // 3. Guardar la Entidad usando el repositorio
        await this.repository.save(product);

    }

}