# Steadfast Courier Integration Setup

This document explains how to set up and use the Steadfast Courier integration in your admin panel.

## Configuration

### Setting Up API Credentials

You can configure your Steadfast Courier API credentials directly from the admin panel:

1. Navigate to **Admin Panel** → **Settings**
2. Click on the **"Steadfast Courier"** tab
3. Enter your API credentials:
   - **API Key**: Your unique API key provided by Steadfast Courier
   - **Secret Key**: Your secret key for authentication
4. Click **"Save Changes"** to save your credentials

### How to Get Your API Credentials

1. Contact Steadfast Courier Ltd. to get your API credentials
2. They will provide you with:
   - **Api-Key**: Your unique API key
   - **Secret-Key**: Your secret key for authentication

### Alternative: Environment Variables (Optional)

If you prefer to use environment variables instead of the settings panel, you can add them to your `.env.local` file (for local development) and Vercel environment variables (for production):

```env
STEADFAST_API_KEY=your_api_key_here
STEADFAST_SECRET_KEY=your_secret_key_here
```

**Note:** Settings configured in the admin panel will take priority over environment variables.

## Features

### 1. Send Order to Steadfast Courier

- Navigate to **Admin Panel** → **Orders**
- Click the **View** (eye icon) button on any order
- In the order details dialog, click **"Send to Steadfast"** button
- The order will be sent to Steadfast Courier and you'll receive:
  - **Consignment ID**: Unique ID from Steadfast
  - **Tracking Code**: Code for tracking the delivery
  - **Status**: Initial delivery status

### 2. Check Delivery Status

- For orders that have been sent to Steadfast, you can check their delivery status
- Click the **Refresh** icon in the orders table, or
- Click **"Check Status"** button in the order details dialog
- The status will be updated with the latest delivery information

### 3. View Tracking Information

- All Steadfast tracking information is displayed in:
  - The orders table (Steadfast column)
  - The order details dialog (Steadfast Courier section)

## Delivery Statuses

The following statuses may be returned by Steadfast Courier:

- `pending` - Consignment is not delivered or cancelled yet
- `in_review` - Order is placed and waiting to be reviewed
- `delivered_approval_pending` - Consignment is delivered but waiting for admin approval
- `partial_delivered_approval_pending` - Consignment is delivered partially and waiting for admin approval
- `cancelled_approval_pending` - Consignment is cancelled and waiting for admin approval
- `delivered` - Consignment is delivered and balance added
- `partial_delivered` - Consignment is partially delivered and balance added
- `cancelled` - Consignment is cancelled and balance updated
- `hold` - Consignment is held
- `unknown` - Unknown status (contact support)

## API Endpoints

The integration uses the following internal API endpoints:

- `POST /api/admin/orders/steadfast/send` - Send an order to Steadfast
- `POST /api/admin/orders/steadfast/status` - Check delivery status
- `GET /api/admin/orders/steadfast/balance` - Get current balance (for future use)

## Notes

- Each order can only be sent to Steadfast Courier once
- If an order has already been sent, the "Send to Steadfast" button will not appear
- Tracking information is automatically saved to the order in the database
- You can check the delivery status at any time to get the latest updates

## Troubleshooting

### Error: "Steadfast API credentials are not configured"

- Go to **Admin Panel** → **Settings** → **Steadfast Courier** tab
- Make sure you've entered both the **API Key** and **Secret Key**
- Click **"Save Changes"** to save your credentials
- If using environment variables, make sure they are set correctly
- Restart your development server after adding environment variables (if using env vars)
- In production, make sure to redeploy after adding environment variables (if using env vars)

### Error: "Order already sent to Steadfast Courier"

- This means the order has already been sent
- You can only send each order once
- Use the "Check Status" feature to get updates on the delivery

### Error: "Failed to create order in Steadfast Courier"

- Check that your API credentials are correct
- Verify that the order information (phone number, address, etc.) is valid
- Phone numbers must be 11 digits
- Address must be within 250 characters
- Contact Steadfast Courier support if the issue persists

