/**
 * Autonomous TaxOS — Deterministic Monetary Math
 * Workstream 3: Phase 3
 * 
 * Strict integer arithmetic on 64-bit BigInt cents.
 * Eliminates IEEE-754 floating point inaccuracies in progressive bracket calculations,
 * phaseout ratios, and multi-state apportionments.
 * 
 * Implements IRC § 6102 whole-dollar rounding rules.
 */

export class TaxMoney {
  static readonly ZERO: bigint = 0n;
  static readonly ONE_HUNDRED: bigint = 100n;
  static readonly BPS_DIVISOR: bigint = 10000n;

  /**
   * Parse a dollar string or number into BigInt cents without floating point drift.
   * e.g., "1234.56" -> 123456n, "1234" -> 123400n, 1234.56 -> 123456n
   */
  static fromDollars(dollars: number | string): bigint {
    if (typeof dollars === 'number') {
      if (!Number.isFinite(dollars)) {
        throw new Error(`Cannot convert non-finite number to cents: ${dollars}`);
      }
      // Convert to fixed string with 2 decimal places to prevent float epsilon errors
      dollars = dollars.toFixed(2);
    }

    const trimmed = dollars.trim();
    if (trimmed === '') return 0n;

    // Handle negative sign
    const isNegative = trimmed.startsWith('-');
    const cleanStr = isNegative ? trimmed.slice(1) : trimmed;

    const parts = cleanStr.split('.');
    if (parts.length > 2) {
      throw new Error(`Invalid dollar string format: "${dollars}"`);
    }

    const wholePart = parts[0].replace(/,/g, '');
    const fractionalPart = (parts[1] || '').padEnd(2, '0').slice(0, 2);

    if (!/^\d*$/.test(wholePart) || !/^\d{2}$/.test(fractionalPart)) {
      throw new Error(`Invalid characters in dollar amount: "${dollars}"`);
    }

    const wholeBig = wholePart ? BigInt(wholePart) : 0n;
    const fractionBig = BigInt(fractionalPart);
    const totalCents = wholeBig * 100n + fractionBig;

    return isNegative ? -totalCents : totalCents;
  }

  /**
   * Convert BigInt cents to decimal number for reporting/UI display.
   */
  static toDollars(cents: bigint): number {
    return Number(cents) / 100;
  }

  /**
   * Format BigInt cents as currency string, e.g., "$1,234.56" or "-$1,234.56".
   */
  static format(cents: bigint): string {
    const isNegative = cents < 0n;
    const absCents = isNegative ? -cents : cents;
    const whole = absCents / 100n;
    const fraction = absCents % 100n;
    const fractionStr = fraction.toString().padStart(2, '0');
    const wholeFormatted = whole.toLocaleString('en-US');
    return `${isNegative ? '-' : ''}$${wholeFormatted}.${fractionStr}`;
  }

  /**
   * Multiply cents by basis points (1 bps = 0.01% = 0.0001)
   * with half-up rounding at fractional cents.
   * Example: 100_000n cents ($1,000) * 2400 bps (24%) = 24_000n cents ($240)
   */
  static multiplyBps(cents: bigint, rateBps: number | bigint): bigint {
    const bps = typeof rateBps === 'bigint' ? rateBps : BigInt(rateBps);
    if (cents === 0n || bps === 0n) return 0n;

    const isNegative = (cents < 0n) !== (bps < 0n);
    const absCents = cents < 0n ? -cents : cents;
    const absBps = bps < 0n ? -bps : bps;

    // Half-up rounding: add 5000 before dividing by 10000
    const numerator = absCents * absBps + 5000n;
    const result = numerator / 10000n;
    return isNegative ? -result : result;
  }

  /**
   * Multiply cents by a rational fraction (numerator / denominator)
   * with half-up rounding.
   */
  static multiplyFraction(cents: bigint, numerator: bigint, denominator: bigint): bigint {
    if (denominator === 0n) {
      throw new Error('Division by zero in multiplyFraction');
    }
    if (cents === 0n || numerator === 0n) return 0n;

    const isNegative = (cents < 0n) !== (numerator < 0n) !== (denominator < 0n);
    const absCents = cents < 0n ? -cents : cents;
    const absNum = numerator < 0n ? -numerator : numerator;
    const absDen = denominator < 0n ? -denominator : denominator;

    const halfDen = absDen / 2n;
    const result = (absCents * absNum + halfDen) / absDen;
    return isNegative ? -result : result;
  }

  /**
   * Round to nearest whole dollar under IRC § 6102 rules:
   * Amounts under 50 cents are dropped (rounded down to whole dollar),
   * amounts of 50 cents or more are rounded up to the next dollar.
   * Returns value in cents (ending in 00).
   */
  static roundToWholeDollarCents(cents: bigint): bigint {
    if (cents === 0n) return 0n;

    const isNegative = cents < 0n;
    const absCents = isNegative ? -cents : cents;
    const remainder = absCents % 100n;
    let wholeDollars = absCents / 100n;

    if (remainder >= 50n) {
      wholeDollars += 1n;
    }

    const roundedCents = wholeDollars * 100n;
    return isNegative ? -roundedCents : roundedCents;
  }

  /**
   * Maximum of two cent amounts.
   */
  static max(a: bigint, b: bigint): bigint {
    return a >= b ? a : b;
  }

  /**
   * Minimum of two cent amounts.
   */
  static min(a: bigint, b: bigint): bigint {
    return a <= b ? a : b;
  }

  /**
   * Clamp a cent amount between min and max.
   */
  static clamp(value: bigint, minVal: bigint, maxVal: bigint): bigint {
    if (minVal > maxVal) {
      throw new Error(`Invalid clamp range: min (${minVal}) > max (${maxVal})`);
    }
    return TaxMoney.max(minVal, TaxMoney.min(maxVal, value));
  }

  /**
   * Calculate progressive tax liability given a taxable income and an ordered array of brackets.
   */
  static calculateProgressiveTax(
    taxableIncomeCents: bigint,
    brackets: { floorCents: bigint; ceilingCents: bigint | null; rateBps: number; baseTaxCents: bigint }[]
  ): bigint {
    if (taxableIncomeCents <= 0n) return 0n;

    let totalTaxCents = 0n;

    for (const bracket of brackets) {
      if (taxableIncomeCents <= bracket.floorCents) {
        break;
      }

      const bracketSpan = bracket.ceilingCents !== null
        ? TaxMoney.min(taxableIncomeCents, bracket.ceilingCents) - bracket.floorCents
        : taxableIncomeCents - bracket.floorCents;

      if (bracketSpan > 0n) {
        totalTaxCents += TaxMoney.multiplyBps(bracketSpan, bracket.rateBps);
      }
    }

    return totalTaxCents;
  }
}
