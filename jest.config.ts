module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/index.ts', // Exclude entry point from coverage
    '!src/**/*.dto.ts', // Exclude DTOs from coverage
    '!src/**/*.entity.ts', // Exclude entities from coverage
    '!src/**/*.factory.ts', // Exclude factories from coverage
    '!src/**/*.repository.port.ts', // Exclude repository interfaces from coverage
    '!src/**/*.event.ts', // Exclude domain events from coverage
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};
