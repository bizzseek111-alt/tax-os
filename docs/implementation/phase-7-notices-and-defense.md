# Phase 7 — State Notice Ingestion & Audit Defense

## 1. Notice Classification & Ingestion
When a business receives a sales tax inquiry or assessment letter from a state tax agency (e.g., CDTFA, NYS DTF, IDOR), the document is ingested via `NoticeService`:
- **Notice Types**: `ASSESSMENT`, `INQUIRY`, `DEFICIENCY`, `AUDIT_NOTICE`.
- **Severity Levels**: `INFO`, `INQUIRY`, `ASSESSMENT`, `DEFICIENCY`, `LIEN_THREAT`, `AUDIT_INTENT`.
- **Key Fields**: Assessed tax, penalties, statutory interest, period covered, and state response deadline.

## 2. Automated CPA Escalation
Every ingested sales tax notice automatically provisions a high-priority `ReviewTask` with `taxDomain: SALES_TAX`:
```typescript
const reviewTask = await prisma.reviewTask.create({
  data: {
    taxCaseId,
    reviewType: 'SALES_TAX_NOTICE_REVIEW',
    taxDomain: TaxDomain.SALES_TAX,
    jurisdiction: `US-${stateCode}`,
    requiredRole: UserRole.CPA,
    priority: severity === 'AUDIT_INTENT' || severity === 'LIEN_THREAT' ? 'URGENT' : 'HIGH',
    materialityCents: totalAssessment,
    deadline: responseDueDate,
    notes: `State Sales Tax Notice received from ${agencyName}. Assessment: $${assessment}`,
    qualityReviewRequired: true
  }
});
```
This guarantees that statutory deadlines are never missed, and CPA audit defense is initiated immediately.
