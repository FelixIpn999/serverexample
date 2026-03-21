/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest', // Le dice a Jest que use ts-jest para compilar TypeScript
  testEnvironment: 'node', // Nuestro entorno de ejecución es Node.js, no un navegador
  setupFilesAfterEnv: ['reflect-metadata'], // Importante: Inicia TSyringe para los tests
  modulePathIgnorePatterns: ['<rootDir>/dist/'], // Ignora la carpeta de código compilado
  testMatch: ['**/**/*.spec.ts'], // Busca archivos que terminen en .spec.ts
  collectCoverageFrom: ['src/**/*.ts',
      '!src/**/*.spec.ts'
  ],
  coverageThreshold:{
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  }


};