import {DynamoDbProductRepository} from "../dbadapters/DynamoDbProductRepository";
import {Product} from "../../domain/Product";
import {ProductID} from "../../domain/valueObjects/ProductID";
import {ProductName} from "../../domain/valueObjects/ProductName";
import {ProductStock} from "../../domain/ProductStock";
import {DynamoDBClient, PutItemCommand, GetItemCommand} from "@aws-sdk/client-dynamodb";

// Mock del DynamoDBClient
jest.mock("@aws-sdk/client-dynamodb", () => {
    const actualModule = jest.requireActual("@aws-sdk/client-dynamodb");
    return {
        ...actualModule,
        DynamoDBClient: jest.fn().mockImplementation(() => ({
            send: jest.fn()
        }))
    };
});

describe('DynamoDbProductRepository', () => {
    let repository: DynamoDbProductRepository;
    let mockSend: jest.Mock;

    beforeEach(() => {
        // Configurar variables de entorno para el test
        process.env.DYNAMODB_TABLE_NAME = 'products-table';
        process.env.AWS_REGION = 'us-east-1';

        // Crear instancia del repositorio
        repository = new DynamoDbProductRepository();

        // Obtener la referencia al mock de send
        mockSend = (repository as any).client.send as jest.Mock;
        mockSend.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should save product to DynamoDB', async () => {
        // Arrange
        const product = Product.create(
            new ProductID('123e4567-e89b-12d3-a456-426614174000'),
            new ProductName('Test Product'),
            new ProductStock(10)
        );

        mockSend.mockResolvedValue({});

        // Act
        await repository.save(product);

        // Assert
        expect(mockSend).toHaveBeenCalledWith(
            expect.any(PutItemCommand)
        );

        const putItemCommand = mockSend.mock.calls[0][0];
        expect(putItemCommand.input).toEqual({
            TableName: 'products-table',
            Item: {
                id: { S: '123e4567-e89b-12d3-a456-426614174000' },
                name: { S: 'Test Product' },
                stock: { N: '10' }
            }
        });
    });

    it('should search and return product from DynamoDB', async () => {
        // Arrange
        const productId = new ProductID('123e4567-e89b-12d3-a456-426614174000');

        mockSend.mockResolvedValue({
            Item: {
                id: { S: '123e4567-e89b-12d3-a456-426614174000' },
                name: { S: 'Test Product' },
                stock: { N: '10' }
            }
        });

        // Act
        const result = await repository.search(productId);

        // Assert
        expect(mockSend).toHaveBeenCalledWith(
            expect.any(GetItemCommand)
        );
        expect(result).not.toBeNull();
        expect(result?.id.value).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(result?.name.value).toBe('Test Product');
        expect(result?.stock.value).toBe(10);
    });

    it('should return null when product not found', async () => {
        // Arrange
        const productId = new ProductID('123e4567-e89b-12d3-a456-426614174999');

        mockSend.mockResolvedValue({
            Item: undefined
        });

        // Act
        const result = await repository.search(productId);

        // Assert
        expect(result).toBeNull();
    });
});
