# 1. Introduction
This document provides detailed test cases for the project based on unit and integration tests. It captures all possible use cases to ensure the system works as intended.

# 2. Testing and Evaluation

## 6.1.2. Unit Testing

### Unit Testing 1: Product Image Update API
**Testing Objective:** To ensure product images update API works correctly with authorization and proper update behavior.

| No. | Test case/Test script                                         | Attribute and value                             | Expected result                                                       | Result |
|-----|--------------------------------------------------------------|------------------------------------------------|----------------------------------------------------------------------|--------|
| 1   | Verify authorized update with correct admin secret           | Header: x-admin-secret = 'dev-secret' or env   | Product images updated, status 200, message 'Image update completed' | Pass   |
| 2   | Verify unauthorized access without admin secret              | No header                                        | Status 401 Unauthorized error                                        | Pass   |
| 3   | Verify unauthorized access with wrong admin secret           | Header: wrong secret                             | Status 401 Unauthorized error                                        | Pass   |
| 4   | Handle database failure during update                         | Simulate DB failure                             | Status 500 with error message                                        | Pass   |

### Unit Testing 2: Orders API

#### GET /api/orders
| No. | Test case/Test script               | Attribute and value | Expected result                               | Result |
|-----|----------------------------------|--------------------|-----------------------------------------------|--------|
| 1   | Retrieve all orders successfully  | N/A                | Status 200 with list of orders                | Pass   |
| 2   | Handle database failure           | Simulate DB failure | Status 500 with 'Failed to load orders' error| Pass   |

#### POST /api/orders (Create Order)
| No. | Test case/Test script                                          | Attribute and value                                          | Expected result                                                     | Result |
|-----|---------------------------------------------------------------|-------------------------------------------------------------|-------------------------------------------------------------------|--------|
| 1   | Valid order creation with valid name, address, and items      | Valid JSON body with name, address, array of items, total   | Status 201 with order info and 'Order placed...' message          | Pass   |
| 2   | Missing name or address                                        | Invalid JSON missing 'name' or 'address'                    | Status 400 with 'Invalid order data' error                        | Pass   |
| 3   | Empty items array                                             | Items: []                                                  | Status 400 with 'Invalid order data' error                        | Pass   |
| 4   | Product not found                                             | Items contains product id not in DB                         | Status 400 with 'Product [name] not found' error                 | Pass   |
| 5   | Insufficient stock for product                                | Items contains qty > product stock                          | Status 400 with 'Insufficient stock for [name]' error            | Pass   |
| 6   | Stock decrement on successful order                           | Product stock decremented by qty                             | Product stock reduced, order created successfully                 | Pass   |
| 7   | Payment simulation success (90% chance)                       | Payment simulation returns success                           | Order status updated to 'paid' asynchronously                     | Pass   |
| 8   | Payment simulation failure (10% chance)                       | Payment simulation fails                                     | Order status updated to 'failed' asynchronously                   | Pass   |

#### PUT /api/orders (Update Order Status)
| No. | Test case/Test script                           | Attribute and value                                   | Expected result                                      | Result |
|-----|------------------------------------------------|------------------------------------------------------|----------------------------------------------------|--------|
| 1   | Valid status update                             | Valid order id and status ('pending', 'paid', 'failed') | Status 200 with updated order                        | Pass   |
| 2   | Missing id or status                            | Missing 'id' or 'status'                              | Status 400 with 'Order ID and status are required' error | Pass   |
| 3   | Invalid status value                            | status not in valid list                              | Status 400 with 'Invalid status' error              | Pass   |
| 4   | Order not found for provided id                 | Non-existing order id                                 | Status 404 with 'Order not found' error             | Pass   |
| 5   | Database failure during status update          | Simulate DB failure                                   | Status 500 with 'Failed to update order' error      | Pass   |

### Unit Testing 3: Middleware Authentication and Authorization
| No. | Test case/Test script                         | Attribute and value           | Expected result                                    | Result |
|-----|----------------------------------------------|------------------------------|--------------------------------------------------|--------|
| 1   | No token present in cookies                   | No token                     | Redirect to "/" home                              | Pass   |
| 2   | Invalid token present                         | Malformed or expired token    | Redirect to "/" home                              | Pass   |
| 3   | Valid token with admin role accessing admin   | Role: "admin", path /admins/* | Allow access                                      | Pass   |
| 4   | Valid token with non-admin role on admin path | Role: not admin, path /admins/*| Redirect to "/" home                              | Pass   |
| 5   | Valid teacher token accessing teacher routes  | Role: "teacher", path /teachers/* | Allow access                                    | Pass   |
| 6   | Valid student token accessing student routes  | Role: "student", path /students/* | Allow access                                    | Pass   |
| 7   | Student token accessing management API (/api/students/*) | Role: "student", path /api/students/* | Redirect to "/" home                    | Pass   |
| 8   | Student at /students redirected to /students/dashboard | Role: "student", path /students | Redirect to /students/dashboard                 | Pass   |

## 6.1.3. Functional Testing (Integration Testing)

### Functional Testing 1: Login and Role-Based Navigation
| No. | Test case/Test script                           | Attribute and value                           | Expected result                                    | Result |
|-----|------------------------------------------------|----------------------------------------------|--------------------------------------------------|--------|
| 1   | Login as Admin user                             | Valid admin credentials                        | Redirected to admin dashboard                      | Pass   |
| 2   | Login as Teacher user                           | Valid teacher credentials                      | Redirected to teacher dashboard                    | Pass   |
| 3   | Login as Student user                           | Valid student credentials                      | Redirected to student dashboard                    | Pass   |
| 4   | Login with invalid credentials                  | Incorrect username/password                    | Show login error message                           | Pass   |

### Functional Testing 2: Product Image Update API Integration
| No. | Test case/Test script                                                   | Attribute and value         | Expected result                                          | Result |
|-----|------------------------------------------------------------------------|----------------------------|----------------------------------------------------------|--------|
| 1   | Successful update of product images with valid admin secret             | Correct admin secret header | Status 200 with updatedCount > 0                          | Pass   |
| 2   | Access denied with invalid / missing admin secret                       | Missing or invalid secret   | Status 401 Unauthorized                                   | Pass   |

### Functional Testing 3: Order Placement and Status Updates Integration
| No. | Test case/Test script                                            | Attribute and value                 | Expected result                                          | Result |
|-----|-----------------------------------------------------------------|----------------------------------|---------------------------------------------------------|--------|
| 1   | Place valid order and verify stock update                       | Valid order data                  | Status 201, order created, stock decremented            | Pass   |
| 2   | Attempt order with insufficient stock                          | Order items qty exceeds stock    | Status 400 with 'Insufficient stock' message            | Pass   |
| 3   | Verify payment success updates order status to 'paid'         | Simulate payment success          | Order in DB updated with status 'paid'                   | Pass   |
| 4   | Verify payment failure updates order status to 'failed'        | Simulate payment failure          | Order in DB updated with status 'failed'                 | Pass   |
| 5   | Update order status to valid status                             | Valid order ID and status         | Status 200 with updated order                             | Pass   |
| 6   | Update order status with invalid status                         | Invalid status                    | Status 400 with 'Invalid status' error                    | Pass   |

# End of Test Cases Document
