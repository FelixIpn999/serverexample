import {DynamoDbProductRepository} from "../dbadapters/DynamoDbProductRepository";
import {Product} from "../../domain/Product";
import {ProductID} from "../../domain/valueObjects/ProductID";
import {ProductName} from "../../domain/valueObjects/ProductName";
import {ProductStock} from "../../domain/ProductStock";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";

// src/Contexts/Inventory/infrastructure/tests/DynamoDbProductRepository.spec.ts

describe('DynamoDbProductRepository', () => {
   let sendMock: jest.Mock<Promise<any>, [any]>;
   let repository: DynamoDbProductRepository;
   beforeEach(() => {
       sendMock = jest.fn<Promise<any>, [any]>();
       const mockDynamoClient = {
           send: sendMock } as unknown as DynamoDBClient;
       repository = new DynamoDbProductRepository(mockDynamoClient);
   });

    it('should save product to DynamoDB', async () => {
        // Arrange
        const product = Product.create(
            new ProductID('123e4567-e89b-12d3-a456-426614174000'),
            new ProductName('Test Product'),
            new ProductStock(10)
        );

       sendMock.mockResolvedValue({});

        // Act
        await repository.save(product);

        // Assert
        expect(sendMock).toHaveBeenCalledWith(
            expect.objectContaining({
                input: {
                    TableName: 'products-table',
                    Item: expect.objectContaining({
                        id: { S: '123e4567-e89b-12d3-a456-426614174000' }
                    })
                }
            })
        );
    });
});
