/**
 * Prisma mock helper
 * Use this to mock Prisma in tests
 */

import { vi } from 'vitest';

/**
 * Creates a mock Prisma client
 * Use this in tests that need database mocking
 */
export function createMockPrisma() {
  return {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    task: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    recurringTask: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(createMockPrisma())),
  };
}

/**
 * Mock Prisma module
 * Call this at the top of test files that need Prisma
 */
export function mockPrisma() {
  const mockPrismaClient = createMockPrisma();
  
  vi.mock('@pointwise/lib/prisma', () => ({
    default: mockPrismaClient,
    prisma: mockPrismaClient,
  }));

  return mockPrismaClient;
}

