# PM Request Namespace Tests

This directory contains all tests for the `pm.request` object and its sub-properties.

## Directory Structure

```
request/
├── basic.spec.ts           - Core pm.request object coverage
├── mutations.spec.ts       - Request-level mutations (method, body, auth)
├── url/
│   ├── helper-methods.spec.ts  - URL helper methods (getHost, getPath, etc.)
│   └── properties.spec.ts      - URL properties (hostname, hash)
├── query/
│   └── propertylist.spec.ts    - Query parameter PropertyList methods
└── headers/
    └── propertylist.spec.ts    - Headers PropertyList methods
```

## Test Organization

### **basic.spec.ts** (3 tests)
Tests fundamental `pm.request` object access:
- URL access via `pm.request.url`
- Method access via `pm.request.method`
- Headers access via `pm.request.headers`

### **mutations.spec.ts** (30 tests)
Tests request mutation capabilities:
- URL property mutations (protocol, host, path, port)
- Query parameter mutations (add, remove)
- Method mutations
- Header mutations (add, upsert, remove)
- Body mutations
- Auth mutations

### **url/helper-methods.spec.ts** (24 tests)
Tests Postman-compatible URL helper methods:
- `getHost()` - Returns hostname as string
- `getPath()` - Returns path with leading slash
- `getPathWithQuery()` - Returns path + query string
- `getQueryString()` - Returns query string without `?`
- `getRemote()` - Returns host with optional port
- `update()` - Replaces entire URL
- `addQueryParams()` - Adds multiple query parameters
- `removeQueryParams()` - Removes query parameters

### **url/properties.spec.ts** (13 tests)
Tests URL property getters/setters:
- `hostname` - String alias for host array
- `hash` - URL fragment support
- Property synchronization tests

### **query/propertylist.spec.ts** (27 tests)
Tests Postman PropertyList API for query parameters:
- `get()`, `has()` - Parameter access
- `upsert()`, `clear()` - Parameter manipulation
- `each()`, `map()`, `filter()` - Iteration methods
- `count()`, `idx()` - Collection access
- `toObject()` - Conversion method
- Duplicate key handling (converts to arrays)

### **headers/propertylist.spec.ts** (26 tests)
Tests Postman PropertyList API for headers:
- `each()`, `map()`, `filter()` - Iteration methods
- `count()`, `idx()` - Collection access
- `clear()`, `toObject()` - Collection manipulation

## Test Patterns

All tests follow consistent patterns:

### Pre-Request Script Testing
```typescript
return expect(
  runPreRequestScript(
    `
    // Script code here
    console.log("Result:", value)
    `,
    { envs, request: baseRequest }
  )
).resolves.toEqualRight(
  expect.objectContaining({
    updatedRequest: expect.objectContaining({ /* ... */ }),
    consoleEntries: expect.arrayContaining([ /* ... */ ]),
  })
)
```

### Post-Request Script Testing
```typescript
return expect(
  runTestScript(
    `
    pw.expect(value).toBe(expectedValue)
    `,
    { envs, request, response }
  )
).resolves.toEqualRight([
  expect.objectContaining({
    expectResults: [
      { status: "pass", message: "..." },
    ],
  }),
])
```

## Running Tests

```bash
# Run all request tests
pnpm test -- src/__tests__/pm-namespace/request/

# Run specific subdirectory
pnpm test -- src/__tests__/pm-namespace/request/url/

# Run specific file
pnpm test -- src/__tests__/pm-namespace/request/url/helper-methods.spec.ts

# Run with filter
pnpm test -- src/__tests__/pm-namespace/request/ -t "getHost"
```

## Maintenance Notes

### When Adding New Tests

1. **URL-related tests**: Add to `url/` subdirectory
2. **Query-related tests**: Add to `query/` subdirectory
3. **Headers-related tests**: Add to `headers/` subdirectory
4. **Request-level tests**: Add to `mutations.spec.ts` or `basic.spec.ts`

### Test Naming Conventions

- Use descriptive test names that include the method being tested
- Group related tests in `describe` blocks
- Separate positive and negative test cases
- Include edge cases (empty values, null, undefined)

### Keep Tests Focused

- Each test should validate ONE specific behavior
- Avoid testing multiple methods in a single test
- Use `beforeEach` for common setup when appropriate
- Keep test files under 1000 lines (split if needed)

## Related Documentation

- [PM Namespace Overview](../README.md)
- [Postman Collection SDK](https://www.postmanlabs.com/postman-collection/)
- [PropertyList Documentation](https://www.postmanlabs.com/postman-collection/PropertyList.html)
