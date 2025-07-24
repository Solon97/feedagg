# Stripe Integration Documentation

## Overview

This implementation integrates Stripe pricing and checkout functionality into the FeedAgg subscription page. The system dynamically fetches pricing data from Stripe and creates checkout sessions for user subscriptions.

## Architecture

### API Routes

#### `/api/stripe/prices` (GET)
- **Purpose**: Fetches active pricing plans from Stripe
- **Response**: Returns array of Stripe price objects with product details
- **Current Implementation**: Uses mock data matching the structure from `prices-response.json`
- **Future Enhancement**: Replace with actual Stripe API calls

#### `/api/stripe/checkout` (POST)
- **Purpose**: Creates a Stripe checkout session for a given price ID
- **Request Body**: `{ priceId: string }`
- **Response**: Returns checkout URL for redirect
- **Current Implementation**: Returns mock checkout URL
- **Future Enhancement**: Integrate with actual Stripe Checkout API

### Frontend Components

#### `hooks/use-stripe-prices.ts`
- **Purpose**: Custom hook for fetching and managing Stripe prices
- **Features**: 
  - Loading states
  - Error handling
  - Data caching
  - Refetch capability

#### `components/pricing-card.tsx`
- **Purpose**: Reusable pricing card component
- **Props**: 
  - `price`: Stripe price object
  - `isPopular`: Boolean for highlighting popular plans
  - `isLoading`: Loading state for individual cards
  - `features`: Array of feature strings
  - `onSubscribe`: Callback function for subscription action

#### `app/subscribe/page.tsx`
- **Purpose**: Main subscription page
- **Features**:
  - Dynamic pricing display based on Stripe data
  - Responsive grid layout for multiple plans
  - Loading and error states
  - Checkout flow initiation

### Type Definitions

#### `types/stripe.ts`
Contains TypeScript interfaces for:
- `StripeProduct`: Product information
- `StripePrice`: Price and billing details
- `StripeRecurring`: Subscription interval configuration
- `StripePricesResponse`: API response wrapper
- `StripeCheckoutResponse`: Checkout session response

## Data Flow

1. **Page Load**: `useStripePrices` hook calls `/api/stripe/prices`
2. **Price Display**: Fetched prices are mapped to `PricingCard` components
3. **User Subscription**: Click triggers `handleSubscribe` with price ID
4. **Checkout Creation**: API call to `/api/stripe/checkout` with price ID
5. **Redirect**: User is redirected to Stripe's hosted checkout page

## Pricing Logic

- **Popular Badge**: Yearly plans are automatically marked as "Most Popular"
- **Price Formatting**: Uses `Intl.NumberFormat` for currency display
- **Savings Display**: Shows percentage savings for annual plans
- **Feature Lists**: Consistent feature set across all plans

## Current Features

✅ Dynamic price fetching from API
✅ Responsive pricing card layout
✅ Loading and error states
✅ Mock Stripe checkout flow
✅ TypeScript type safety
✅ Clean component architecture
✅ Proper error handling

## Next Steps for Production

1. **Replace Mock Data**: Integrate with actual Stripe API
2. **Add Authentication**: Verify user authentication before checkout
3. **Webhook Handling**: Implement Stripe webhooks for subscription events
4. **Database Integration**: Store subscription status in database
5. **Success/Cancel Pages**: Create post-checkout pages
6. **Testing**: Add unit and integration tests

## Environment Variables Needed

```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Usage Example

```tsx
// The subscription page automatically handles the complete flow
// Users see dynamic pricing and can click to checkout
// No additional configuration needed for the frontend
```

## Error Handling

- **Network Errors**: Graceful fallback with error messages
- **API Failures**: User-friendly error display
- **Loading States**: Proper loading indicators during async operations
- **Validation**: Price ID validation before checkout creation
