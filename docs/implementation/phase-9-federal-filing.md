# Phase 9: Federal Modernized e-File (MeF) Engine

## Overview

IRS Modernized e-File (MeF) uses standardized XML schemas to transmit tax returns, statements, and supporting schedules. The TaxOS federal engine (`SandboxFederalFilingProvider` and `ReturnPackageBuilder`) generates valid IRS MeF Form 1040 XML compliant with IRS Publication 4164 and IRS Publication 4163.

---

## MeF XML Schema Structure

The generated XML follows the strict three-tier MeF hierarchy:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Return xmlns="http://www.irs.gov/efile" returnVersion="2026v1.0">
  <ReturnHeader>
    <ReturnTs>2026-04-10T14:30:00.000Z</ReturnTs>
    <TaxPeriodEndDate>2026-12-31</TaxPeriodEndDate>
    <TaxYear>2026</TaxYear>
    <Originator>
      <EFIN>000000</EFIN>
      <OriginatorType>ERO</OriginatorType>
    </Originator>
    <SoftwareId>TAXOS-2026-PROD</SoftwareId>
    <Filer>
      <PrimarySSN>***-**-6789</PrimarySSN>
      <NameControl>JEFF</NameControl>
      <TaxpayerName>Thomas Jefferson</TaxpayerName>
    </Filer>
  </ReturnHeader>
  <ReturnData>
    <IRS1040 documentName="IRS1040">
      <IndividualReturnFilingStatusCd>1</IndividualReturnFilingStatusCd>
      <TotalWagesAmt>95000</TotalWagesAmt>
      <TotalIncomeAmt>95000</TotalIncomeAmt>
      <AdjustedGrossIncomeAmt>95000</AdjustedGrossIncomeAmt>
      <TotalTaxAmt>13200</TotalTaxAmt>
      <FederalIncomeTaxWithheldAmt>14450</FederalIncomeTaxWithheldAmt>
      <OverpaymentAmt>1250</OverpaymentAmt>
      <RefundAmt>1250</RefundAmt>
    </IRS1040>
  </ReturnData>
</Return>
```

---

## Pre-Transmission MeF Business Rules Validation

Before generating transmission payloads, `SandboxFederalFilingProvider.validateSubmission` verifies statutory MeF business rules:

1. **Rule `F1040-001`:** Taxpayer Social Security Number (SSN) or Individual Taxpayer Identification Number (ITIN) presence and format.
2. **Rule `F1040-002`:** Valid statutory Filing Status code (`1` Single, `2` MFJ, `3` MFS, `4` HOH, `5` QSS).
3. **Rule `F1040-003`:** Mathematical balancing between gross income, deductions, taxable income, tax liability, withholdings, and refund/balance due.
4. **Rule `F1040-004`:** Form 8879 execution verification — uncompleted jurat or missing PIN immediately blocks submission.

---

## Acknowledgment & Error Reporting

The MeF transmission engine tracks submissions through three states:
- **`SENT`:** Transmission packet packaged and acknowledged by Gateway.
- **`ACCEPTED`:** Formal IRS acknowledgment received with Acceptance Timestamp and sequence identifier.
- **`REJECTED`:** XML schema validation error or IRS Master File business rule exception returned with specific rule codes.
