# TODO: Add eSewa Payment Integration

## Steps to Complete
- [x] Update shared/schema.ts: Add payment fields to appointments table (paymentAmount, paymentStatus, paymentMethod, paymentRef)
- [ ] Update server/routes.ts: Add POST /api/payments/initiate and GET /api/payments/verify routes
- [ ] Update client/src/components/appointment-modal.tsx: Integrate payment initiation after booking appointment
- [ ] Test the payment flow using eSewa test environment

## Notes
- Using test mode with eSewa test merchant code "EPAYTEST"
- Fixed payment amount: 1000 NPR (100000 paisa)
- Success URL: /api/payments/verify?status=success
- Failure URL: /api/payments/verify?status=failure
