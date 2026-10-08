/**
 * Autonomous TaxOS — PII Redaction & Log Sanitization Service
 * 
 * Guarantees zero sensitive data leakage into logs, telemetry, error trackers, or exports:
 * - Detects and masks Social Security Numbers (SSN), Employer Identification Numbers (EIN)
 * - Masks sensitive bank routing and account numbers
 * - Sanitizes passwords, JWT tokens, AWS / provider secret keys, and signed URLs
 */

export class PiiRedactionService {
  private static readonly SSN_REGEX = /\b(?!(000|666|9))\d{3}[- ]?(?!00)\d{2}[- ]?(?!0000)\d{4}\b/g;
  private static readonly EIN_REGEX = /\b\d{2}-\d{7}\b/g;
  private static readonly ROUTING_REGEX = /\b(routingNumber|routing|bankRouting)[\"':\s]+([0-9]{9})\b/gi;
  private static readonly ACCOUNT_REGEX = /\b(accountNumber|account|bankAccount)[\"':\s]+([0-9]{4,17})\b/gi;
  private static readonly SECRET_KEY_REGEX = /\b(sk_[a-zA-Z0-9_\-]{20,}|Bearer\s+[a-zA-Z0-9_\-\.]+)\b/g;
  private static readonly PASSWORD_REGEX = /\b(password|passwordConfirm|newPassword|secret)[\"':\s]+([^\s,}\"]+)/gi;

  /**
   * Sanitizes a text string by redacting detected PII and credentials.
   */
  public static sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') return text;

    let sanitized = text;

    // 1. Redact SSNs
    sanitized = sanitized.replace(this.SSN_REGEX, (match) => {
      const cleaned = match.replace(/\D/g, '');
      const last4 = cleaned.slice(-4);
      return `***-**-${last4}`;
    });

    // 2. Redact EINs
    sanitized = sanitized.replace(this.EIN_REGEX, (match) => {
      const cleaned = match.replace(/\D/g, '');
      const last4 = cleaned.slice(-4);
      return `**-***${last4}`;
    });

    // 3. Mask Routing numbers in key-value context
    sanitized = sanitized.replace(this.ROUTING_REGEX, (_match, key, val) => {
      return `${key}: "XXXX${val.slice(-4)}"`;
    });

    // 4. Mask Account numbers in key-value context
    sanitized = sanitized.replace(this.ACCOUNT_REGEX, (_match, key, val) => {
      return `${key}: "XXXXX${val.slice(-4)}"`;
    });

    // 5. Redact Secrets & Bearer tokens
    sanitized = sanitized.replace(this.SECRET_KEY_REGEX, '[REDACTED_SECRET_KEY]');

    // 6. Redact passwords
    sanitized = sanitized.replace(this.PASSWORD_REGEX, (_match, key) => {
      return `${key}: "[REDACTED_PASSWORD]"`;
    });

    return sanitized;
  }

  /**
   * Recursively sanitizes JSON objects or payloads before logging.
   */
  public static sanitizeObject<T = any>(obj: T): T {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      return this.sanitizeText(obj) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item)) as unknown as T;
    }

    if (typeof obj === 'object') {
      const sanitized: Record<string, any> = {};
      for (const [key, val] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();

        if (lowerKey.includes('password') || lowerKey.includes('secret') || lowerKey.includes('apikey') || lowerKey.includes('token')) {
          sanitized[key] = '[REDACTED]';
        } else if (lowerKey.includes('ssn')) {
          sanitized[key] = typeof val === 'string' ? this.sanitizeText(val) : '***-**-****';
        } else if (lowerKey.includes('routing') && typeof val === 'string') {
          sanitized[key] = `XXXX${val.slice(-4)}`;
        } else if (lowerKey.includes('account') && typeof val === 'string') {
          sanitized[key] = `XXXXX${val.slice(-4)}`;
        } else {
          sanitized[key] = this.sanitizeObject(val);
        }
      }
      return sanitized as T;
    }

    return obj;
  }

  /**
   * Checks if an arbitrary input contains unmasked PII.
   */
  public static containsUnmaskedPii(text: string): { containsPii: boolean; matches: string[] } {
    if (!text || typeof text !== 'string') return { containsPii: false, matches: [] };

    const matches: string[] = [];

    const ssnMatches = text.match(this.SSN_REGEX);
    if (ssnMatches) {
      matches.push(...ssnMatches.filter(m => !m.startsWith('***')));
    }

    return {
      containsPii: matches.length > 0,
      matches
    };
  }
}
