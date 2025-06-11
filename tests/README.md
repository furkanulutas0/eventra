# 🧪 Eventra Boundary Value Testing Suite

This directory contains comprehensive boundary value tests for the Eventra event management application. Boundary value testing focuses on testing the limits and edge cases of input domains to ensure robust application behavior.

## 📁 Directory Structure

```
tests/
├── boundary-value/           # Boundary value test files
│   ├── email-validation.test.ts      # Email format validation tests
│   ├── event-validation.test.ts      # Event creation/update validation tests
│   ├── time-validation.test.ts       # Date/time validation tests
│   ├── utility-functions.test.ts     # Utility function tests
│   └── api-endpoints.test.ts          # API endpoint boundary tests
├── utils/                    # Test utilities and helpers
│   └── validation.utils.ts           # Extracted validation functions
├── setup/                    # Test setup and configuration
│   └── test-setup.ts                 # Global test setup and mocks
├── run-boundary-tests.ts     # Comprehensive test runner
└── README.md                 # This file
```

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Run All Boundary Value Tests
```bash
npm run test:boundary
```

### Run Tests in Watch Mode
```bash
npm run test:boundary:watch
```

### Run Individual Test Suites
```bash
# Email validation tests
npx vitest tests/boundary-value/email-validation.test.ts

# Event validation tests
npx vitest tests/boundary-value/event-validation.test.ts

# Time validation tests
npx vitest tests/boundary-value/time-validation.test.ts

# Utility function tests
npx vitest tests/boundary-value/utility-functions.test.ts

# API endpoint tests
npx vitest tests/boundary-value/api-endpoints.test.ts
```

## 📋 Test Coverage

### 1. Email Validation Tests (`email-validation.test.ts`)
Tests email format validation with boundary conditions:
- **Valid Formats**: Standard emails, subdomains, special characters
- **Invalid Formats**: Missing @, multiple @, invalid domains
- **Length Boundaries**: Minimum (5 chars) and maximum (254 chars) lengths
- **Edge Cases**: Empty strings, whitespace, special character combinations

### 2. Event Validation Tests (`event-validation.test.ts`)
Tests event creation and update validation:
- **Title Validation**: Length boundaries (1-100 chars), special characters
- **Description Validation**: Length boundaries (0-1000 chars), HTML content
- **Date Validation**: Past dates, future dates, invalid formats
- **Time Validation**: Valid/invalid time formats, time conflicts
- **Capacity Validation**: Minimum (1), maximum (10000), negative values
- **Location Validation**: Length boundaries, special characters

### 3. Time Validation Tests (`time-validation.test.ts`)
Tests date and time-related validations:
- **Time Conflict Detection**: Overlapping events, adjacent events
- **Past Date Detection**: Current date, past dates, future dates
- **Past Time Detection**: Current time, past times, future times
- **Time Slot Validation**: Valid gaps, insufficient gaps, edge cases

### 4. Utility Functions Tests (`utility-functions.test.ts`)
Tests utility functions with boundary conditions:
- **Random String Generation**: Length boundaries (1-100), character sets
- **Password Validation**: Length, complexity, special characters
- **Name Validation**: Length boundaries, special characters, unicode
- **1:1 Event Validation**: Participant limits, time constraints

### 5. API Endpoints Tests (`api-endpoints.test.ts`)
Tests API endpoint boundary conditions:
- **Authentication**: Registration, login, password reset
- **Event Management**: Create, update, delete operations
- **User Management**: Profile updates, avatar uploads
- **Input Validation**: Length limits, required fields, data types

## 🔧 Configuration

### Vitest Configuration (`vitest.config.ts`)
- **Environment**: jsdom for DOM testing
- **Coverage**: v8 provider with detailed reporting
- **Path Aliases**: Configured for client-side imports
- **Test Files**: Matches `*.test.ts` and `*.spec.ts` patterns

### Test Setup (`setup/test-setup.ts`)
- **Environment Variables**: Mocked for testing
- **External Dependencies**: Supabase, bcrypt, date-fns mocks
- **Global Utilities**: Toast notifications, DOM utilities

## 📊 Test Reports

### Console Report
Running `npm run test:boundary` generates a detailed console report with:
- Individual test suite results
- Pass/fail statistics
- Execution times
- Overall success rate

### HTML Report
An interactive HTML report (`boundary-test-report.html`) is generated with:
- Visual progress bars
- Detailed metrics
- Responsive design
- Timestamp information

## 🎯 Boundary Value Testing Principles

### What We Test
1. **Minimum Values**: Smallest acceptable inputs
2. **Maximum Values**: Largest acceptable inputs
3. **Just Below Minimum**: Values that should fail
4. **Just Above Maximum**: Values that should fail
5. **Edge Cases**: Special characters, empty values, null/undefined
6. **Invalid Formats**: Malformed data, wrong types

### Why It Matters
- **Robustness**: Ensures application handles edge cases gracefully
- **Security**: Prevents injection attacks and data corruption
- **User Experience**: Provides clear validation messages
- **Reliability**: Reduces production bugs and crashes

## 🛠️ Adding New Tests

### 1. Create Test File
```typescript
// tests/boundary-value/new-feature.test.ts
import { describe, it, expect } from 'vitest';
import { yourValidationFunction } from '../utils/validation.utils';

describe('New Feature Boundary Tests', () => {
  describe('Input Validation', () => {
    it('should accept minimum valid input', () => {
      // Test minimum boundary
    });
    
    it('should accept maximum valid input', () => {
      // Test maximum boundary
    });
    
    it('should reject below minimum input', () => {
      // Test below minimum
    });
    
    it('should reject above maximum input', () => {
      // Test above maximum
    });
  });
});
```

### 2. Add Validation Utility
```typescript
// tests/utils/validation.utils.ts
export const yourValidationFunction = (input: string): boolean => {
  // Extract validation logic from your component/API
  return input.length >= 1 && input.length <= 100;
};
```

### 3. Update Test Runner
Add your new test file to the `testSuites` array in `run-boundary-tests.ts`.

## 🔍 Debugging Failed Tests

### Common Issues
1. **Mock Configuration**: Ensure all external dependencies are properly mocked
2. **Path Aliases**: Verify import paths match your project structure
3. **Environment Variables**: Check that required env vars are mocked
4. **Async Operations**: Use proper async/await patterns

### Debug Commands
```bash
# Run with verbose output
npx vitest tests/boundary-value/your-test.test.ts --reporter=verbose

# Run single test with debugging
npx vitest tests/boundary-value/your-test.test.ts --run --reporter=verbose

# Check coverage for specific file
npx vitest tests/boundary-value/your-test.test.ts --coverage
```

## 📚 Best Practices

### Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names that explain the boundary being tested
- Include both positive and negative test cases
- Test edge cases and error conditions

### Assertion Patterns
```typescript
// Good: Specific boundary testing
expect(validateEmail('a@b.co')).toBe(true); // Minimum valid
expect(validateEmail('a'.repeat(250) + '@b.co')).toBe(false); // Too long

// Good: Error message testing
expect(() => validateEvent(invalidEvent)).toThrow('Title is required');

// Good: Multiple assertions for complex objects
const result = validateEventData(eventData);
expect(result.isValid).toBe(false);
expect(result.errors).toContain('Invalid date format');
```

### Performance Considerations
- Use `vi.fn()` for mocking expensive operations
- Avoid real API calls in boundary tests
- Keep test data minimal but representative
- Use `beforeEach` for common setup

## 🤝 Contributing

When adding new boundary value tests:
1. Follow the existing file structure and naming conventions
2. Include comprehensive edge case coverage
3. Add clear documentation for complex test scenarios
4. Update this README if adding new test categories
5. Ensure all tests pass before submitting

## 📞 Support

For questions about the testing setup or specific test failures:
1. Check the console output for detailed error messages
2. Review the HTML report for visual test results
3. Examine the test setup files for mock configurations
4. Refer to the Vitest documentation for advanced features

---

**Happy Testing! 🎉**

Remember: Good boundary value tests today prevent production bugs tomorrow. 