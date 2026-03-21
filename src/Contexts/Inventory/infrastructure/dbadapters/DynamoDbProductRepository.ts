import {ProductRepository} from "../../domain/ProductRepository";
import {Product} from "../../domain/Product";
import {ProductID} from "../../domain/valueObjects/ProductID";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {PutItemCommand} from "@aws-sdk/client-dynamodb";
import {GetItemCommand} from "@aws-sdk/client-dynamodb";

export class DynamoDbProductRepository implements ProductRepository {

    constructor (private dynamodbClient:DynamoDBClient){}

    async save(product: Product): Promise<void> {
        const item = {
            id: {S: product.id.value},
            name: {S: product.name.value},
            stock: {N: product.stock.value.toString()}
        };

        await this.dynamodbClient.send(
            new PutItemCommand({
                TableName: "products-table",
                Item: item
            })
        );
    }

    async search(id:ProductID): Promise<Product | null> {
        const result = await this.dynamodbClient.send(
            new GetItemCommand({
                TableName: "products-table",
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