# Stripe API Endpoints - Frontend Documentation

## Overview

This document describes the Stripe-related API endpoints available for frontend integration, including pricing information and checkout session management.

## Authentication

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Get Available Prices

Retrieve all available subscription pricing options.

**Endpoint:** `GET /stripe/prices`

**Authentication:** Not required

**Response Format:**
```typescript
{
  monthly: {
    id: string;           // Price ID for monthly subscription
    interval: "month";    // Billing interval
    unit_amount: number;  // Amount in cents (e.g., 999 = $9.99)
    currency?: string;    // Currency code (e.g., "usd")
  },
  yearly: {
    id: string;           // Price ID for yearly subscription
    interval: "year";     // Billing interval
    unit_amount: number;  // Amount in cents (e.g., 9999 = $99.99)
    currency?: string;    // Currency code (e.g., "usd")
  }
}
```

**Example Request:**
```javascript
const response = await fetch('/api/stripe/prices', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

const prices = await response.json();
console.log(prices);
```

**Example Response:**
```json
{
  "monthly": {
    "id": "price_1234567890",
    "interval": "month",
    "unit_amount": 999,
    "currency": "usd"
  },
  "yearly": {
    "id": "price_0987654321",
    "interval": "year",
    "unit_amount": 9999,
    "currency": "usd"
  }
}
```

---

### 2. Create Checkout Session

Create a Stripe checkout session for subscription purchase.

**Endpoint:** `POST /stripe/checkout`

**Authentication:** Required (JWT token)

**Request Body:**
```typescript
{
  priceId: string;      // Required: The Stripe price ID
  successUrl?: string;  // Optional: URL to redirect after successful payment
  cancelUrl?: string;   // Optional: URL to redirect if payment is cancelled
  mode?: "payment" | "subscription" | "setup"; // Optional: Payment mode (defaults to "subscription")
}
```

**Response Format:**
```typescript
{
  sessionId: string;    // Stripe checkout session ID
  checkoutUrl: string;  // URL to redirect user for payment
  customerId: string;   // Stripe customer ID
  expiresAt: number;    // Session expiration timestamp
}
```

**Example Request:**
```javascript
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authToken
  },
  body: JSON.stringify({
    priceId: 'price_1234567890',
    successUrl: 'https://yourapp.com/success',
    cancelUrl: 'https://yourapp.com/cancel'
  })
});

const checkoutSession = await response.json();
// Redirect user to checkoutSession.checkoutUrl
window.location.href = checkoutSession.checkoutUrl;
```

**Example Response:**
```json
{
  "sessionId": "cs_test_1234567890",
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_1234567890",
  "customerId": "cus_1234567890",
  "expiresAt": 1642694400
}
```

---

## Frontend Integration Examples

### Complete Subscription Flow

```javascript
class SubscriptionService {
  constructor(baseUrl, authToken) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  // Step 1: Get available pricing plans
  async getPricingPlans() {
    try {
      const response = await fetch(`${this.baseUrl}/stripe/prices`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      throw error;
    }
  }

  // Step 2: Create checkout session and redirect to Stripe
  async subscribeToPlan(priceId) {
    try {
      const response = await fetch(`${this.baseUrl}/stripe/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          priceId,
          successUrl: window.location.origin + '/subscription/success',
          cancelUrl: window.location.origin + '/subscription/cancel'
        })
      });

      const session = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = session.checkoutUrl;
      
      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Step 3: Check session status (optional)
  async getSessionStatus(sessionId) {
    try {
      const response = await fetch(`${this.baseUrl}/stripe/checkout/session/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error checking session status:', error);
      throw error;
    }
  }
}

// Usage example
const subscriptionService = new SubscriptionService('/api', userToken);

// Load pricing plans
const plans = await subscriptionService.getPricingPlans();

// Subscribe to monthly plan
await subscriptionService.subscribeToPlan(plans.monthly.id);
```

### React Hook Example

```jsx
import { useState, useEffect } from 'react';

export function usePricingPlans() {
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch('/api/stripe/prices');
        const data = await response.json();
        setPlans(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  return { plans, loading, error };
}

export function useCheckout() {
  const [loading, setLoading] = useState(false);

  const createCheckoutSession = async (priceId, authToken) => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          priceId,
          successUrl: window.location.origin + '/success',
          cancelUrl: window.location.origin + '/cancel'
        })
      });

      const session = await response.json();
      window.location.href = session.checkoutUrl;
      
      return session;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createCheckoutSession, loading };
}
```

---

## Error Handling

All endpoints may return the following error responses:

### Common Error Responses

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**500 Internal Server Error:**
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

### Specific Checkout Errors

**Existing Active Subscription:**
```json
{
  "statusCode": 400,
  "message": "User already has an active subscription",
  "error": "Bad Request"
}
```

---

## Important Notes

1. **Currency:** All amounts are in cents (e.g., 999 = $9.99)
2. **Session Expiration:** Checkout sessions expire after 24 hours
3. **Authentication:** Checkout endpoints require valid JWT authentication
4. **HTTPS:** All requests must be made over HTTPS in production
5. **CORS:** Ensure your frontend domain is allowed in CORS configuration