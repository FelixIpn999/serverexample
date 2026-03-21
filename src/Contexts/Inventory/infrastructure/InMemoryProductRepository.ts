import {Product} from "../domain/Product";
import {ProductID} from "../domain/valueObjects/ProductID"
import {ProductRepository} from "../domain/ProductRepository";


export class InMemoryProductRepository implements ProductRepository{
    private products : Map<string, any> = new Map();

    async save(product: Product): Promise<void>{
        // Al guardar, convertimos la Entidad rica en datos primitivos
        this.products.set(product.id.value, product.toPrimitives());
        console.log(`Product saved: ${JSON.stringify(product.toPrimitives())}`);

    }

    async search(id: ProductID): Promise<Product | null>{
        const product = this.products.get(id.value);
        if (!product) {
            return null;
        }
        return Product.fromPrimitives(product);
    }
}