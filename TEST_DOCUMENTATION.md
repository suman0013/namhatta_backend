# Frontend Automation Test Suite

## Overview
This comprehensive test suite covers all frontend functionality of the Namhatta Management System. The tests are organized by component and feature area, ensuring thorough coverage of user interactions, API integrations, and UI behavior.

## Test Structure

### Setup and Configuration
- **Test Framework**: Vitest with React Testing Library
- **Test Environment**: Happy DOM for fast, lightweight testing
- **Mocking**: Comprehensive mocking of all external dependencies
- **Coverage**: All major components and user flows

### Test Categories

#### 1. Page Tests
- **Dashboard.test.tsx**: Tests dashboard statistics, recent updates, status distribution, and navigation
- **Devotees.test.tsx**: Tests devotee listing, filtering, sorting, and navigation
- **Namhattas.test.tsx**: Tests namhatta listing, filtering, sorting, and CRUD operations
- **Updates.test.tsx**: Tests update listing, filtering, statistics, and event status
- **Map.test.tsx**: Tests interactive map functionality and geographic data visualization
- **Hierarchy.test.tsx**: Tests leadership hierarchy display and collapsible sections

#### 2. Form Tests
- **DevoteeForm.test.tsx**: Tests devotee form validation, submission, and data handling
- **NamhattaForm.test.tsx**: Tests namhatta form validation, submission, and address handling

#### 3. Integration Tests
- **App.test.tsx**: Tests overall application routing, navigation, and theme handling

#### 4. Utility Tests
- **test-utils.tsx**: Provides testing utilities, mock data generators, and helper functions

## Test Coverage

### Dashboard Page
- ✅ Statistics cards rendering and data display
- ✅ Recent updates section with proper formatting
- ✅ Status distribution chart and data
- ✅ Leadership hierarchy display
- ✅ Navigation to other pages
- ✅ Loading and error states
- ✅ Clickable statistics cards

### Devotees Page
- ✅ Devotee listing with proper information display
- ✅ Search functionality across devotee names
- ✅ Sorting by name and creation date
- ✅ Status badge display
- ✅ Occupation and location information
- ✅ Navigation to devotee detail pages
- ✅ Loading, error, and empty states
- ✅ Filter functionality

### Namhattas Page
- ✅ Namhatta listing with descriptions and details
- ✅ Search functionality across namhatta names
- ✅ Sorting by name, creation date, and updated date
- ✅ Geographic filtering (country, state, district)
- ✅ Add new namhatta dialog
- ✅ Navigation to namhatta detail pages
- ✅ Loading, error, and empty states
- ✅ Devotee count display

### Updates Page
- ✅ Update listing with event details
- ✅ Statistics cards (total updates, attendees, books, prasadam)
- ✅ Search functionality across update titles
- ✅ Filtering by namhatta and type
- ✅ Event status badges (Past, Today, Future)
- ✅ Activity badges (Kirtan, Arati, Bhagwat Path)
- ✅ Special attractions display
- ✅ Navigation to namhatta detail pages
- ✅ Loading, error, and empty states

### Map Page
- ✅ Interactive map rendering
- ✅ Geographic data markers
- ✅ Zoom controls and functionality
- ✅ Geographic hierarchy switching
- ✅ Marker click interactions
- ✅ Legend and data visualization
- ✅ Loading and error states

### Hierarchy Page
- ✅ Leadership hierarchy display in proper order
- ✅ Collapsible district supervisors section
- ✅ Responsive grid layout
- ✅ Role titles and locations
- ✅ Connection lines between levels
- ✅ Expand/collapse functionality
- ✅ Loading and error states

### Form Testing
- ✅ DevoteeForm: Field validation, required fields, email/phone validation
- ✅ DevoteeForm: Form submission, loading states, error handling
- ✅ DevoteeForm: Address copying, initiated name conditional display
- ✅ NamhattaForm: Field validation, address validation, leadership roles
- ✅ NamhattaForm: Form submission, loading states, error handling
- ✅ NamhattaForm: Postal code validation, shraddhakutir selection

### Integration Testing
- ✅ App routing and navigation
- ✅ Theme switching functionality
- ✅ Mobile navigation menu
- ✅ Toast notifications
- ✅ Scroll to top functionality
- ✅ 404 page handling

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests once with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run specific test file
npm test Dashboard.test.tsx

# Run tests matching pattern
npm test --grep "should render"
```

### Test Configuration
The tests use the following configuration:
- **Environment**: Happy DOM for fast browser simulation
- **Globals**: `vi`, `describe`, `it`, `expect` available globally
- **Setup**: Comprehensive mocking of all external dependencies
- **Coverage**: Istanbul coverage reporting

### Mock Strategy
All external dependencies are mocked including:
- React Query for API state management
- Wouter for routing
- Lucide React for icons
- Recharts for data visualization
- React Simple Maps for geographic visualization
- Framer Motion for animations
- Date-fns for date formatting

## Test Utilities

### Mock Data Generators
- `mockDevotee()`: Generates realistic devotee data
- `mockNamhatta()`: Generates realistic namhatta data
- `mockUpdate()`: Generates realistic update data
- `mockApiResponse`: Complete API response mocks

### Helper Functions
- `fillForm()`: Fills form fields with test data
- `selectOption()`: Selects dropdown options
- `submitForm()`: Submits forms
- `waitForLoadingToFinish()`: Waits for async operations

### Custom Render
- Wraps components with necessary providers
- Provides query client for API testing
- Handles theme and tooltip providers

## Test Patterns

### API Testing
```typescript
// Mock API responses
vi.mocked(useQuery).mockImplementation(({ queryKey }) => {
  const key = queryKey[0] as string
  if (key === '/api/devotees') {
    return { data: mockDevotees, isLoading: false, error: null }
  }
  return { data: null, isLoading: false, error: null }
})
```

### Form Testing
```typescript
// Test form validation
fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'invalid-email' } })
fireEvent.click(screen.getByRole('button', { name: /save/i }))
expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
```

### Navigation Testing
```typescript
// Test navigation
const mockSetLocation = vi.fn()
vi.mocked(useLocation).mockReturnValue(['/', mockSetLocation])
fireEvent.click(screen.getByText('Total Devotees'))
expect(mockSetLocation).toHaveBeenCalledWith('/devotees')
```

## Coverage Goals
- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

## Best Practices
1. **Test user behavior**, not implementation details
2. **Mock external dependencies** to ensure isolated testing
3. **Test error states** and edge cases
4. **Use meaningful test descriptions** that explain expected behavior
5. **Group related tests** with describe blocks
6. **Clean up after tests** to prevent interference
7. **Test accessibility** with proper ARIA labels and roles

## Maintenance
- Tests are automatically run on CI/CD pipeline
- Regular review of test coverage reports
- Update tests when components change
- Add new tests for new features
- Refactor tests when code structure changes

This comprehensive test suite ensures the Namhatta Management System frontend is thoroughly tested, maintainable, and reliable for users.