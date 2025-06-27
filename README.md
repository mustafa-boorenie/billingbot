# MBOperator - Playwright Test Automation

This project contains automated tests using Playwright for web automation testing.

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)

## Project Setup

1. Clone the repository:
```bash
git clone [your-repository-url]
cd MBOperator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the project root
   - Add your credentials:
```
USERNAME=your_username
PASSWORD=your_password
```

## Project Structure

```
MBOperator/
├── tests/                  # Test files directory
│   └── example.spec.ts     # Example test
├── tests-examples/         # Playwright example tests
├── playwright.config.ts    # Playwright configuration
├── package.json           # Project dependencies
└── .env                   # Environment variables (not in git)
```

## Running Tests

You can run tests using the following commands:

1. Run all tests:
```bash
npx playwright test
```

2. Run a specific test file:
```bash
npx playwright test tests/example.spec.ts
```

3. Run tests in UI mode (recommended for test development):
```bash
npx playwright test --ui
```

4. Run tests with browser visible:
```bash
npx playwright test --headed
```

5. Run tests and generate HTML report:
```bash
npx playwright test --reporter=html && npx playwright show-report
```

## Test Reports

After test execution, you can view the HTML report:
```bash
npx playwright show-report
```

## Debugging

1. Use UI Mode for interactive debugging:
```bash
npx playwright test --ui
```

2. Use Debug Mode for step-by-step execution:
```bash
npx playwright test --debug
```

## Best Practices

1. Keep sensitive data in `.env` file
2. Use meaningful test descriptions
3. Use appropriate selectors (prefer data-testid, id, or role)
4. Keep tests independent and atomic
5. Clean up test data after execution

## Contributing

1. Create a new branch for your changes
2. Write or update tests
3. Ensure all tests pass
4. Submit a pull request

## Notes

- The `.env` file is not committed to version control for security
- Make sure to update environment variables as needed
- Keep the test files organized and well-documented
