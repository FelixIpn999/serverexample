import {ProductRepository} from "../../domain/ProductRepository";
import {Product} from "../../domain/Product";
import {ProductID} from "../../domain/valueObjects/ProductID";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {PutItemCommand} from "@aws-sdk/client-dynamodb";
import {GetItemCommand} from "@aws-sdk/client-dynamodb";
import {injectable} from "tsyringe";

@injectable()
export class DynamoDbProductRepository implements ProductRepository {
    private readonly tableName: string;
    private readonly client: DynamoDBClient;

    constructor() {
        this.tableName = process.env.DYNAMODB_TABLE_NAME || 'products-table';
        this.client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
    }

    async save(product: Product): Promise<void> {
        const item = {
            id: {S: product.id.value},
            name: {S: product.name.value},
            stock: {N: product.stock.value.toString()}
        };

        await this.client.send(
            new PutItemCommand({
                TableName: this.tableName,
                Item: item
            })
        );
    }

    async search(id:ProductID): Promise<Product | null> {
        const result = await this.client.send(
            new GetItemCommand({
                TableName: this.tableName,
                Key: {
                    id: {S: id.value}
                }
            })
        );

        if (!result.Item) {
            return null;
        }

        return Product.fromPrimitives({
            id: result.Item.id.S!,
            name: result.Item.name.S!,
            stock: parseInt(result.Item.stock.N!)
        });
    }
}