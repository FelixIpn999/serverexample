import {Product} from "../../domain/Product";
import {ProductID} from "../../domain/valueObjects/ProductID";
import {ProductRepository} from "../../domain/ProductRepository";


export class PostgreSqlProductRepository implements ProductRepository{
    // Aquí inyectarías tu cliente de DB corporativo (ej. Pool de pg, PrismaClient, TypeORM)
    // constructor(private dbClient: any) {}

    async save(product: Product): Promise<void> {
        const primitives = product.toPrimitives();

        // Aquí iría la lógica real de SQL
        console.log(`[PostgreSQL Plugin] Executing INSERT INTO products...`, primitives);

        // await this.dbClient.query(
        //   'INSERT INTO products (id, name, stock) VALUES ($1, $2, $3)',
        //   [primitives.id, primitives.name, primitives.stock]
        // );
    }

    async search(id: ProductID): Promise<Product | null> {
        console.log(`[PostgreSQL Plugin] Executing SELECT * FROM products WHERE id = ${id.value}`);
        // Lógica real de búsqueda y reconstrucción de la Entidad Product...
        return null;
    }
}