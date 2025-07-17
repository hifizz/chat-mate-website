const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // 指向 Next.js 应用的路径
  dir: './',
});

// Jest 的自定义配置
const customJestConfig = {
  // 添加更多自定义配置
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // 处理模块别名
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// createJestConfig 会自动处理一些配置，如 Next.js 的转换器
module.exports = createJestConfig(customJestConfig);