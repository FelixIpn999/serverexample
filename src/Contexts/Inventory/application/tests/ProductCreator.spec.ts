// src/Contexts/Inventory/application/ProductCreator.spec.ts

import {ProductCreator} from "../ProductCreator";
import { ProductRepository} from "../../domain/ProductRepository";
import { Product} from "../../domain/Product";
import { InvalidArgumentError} from "../../../Shared/domain/Errors/InvalidArgumentError";

describe('ProductCreator Use Case', () => {
  let productCreator: ProductCreator;

  // Creamos un Mock del repositorio usando las funciones espía (spy) de Jest
  let mockRepository: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    // Arrange (Global para cada test): Reiniciamos los mocks antes de cada prueba
    mockRepository = {
      save: jest.fn(),
      search: jest.fn(),
    };

    // Inyectamos el mock manualmente en el caso de uso (sin TSyringe, de forma directa)
    productCreator = new ProductCreator(mockRepository);
  });

  it('should create a valid product and save it to the repository', async () => {
    // Arrange
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const name = 'iPhone 15 Pro';
    const stock = 50;

    // Act
    await productCreator.run(id, name, stock);

    // Assert
    // 1. Verificamos que se haya llamado al método save del repositorio
    expect(mockRepository.save).toHaveBeenCalledTimes(1);

    // 2. Verificamos que se haya llamado con una instancia de Product
    const savedProduct = mockRepository.save.mock.calls[0][0];
    expect(savedProduct).toBeInstanceOf(Product);
    expect(savedProduct.toPrimitives()).toEqual({ id, name, stock });
  });

  it('propaga error técnico del repositorio', async () => {
    mockRepository.save.mockRejectedValueOnce(new Error('db down'));
    await expect(
        productCreator.run('123e4567-e89b-12d3-a456-426614174000', 'Producto X', 10)
    ).rejects.toThrow('db down');
  });

  it('falla con id inválido y no guarda', async () => {
    await expect(
        productCreator.run('id-no-uuid', 'Producto X', 10)
    ).rejects.toThrow();
    expect(mockRepository.save).not.toHaveBeenCalled();
  });



  it('should throw an error if the product data is invalid (e.g. negative stock) and NOT save', async () => {
    // Arrange
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const name = 'iPhone 15 Pro';
    const invalidStock = -5;

    // Act & Assert
    // Al ser asíncrono, usamos rejects.toThrow
    await expect(productCreator.run(id, name, invalidStock)).rejects.toThrow(InvalidArgumentError);

    // Verificación Crítica Arquitectónica:
    // Si la validación falla en el Dominio, NUNCA debe llamarse a la base de datos (repositorio)
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});