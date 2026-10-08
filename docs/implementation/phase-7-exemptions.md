# Phase 7 — Exemption Certificates & Resale Verification

## 1. Overview
Sales tax exemptions cannot legally rely on an unverified checkout checkbox. In the event of a state sales tax audit, any sale classified as exempt without a valid, on-file exemption or resale certificate is assessed back-taxes, statutory interest, and penalties against the seller.

The `ExemptionService` (`src/server/services/salesTax/exemptions/exemptionService.ts`) manages customer resale and tax exemption certificates.

---

## 2. Exemption Certificate Lifecycle & States
```prisma
enum ExemptionStatus {
  VALID
  EXPIRED
  PENDING_VERIFICATION
  REJECTED
  REVOKED
}

model ExemptionCertificate {
  id               String          @id @default(uuid())
  organizationId   String
  customerId       String
  customer         SalesTaxCustomer @relation(fields: [customerId], references: [id])
  certificateType  String          // "RESALE", "GOVERNMENT", "NON_PROFIT", "MANUFACTURING"
  certificateNumber String
  issuingState     String
  exemptStates     String[]        // ["US-CA", "US-NY"]
  effectiveDate    DateTime
  expirationDate   DateTime?
  status           ExemptionStatus @default(PENDING_VERIFICATION)
  documentId       String?         // Link to Evidence Graph PDF
  verifiedByUserId String?
  verificationNotes String?
}
```

---

## 3. Verification Rules
Before zero tax is assessed on a transaction line:
1. Customer must have an active `ExemptionCertificate` matching the delivery state.
2. `status` must be `VALID`.
3. `expirationDate` must be either null (permanent) or greater than the transaction date.
4. If expired or missing, the line reverts to standard taxable treatment unless overridden by a credentialed CPA reviewer.
