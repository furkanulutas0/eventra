# Eventra Testing Guide

This document provides instructions on how to run tests for both the backend API and frontend client components of the Eventra application. The tests are designed to achieve 100% code coverage.

## Prerequisites

- Node.js (v16 or higher)
- npm or pnpm package manager

## Backend API Tests

The backend tests cover controllers, services, and middleware components. They use Vitest as the test runner and include mocks for Supabase, email services, and other external dependencies.

### Setup

1. Navigate to the API directory:
   ```bash
   cd api
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

### Running Tests

- Run all tests:
  ```bash
  npm test
  # or
  pnpm test
  ```

- Run tests in watch mode (for development):
  ```bash
  npm run test:watch
  # or
  pnpm run test:watch
  ```

- Generate coverage report:
  ```bash
  npm run test:coverage
  # or
  pnpm run test:coverage
  ```

### Test Structure

- `tests/setup.ts`: Contains global mocks and test utilities
- `tests/controllers/`: Tests for API controllers
- `tests/middleware/`: Tests for middleware functions
- `tests/services/`: Tests for service modules

## Frontend Client Tests

The frontend tests cover API client functions, components, and utilities. They use Vitest with React Testing Library and include mocks for API calls and browser APIs.

### Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

### Running Tests

- Run all tests:
  ```bash
  npm test
  # or
  pnpm test
  ```

- Run tests in watch mode (for development):
  ```bash
  npm run test:watch
  # or
  pnpm run test:watch
  ```

- Generate coverage report:
  ```bash
  npm run test:coverage
  # or
  pnpm run test:coverage
  ```

### Test Structure

- `src/tests/setup.ts`: Contains global mocks and test utilities
- `src/tests/api/`: Tests for API client functions
- `src/tests/components/`: Tests for React components (to be implemented)
- `src/tests/utils/`: Tests for utility functions (to be implemented)

## Test Coverage

The test suite is designed to achieve 100% code coverage by testing:

- **Backend API**:
  - Authentication functionality (signup, signin, signout)
  - Event management (create, read, update, delete)
  - User management
  - Error handling middleware
  - API authentication middleware
  - Email service

- **Frontend Client**:
  - API client functions for user authentication
  - API client functions for event management
  - Component rendering and interactions (to be implemented)
  - Utility functions (to be implemented)

## Extending Tests

### Adding Backend Tests

1. Create a new test file in the appropriate directory under `api/tests/`
2. Import the necessary mocks from `../setup`
3. Use the Vitest `describe` and `it` functions to structure your tests
4. Mock Supabase responses as needed using the pattern in existing tests

### Adding Frontend Tests

1. Create a new test file in the appropriate directory under `client/src/tests/`
2. Import React Testing Library utilities as needed
3. Mock API responses using the Vitest `vi.mock()` function
4. Test component rendering, user interactions, and state changes

## Troubleshooting

- If you encounter issues with TypeScript types, ensure that all type definitions are installed:
  ```bash
  npm install --save-dev @types/react @types/react-dom
  # or
  pnpm add -D @types/react @types/react-dom
  ```

- For test failures related to mocked functions, check that the mock implementation matches the expected interface of the real function. 