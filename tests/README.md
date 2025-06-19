# Service Provider Registration Test Suite

This comprehensive test suite validates the complete service provider registration flow, ensuring data integrity, proper error handling, and performance standards.

## Test Coverage

### 1. Successful Registration Flow
- ✅ Complete account creation with all required records
- ✅ Database state verification (auth, profiles, service_providers tables)
- ✅ Foreign key relationship validation
- ✅ Response time performance testing

### 2. Data Validation & Error Handling
- ✅ Missing required fields validation
- ✅ Invalid email format rejection
- ✅ Password strength requirements
- ✅ Duplicate email handling
- ✅ Invalid data format rejection

### 3. Transaction Integrity
- ✅ Rollback on profile creation failure
- ✅ Rollback on service provider creation failure
- ✅ No orphaned records verification
- ✅ Complete cleanup on any failure

### 4. Concurrent Operations
- ✅ Multiple simultaneous registration attempts
- ✅ Race condition handling
- ✅ Database lock management

### 5. Performance Benchmarks
- ✅ Average response time < 5 seconds
- ✅ Maximum response time < 10 seconds
- ✅ Success rate monitoring
- ✅ Performance regression detection

### 6. Data Constraints & Types
- ✅ Proper data type enforcement
- ✅ Business rule validation
- ✅ Optional field default handling
- ✅ Database constraint compliance

## Running the Tests

### Prerequisites
```bash
npm install --save-dev jest @jest/globals jest-expo babel-jest
```

### Environment Setup
Create a `.env.test` file:
```
EXPO_PUBLIC_SUPABASE_URL=your_test_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_test_anon_key
NODE_ENV=test
```

### Execute Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test serviceProviderRegistration.test.ts

# Run with verbose output
VERBOSE_TESTS=true npm test

# Run performance tests only
npm test -- --testNamePattern="Performance"
```

## Test Data Management

### Cleanup Strategy
- Automatic cleanup before and after each test
- Comprehensive cleanup of auth users, profiles, and service provider records
- Graceful handling of cleanup failures

### Test Data Isolation
- Unique email addresses for each test run
- Timestamp-based test data generation
- No shared state between tests

## Performance Metrics

### Acceptable Thresholds
- **Average Response Time**: < 5 seconds
- **Maximum Response Time**: < 10 seconds
- **Success Rate**: > 95%
- **Concurrent Registration Handling**: 3+ simultaneous requests

### Monitoring
- Response time tracking for each operation
- Success/failure rate calculation
- Performance regression alerts
- Database operation timing

## Error Scenarios Tested

### Validation Errors
- Missing email, name, password
- Invalid email format
- Password too short
- Missing business information
- Invalid address data

### System Errors
- Database connection failures
- Transaction rollback scenarios
- Concurrent access conflicts
- Network timeout handling

### Edge Cases
- Duplicate registration attempts
- Partial data corruption
- Race conditions
- Resource exhaustion

## Database Verification

### Tables Checked
1. **auth.users** - Authentication records
2. **profiles** - User profile data
3. **service_providers** - Service provider specific data

### Relationships Verified
- profiles.id = auth.users.id
- service_providers.user_id = profiles.id
- Proper foreign key constraints

### Data Integrity Checks
- All required fields populated
- Correct data types and formats
- Business rule compliance
- No orphaned records

## Continuous Integration

### Test Automation
- Automated test execution on code changes
- Performance regression detection
- Coverage threshold enforcement
- Failure notification system

### Quality Gates
- Minimum 70% code coverage
- All tests must pass
- Performance thresholds met
- No critical security issues

## Troubleshooting

### Common Issues
1. **Test Database Connection**: Verify test environment variables
2. **Cleanup Failures**: Check database permissions
3. **Performance Issues**: Monitor database load
4. **Flaky Tests**: Review test isolation

### Debug Mode
```bash
# Enable detailed logging
DEBUG=true VERBOSE_TESTS=true npm test

# Run single test with debugging
npm test -- --testNamePattern="specific test" --verbose
```

## Contributing

### Adding New Tests
1. Follow existing test structure
2. Include proper cleanup
3. Add performance assertions
4. Document test purpose
5. Update coverage requirements

### Test Naming Convention
- Descriptive test names
- Group related tests in describe blocks
- Use consistent terminology
- Include expected behavior in name