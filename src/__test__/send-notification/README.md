# Sankhya Notification Integration Tests

This folder contains integration tests for the Sankhya notification system that send real WhatsApp messages via Blip API.

## Overview

**File:** `sankhya-notifications-send.test.ts` (318 lines)

This test suite mocks the Sankhya API responses while allowing **real Blip API calls** to send WhatsApp notifications. All notifications are sent to the test phone: **5548991516758**

## Test Structure

### 8 Main Test Suites

1. **NA 100 - New Client Notification**
   - Mocks: New client registration (dataAssinatura today)
   - Sends: NA100 template via Blip to target phone
   
2. **NA 200 - First Generator Link Notification**
   - Mocks: First generator link (60-day mark check)
   - Sends: NA200 template via Blip to target phone

3. **NA 300 - First Invoice Notification**
   - Mocks: First invoice with link
   - Sends: NA300 template via Blip to target phone

4. **NA 400 - Issued Invoice Notification**
   - Mocks: Invoice due in 5 days
   - Sends: NA400 template via Blip to target phone

5. **NA 500 - Due Today Notification**
   - Mocks: Invoice due today with amount
   - Sends: NA500 template via Blip to target phone

6. **NA 600 - Overdue 5 Days Notification**
   - Mocks: Invoice 5 days overdue
   - Sends: NA600 template via Blip to target phone

7. **NA 700 - Overdue 15 Days Notification**
   - Mocks: Invoice 15 days overdue
   - Sends: NA700 template via Blip to target phone

8. **All Notifications in Single Run**
   - Mocks: All 7 notification types simultaneously
   - Sends: All 7 templates (7 notifications total) to target phone

## Running Tests

### Run all integration tests:
```bash
npm test -- send-notification/sankhya-notifications-send
```

### Run specific notification test:
```bash
npm test -- send-notification/sankhya-notifications-send -t "NA 100"
```

### Run all-in-one test (fastest):
```bash
npm test -- send-notification/sankhya-notifications-send -t "All Notifications in Single Run"
```

## How It Works

1. **Sankhya API Mocking**: Uses Jest mocks to provide fake Sankhya database responses
2. **Real Blip Integration**: Calls actual Blip API (requires valid `.env` credentials)
3. **Phone Target**: All notifications route to `5548991516758` (test phone)
4. **Orchestration**: Uses `processAllSankhyaNotifications()` service function

## Environment Requirements

Ensure your `.env` file contains:
- `API_BLIP_URL` - Blip WhatsApp API endpoint
- `API_BLIP_AUTH` - Blip authentication token
- `TEMPLATE_NA100_NAME` through `TEMPLATE_NA700_NAME` - Template names
- `TEMPLATE_NA100_STATEID` through `TEMPLATE_NA700_STATEID` - State IDs
- `TEMPLATE_MASTER_SATE` - Master state ID
- `TEMPLATE_ACTIVE_MESSAGE_FLOWID` - Active message flow ID

## Expected Output

When tests run successfully, each test will log:
```
✓ NA 100: 1 notification(s) sent to 5548991516758
✓ NA 200: 1 notification(s) sent to 5548991516758
✓ NA 300: 1 notification(s) sent to 5548991516758
✓ NA 400: 1 notification(s) sent to 5548991516758
✓ NA 500: 1 notification(s) sent to 5548991516758
✓ NA 600: 1 notification(s) sent to 5548991516758
✓ NA 700: 1 notification(s) sent to 5548991516758
✓ All 7 notifications (NA 100-700) sent to 5548991516758
```

## Key Features

✅ **Mocked Sankhya Responses** - No database calls needed
✅ **Real Blip API Calls** - Actual WhatsApp messages sent
✅ **Single Target Phone** - All tests use 5548991516758
✅ **Comprehensive Coverage** - All 7 notification types tested
✅ **Sequential Orchestration** - Tests the full pipeline

## Debugging

To see detailed Blip API responses, add this before running tests:
```typescript
const result = await processAllSankhyaNotifications();
console.log(result.successList); // View successful notifications
console.log(result.errorList);   // View any errors
```

## Notes

- Tests require internet connectivity (Blip API calls)
- Each test takes a few seconds due to real API calls
- Phone number must be registered on Blip for testing
- Templates must exist in Blip for each NA type
