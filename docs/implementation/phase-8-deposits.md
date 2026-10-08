# Autonomous Tax OS — Phase 8: Federal & State Deposit Schedules

## 1. Statutory Deposit Framework (IRS Circular E / Pub 15)
Federal employment taxes (FIT, FICA OASDI, and FICA Medicare) must be deposited through EFTPS following statutory deposit schedules.

### Lookback Period Determination
The employer's deposit schedule is established annually based on taxes reported on Form 941 during the four-quarter lookback period (July 1 of the second preceding year through June 30 of the preceding year):
- **Lookback Liability $\le \$50,000$**: **Monthly Depositor**
  - Due Date: The 15th day of the following calendar month.
- **Lookback Liability $> \$50,000$**: **Semi-Weekly Depositor**
  - Wednesday–Friday Paydays: Due the following Wednesday.
  - Saturday–Tuesday Paydays: Due the following Friday.

### The $100,000 Next-Day Deposit Rule (IRC § 6302(g))
If an employer accumulates **$100,000 or more** in federal employment taxes on any day during a deposit period:
1. The deposit must be made by the **close of the next business day**.
2. If the employer was previously a Monthly depositor, they **immediately become a Semi-Weekly depositor** for the remainder of the current calendar year and the following calendar year.

---

## 2. Federal Unemployment (FUTA) Deposit Schedule
- FUTA taxes are deposited on a quarterly basis.
- **$500 Rule**:
  - If cumulative undeposited FUTA liability exceeds **$500**, it must be deposited by the last day of the month following the calendar quarter end (April 30, July 31, October 31, January 31).
  - If cumulative liability is $\$500$ or less, it carries over to the next quarter until it exceeds $\$500$.

---

## 3. Implementation in `DepositScheduleEngine`

```typescript
export class DepositScheduleEngine {
  public static readonly LOOKBACK_THRESHOLD_CENTS = BigInt(5000000); // $50,000
  public static readonly NEXT_DAY_RULE_THRESHOLD_CENTS = BigInt(10000000); // $100,000
  public static readonly FUTA_DEPOSIT_THRESHOLD_CENTS = BigInt(50000); // $500

  public static determineFilingFrequency(lookbackTotalLiabilityCents: bigint): DepositFrequency {
    return lookbackTotalLiabilityCents > this.LOOKBACK_THRESHOLD_CENTS
      ? DepositFrequency.SEMIWEEKLY
      : DepositFrequency.MONTHLY;
  }
}
```

The system automatically generates `PayrollTaxLiability` records, checks deposit thresholds, determines business day settlement deadlines, and triggers EFTPS ACH debit scheduling.
