# TODO: Fix Order Details Not Showing on Admin Side

## Information Gathered
- **Order Model (`models/Order.js`)**: Orders have `items` array with product refs, but not populated in API.
- **API Routes**:
  - `app/api/orders/route.js`: GET fetches all orders but uses `.lean()`, so product refs in items are not populated (only IDs).
  - `app/api/orders/[id]/route.js`: GET fetches single order, also not populated.
- **Admin Dashboard (`app/admins/dashboard/page.jsx`)**: Orders tab shows basic info (ID, customer, total, status, date). "View" button does nothing. No display of ordered items or detailed order info. Data fetches correctly but lacks population of product details in items.

## Plan
- **Update GET API**: Modify `app/api/orders/route.js` GET to populate product details in order items (e.g., name, price) for display.
- **Enhance Dashboard Orders Tab**: Add functionality to "View" button to show order details in a modal, including:
  - Customer name, address, total, status, date.
  - List of items with product name, qty, size, price.
- **Optional: Update Single Order API**: If needed, update `app/api/orders/[id]/route.js` to also populate for consistency.

## Dependent Files to Edit
- `app/api/orders/route.js`: Update GET to populate product in items.
- `app/admins/dashboard/page.jsx`: Add modal for viewing order details, triggered by "View" button.

## Followup Steps
- [x] Updated `app/api/orders/route.js` to populate product details in order items.
- [x] Added order details modal to `app/admins/dashboard/page.jsx` with "View" button functionality.
- [x] Updated fallback mock data in dashboard to include populated order items for testing.
- Test: Create an order from customer side, check admin dashboard orders tab shows the order with details accessible via "View".
- Run the application locally to ensure no errors.
- If issues persist, check console for API errors or add logging.
