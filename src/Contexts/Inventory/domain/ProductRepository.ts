import {Product} from "./Product";
import {ProductID} from "./valueObjects/ProductID"

export interface ProductRepository {

    save (product: Product): Promise<void>;
    search(id: ProductID): Promise<Product | null>;
}