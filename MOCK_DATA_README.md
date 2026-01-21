# Mock Data System Documentation

This project now uses a comprehensive mock data system instead of making API calls to the backend. This allows for development and testing without requiring a running backend server.

## Login Credentials

The following credentials are set up for testing:

### Admin Login
- **Email:** `sandeep@suqesayarath.com`
- **Password:** `123456789`
- **Role:** ADMIN

### Staff Login
- **Email:** `staff1@hakim.com`
- **Password:** `123456789`
- **Role:** STAFF

### Customer Logins
- **Email:** `customer1@example.com`
- **Password:** `123456789`
- **Role:** CUSTOMER

- **Email:** `customer2@example.com`
- **Password:** `123456789`
- **Role:** CUSTOMER

## Mock Data Structure

### Users
- Admin user (Sandeep Suqesayarath)
- Staff user (Ahmed Hassan)
- Customer users (Omar Ali, Fatima Mahmoud)

### Vehicles
- Toyota Camry (2020) - Customer 1
- Honda CR-V (2021) - Customer 1
- Ford F-150 (2019) - Customer 2

### Service Requests
- Completed emergency service (Toyota Camry)
- In-progress tow service (Ford F-150)
- Pending emergency service (Honda CR-V)

### Staff
- Ahmed Hassan (Technician) - Active
- Mohammed Ibrahim (Driver) - Active

### Payments
- Completed payment for service request 1
- Pending payment for service request 2

## Modified Services

### Auth Service (`services/auth.ts`)
- Uses mock user data instead of API calls
- Validates credentials against predefined users
- Generates mock tokens for authentication

### Vehicle Service (`services/vehicles.ts`)
- Uses mock vehicle data instead of API calls
- Supports CRUD operations on mock data
- Filters vehicles by user ID

### Service Request Service (`services/service-requests.ts`)
- Uses mock service request data instead of API calls
- Supports CRUD operations on mock data
- Filters requests by user ID

## Mock Data Helpers

The `mockDataHelpers` object provides utility functions:

- `findUserByEmail(email)` - Find user by email
- `findUserById(id)` - Find user by ID
- `getVehiclesByUserId(userId)` - Get vehicles for a user
- `findVehicleById(id)` - Find vehicle by ID
- `getServiceRequestsByUserId(userId)` - Get service requests for a user
- `findServiceRequestById(id)` - Find service request by ID
- `findStaffById(id)` - Find staff by ID
- `getActiveStaff()` - Get all active staff
- `getPaymentsByServiceRequestId(id)` - Get payments for a service request
- `getSettingByKey(key)` - Get setting by key

## Testing

To test the mock data system, you can run the test script in the browser console:

```javascript
// Import and run the test
import { testMockDataSystem } from './test-mock-system';
testMockDataSystem();
```

Or use the global function if available:
```javascript
window.testMockDataSystem();
```

## Data Persistence

**Important:** The mock data is stored in memory and will be reset when the page is refreshed. In a real application, this data would be persisted to a database.

## Switching Back to API Calls

To switch back to using real API calls, simply revert the changes in:
- `services/auth.ts`
- `services/vehicles.ts`
- `services/service-requests.ts`

Remove the mock data imports and restore the original axios-based implementations.
