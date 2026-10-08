/**
 * Autonomous Tax OS — Deterministic Tax Domain Embedding Engine
 * 
 * Generates normalized 64-dimensional semantic projection vectors covering:
 * - Internal Revenue Code sections & statutory definitions
 * - Deductions, credits, depreciation, thresholds, filing statuses
 * - Multi-state conformity and tax adjustments
 * 
 * Provides bit-for-bit reproducible cosine similarity without external API dependencies.
 */

export class TaxEmbeddingEngine {
  private static readonly DIMENSIONS = 64;

  // Key statutory and financial tax feature vocabularies
  private static readonly TAX_VOCABULARY = [
    'statute', 'irc', 'section', 'deduction', 'credit', 'exemption',
    'qualified', 'business', 'income', 'qbi', '199a', 'schedule', 'w2',
    'wages', 'self-employment', 'fica', 'medicare', 'social-security',
    'adjusted', 'gross', 'agi', 'standard', 'itemized', 'salt', 'state',
    'local', 'california', 'ftb', '540', 'franchise', 'conformity', 'decoupling',
    'depreciation', 'bonus', '179', 'macrs', 'net-operating-loss', 'nol',
    'new-york', 'it201', 'subtraction', 'addition', 'residency', 'domicile',
    'new-jersey', 'nj1040', 'gross-income', 'exclusion', 'cross-netting',
    'illinois', 'il1040', 'flat-rate', 'pension', 'retirement', 'subtraction',
    'massachusetts', 'form-1', 'surtax', 'millionaire', 'unearned', 'capital-gains',
    'child-tax-credit', 'ctc', '8812', 'refundable', 'nonrefundable', 'phaseout',
    'bracket', 'marginal', 'rate', 'married-filing-jointly', 'single', 'hsa'
  ];

  /**
   * Generates a normalized unit vector (L2 norm = 1.0) for any legal or tax text.
   */
  public static generateEmbedding(text: string): number[] {
    const tokens = this.tokenize(text);

    // Expand tax synonyms so domain equivalences align strongly
    if (tokens.has('qbi') || (tokens.has('qualified') && tokens.has('business') && tokens.has('income'))) {
      tokens.add('qbi');
      tokens.add('qualified');
      tokens.add('business');
      tokens.add('income');
      tokens.add('199a');
    }
    if (tokens.has('199a')) {
      tokens.add('qbi');
      tokens.add('qualified');
      tokens.add('business');
      tokens.add('income');
    }
    if (tokens.has('self-employment') || tokens.has('self') || tokens.has('se')) {
      tokens.add('self-employment');
      tokens.add('fica');
    }

    const vector = new Array(this.DIMENSIONS).fill(0);

    // 1. Project domain vocabulary matches into dimensional space with high weighting
    const vocabSet = new Set(this.TAX_VOCABULARY);
    for (let i = 0; i < this.TAX_VOCABULARY.length && i < this.DIMENSIONS; i++) {
      const vocabTerm = this.TAX_VOCABULARY[i];
      if (tokens.has(vocabTerm)) {
        vector[i] += 4.0; // Dominant signal for statutory concepts
      }
    }

    // 2. Hash remaining open-vocabulary tokens with moderate weight
    tokens.forEach((token) => {
      if (!vocabSet.has(token)) {
        let hash = 0;
        for (let j = 0; j < token.length; j++) {
          hash = (hash << 5) - hash + token.charCodeAt(j);
          hash |= 0;
        }
        const dim = Math.abs(hash) % this.DIMENSIONS;
        vector[dim] += 0.5;
      }
    });

    // 3. Normalize vector to unit length (L2 norm)
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm === 0) return vector;

    return vector.map((val) => parseFloat((val / norm).toFixed(6)));
  }

  /**
   * Computes the Cosine Similarity between two normalized vectors: [-1.0, 1.0].
   */
  public static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0.0;

    let dotProduct = 0.0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
    }

    // Since vectors are already L2 normalized, dotProduct == cosineSimilarity
    const clamped = Math.max(0.0, Math.min(1.0, dotProduct));
    return parseFloat(clamped.toFixed(4));
  }

  private static tokenize(text: string): Set<string> {
    const cleaned = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
    const parts = cleaned.split(/\s+/).filter((p) => p.length > 1);
    return new Set(parts);
  }
}
