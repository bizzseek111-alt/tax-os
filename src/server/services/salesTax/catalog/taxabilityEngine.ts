/**
 * Autonomous Tax OS — Deterministic Sales Taxability Engine
 * 
 * Determines product and service taxability across CA, NY, NJ, IL, MA
 * based on standard catalog categories (SaaS, Digital Goods, TPP, Services, Shipping).
 * Supports CPA manual reviewer overrides with persistent audit lineage.
 */

import { prisma } from '../../../db';
import { ProductTaxability } from '@prisma/client';

export interface StateTaxabilityRule {
  stateCode: string;
  category: string;
  taxability: ProductTaxability;
  statutoryCitation: string;
  reason: string;
  specialConditions?: string;
}

export const STATE_TAXABILITY_CATALOG: Record<string, Record<string, StateTaxabilityRule>> = {
  CA: {
    SAAS: {
      stateCode: 'CA',
      category: 'SAAS',
      taxability: ProductTaxability.EXEMPT,
      statutoryCitation: 'Cal. Code Regs. tit. 18, § 1502(f)(1)(D)',
      reason: 'California does not tax software accessed remotely via the cloud where no tangible medium (CD/DVD) is transferred.'
    },
    DIGITAL_GOODS: {
      stateCode: 'CA',
      category: 'DIGITAL_GOODS',
      taxability: ProductTaxability.EXEMPT,
      statutoryCitation: 'Cal. Rev. & Tax. Code § 6016; CDTFA Publication 109',
      reason: 'Electronic data transfers without tangible personal property are exempt in California.'
    },
    TPP: {
      stateCode: 'CA',
      category: 'TPP',
      taxability: ProductTaxability.TAXABLE,
      statutoryCitation: 'Cal. Rev. & Tax. Code § 6051',
      reason: 'Retail sales of tangible personal property are generally taxable.'
    },
    PROFESSIONAL_SERVICES: {
      stateCode: 'CA',
      category: 'PROFESSIONAL_SERVICES',
      taxability: ProductTaxability.NON_TAXABLE,
      statutoryCitation: 'Cal. Code Regs. tit. 18, § 1501',
      reason: 'Professional and personal service transactions that involve no tangible property are nontaxable.'
    },
    MAINTENANCE: {
      stateCode: 'CA',
      category: 'MAINTENANCE',
      taxability: ProductTaxability.NON_TAXABLE,
      statutoryCitation: 'Cal. Code Regs. tit. 18, § 1502(f)(1)(C)',
      reason: 'Optional software maintenance agreements without tangible media are nontaxable.'
    },
    SHIPPING: {
      stateCode: 'CA',
      category: 'SHIPPING',
      taxability: ProductTaxability.EXEMPT,
      statutoryCitation: 'Cal. Code Regs. tit. 18, § 1628',
      reason: 'Separately stated transportation charges by common carrier or US mail are exempt.'
    }
  },
  NY: {
    SAAS: {
      stateCode: 'NY',
      category: 'SAAS',
      taxability: ProductTaxability.TAXABLE,
      statutoryCitation: 'N.Y. Tax Law § 1101(b)(6); TSB-A-08(62)S',
      reason: 'New York considers prewritten software accessed remotely or hosted in the cloud to be taxable prewritten computer software.'
    },
    DIGITAL_GOODS: {
      stateCode: 'NY',
      category: 'DIGITAL_GOODS',
      taxability: ProductTaxability.TAXABLE,
      statutoryCitation: 'N.Y. Tax Law § 1105(a); TSB-M-11(5)S',
      reason: 'Prewritten digital computer software and electronic entertainment media are taxable in New York.'
    },
    TPP: {
      stateCode: 'NY',
      category: 'TPP',
      taxability: ProductTaxability.TAXABLE,
      statutoryCitation: 'N.Y. Tax Law § 1105(a)',
      reason: 'Retail sales of tangible personal property are taxable.',
      specialConditions: 'Clothing and footwear under $110 per item are exempt from 4% state tax.'
    },
    PROFESSIONAL_SERVICES: {
      stateCode: 'NY',
      category: 'PROFESSIONAL_SERVICES',
      taxability: ProductTaxability.NON_TAXABLE,
      statutoryCitation: 'N.Y. Tax Law § 1105(c)',
      reason: 'General professional, consulting, and legal services are not among the enumerated taxable services in New York.'
    },
    MAINTENANCE: {
      stateCode: 'NY',
      category: 'MAINTENANCE',
      taxability: ProductTaxability.TAXABLE,
      statutoryCitation: 'N.Y. Tax Law § 1105(c)(5)',
      reason: 'Software maintenance and support contracts for prewritten software are generally taxable in New York.'
    },
    SHIPPING: {
      stateCode: 'NY',
      category: 'SHIPPING',
      taxability: ProductTaxability.TAXABLE,
      statutoryCitation: 'N.Y. Tax Law § 1101(b)(3); 20 NYCRR 526.5(g)',
      reason: 'Shipping and delivery charges for taxable goods are taxable in New York, even if separately stated.'
    }
  },
  NJ: {
    SAAS: {
      stateCode: 'NJ',
      category: 'SAAS',
      taxability: ProductTaxability.TAXABLE,
      statutoryCitation: 'N.J. Stat. Ann. § 54:32B-2(cc); N.J.A.C. 18:24-25.7',
      reason: 'Prewritten computer software accessed via the cloud or remote servers is taxable in New Jersey.'
    },
    DIGITAL_GOODS: {
      stateCode: 'NJ',
      category: 'DIGITAL_GOODS',
      taxability: ProductTaxability.TAXABLE,
      statutoryCitation: 'N.J. Stat. Ann. § 54:32B-3(a)',
      reason: 'Digital audio, audiovisual products, and books delivered electronically are taxable in New Jersey.'
    },
    TPP: {
      stateCode: 'NJ',
      category: 'TPP',
      taxability: ProductTaxability.TAXABLE,
      statutoryCitation: 'N.J. Stat. Ann. § 54:32B-3(a)',
      reason: 'Retail sales of tangible personal property are taxable, with statutory exemption for clothing.'
    },
    PROFESSIONAL_SERVICES: {
      stateCode: 'NJ',
      category: 'PROFESSIONAL_SERVICES',
      taxability: ProductTaxability.NON_TAXABLE,
      statutoryCitation: 'N.J. Stat. Ann. § 54:32B-3(b)',
      reason: 'Professional and consulting services are not subject to New Jersey sales tax.'
    },
    MAINTENANCE: {
      stateCode: 'NJ',
      category: 'MAINTENANCE',
      taxability: ProductTaxability.TAXABLE,
      statutoryCitation: 'N.J.A.C. 18:24-25.7',
      reason: 'Maintenance agreements for prewritten software are taxable.'
    },
    SHIPPING: {
      stateCode: 'NJ',
      category: 'SHIPPING',
      taxability: ProductTaxability.TAXABLE,
      statutoryCitation: 'N.J. Stat. Ann. § 54:32B-2(oo)',
      reason: 'Delivery charges for taxable merchandise are included in the taxable receipt in New Jersey.'
    }
  },
  IL: {
    SAAS: {
      stateCode: 'IL',
      category: 'SAAS',
      taxability: ProductTaxability.EXEMPT,
      statutoryCitation: '86 Ill. Adm. Code 130.1935; Illinois ST-19-0010-PLR',
      reason: 'State of Illinois does not tax pure cloud SaaS where customer does not download software to local storage (note: Chicago municipal cloud tax treated as local lease tax).'
    },
    DIGITAL_GOODS: {
      stateCode: 'IL',
      category: 'DIGITAL_GOODS',
      taxability: ProductTaxability.TAXABLE,
      statutoryCitation: '35 ILCS 120/2-10; 86 Ill. Adm. Code 130.1935',
      reason: 'Downloaded prewritten computer software is treated as taxable tangible personal property in Illinois.'
    },
    TPP: {
      stateCode: 'IL',
      category: 'TPP',
      taxability: ProductTaxability.TAXABLE,
      statutoryCitation: '35 ILCS 120/2',
      reason: 'Retail sales of general merchandise are taxable under Retailers\' Occupation Tax.'
    },
    PROFESSIONAL_SERVICES: {
      stateCode: 'IL',
      category: 'PROFESSIONAL_SERVICES',
      taxability: ProductTaxability.NON_TAXABLE,
      statutoryCitation: '35 ILCS 115/3 (Service Occupation Tax Act)',
      reason: 'Professional consulting services without transfer of tangible property are exempt.'
    },
    MAINTENANCE: {
      stateCode: 'IL',
      category: 'MAINTENANCE',
      taxability: ProductTaxability.NON_TAXABLE,
      statutoryCitation: '86 Ill. Adm. Code 140.301',
      reason: 'Optional software maintenance agreements without tangible updates are nontaxable.'
    },
    SHIPPING: {
      stateCode: 'IL',
      category: 'SHIPPING',
      taxability: ProductTaxability.TAXABLE,
      statutoryCitation: '86 Ill. Adm. Code 130.415',
      reason: 'Transportation and delivery charges are taxable unless strictly agreed upon separately as buyer cost.'
    }
  },
  MA: {
    SAAS: {
      stateCode: 'MA',
      category: 'SAAS',
      taxability: ProductTaxability.EXEMPT,
      statutoryCitation: '830 CMR 64H.1.3(14)(h); Mass DOR Directive 01-1',
      reason: 'Massachusetts does not tax cloud computing or SaaS where the customer merely accesses software remotely.'
    },
    DIGITAL_GOODS: {
      stateCode: 'MA',
      category: 'DIGITAL_GOODS',
      taxability: ProductTaxability.TAXABLE,
      statutoryCitation: 'Mass. Gen. Laws ch. 64H, § 1; 830 CMR 64H.1.3',
      reason: 'Downloaded prewritten computer software delivered electronically is taxable.'
    },
    TPP: {
      stateCode: 'MA',
      category: 'TPP',
      taxability: ProductTaxability.TAXABLE,
      statutoryCitation: 'Mass. Gen. Laws ch. 64H, § 2',
      reason: 'Retail sales of tangible personal property are taxable, with statutory exemption for clothing under $175.'
    },
    PROFESSIONAL_SERVICES: {
      stateCode: 'MA',
      category: 'PROFESSIONAL_SERVICES',
      taxability: ProductTaxability.NON_TAXABLE,
      statutoryCitation: 'Mass. Gen. Laws ch. 64H, § 1',
      reason: 'Professional, consulting, and personal services are exempt from Massachusetts sales tax.'
    },
    MAINTENANCE: {
      stateCode: 'MA',
      category: 'MAINTENANCE',
      taxability: ProductTaxability.NON_TAXABLE,
      statutoryCitation: '830 CMR 64H.1.3(7)',
      reason: 'Optional software maintenance contracts without tangible property are nontaxable.'
    },
    SHIPPING: {
      stateCode: 'MA',
      category: 'SHIPPING',
      taxability: ProductTaxability.EXEMPT,
      statutoryCitation: 'Mass. Gen. Laws ch. 64H, § 1; 830 CMR 64H.1.3',
      reason: 'Separately stated transportation and delivery charges are exempt from Massachusetts sales tax.'
    }
  }
};

export interface TaxabilityDeterminationResult {
  decision: ProductTaxability;
  isTaxable: boolean;
  statutoryCitation: string;
  reason: string;
  isReviewerOverride: boolean;
  reviewerUserId?: string;
}

export class TaxabilityEngine {
  /**
   * Deterministically decides taxability for a product category in a destination state,
   * checking for existing reviewer overrides in TaxCase first.
   */
  public async determineTaxability(params: {
    taxCaseId?: string;
    organizationId: string;
    productCategoryCode: string;
    stateCode: string;
    isCustomerExempt?: boolean;
  }): Promise<TaxabilityDeterminationResult> {
    const state = params.stateCode.toUpperCase();
    const category = params.productCategoryCode.toUpperCase();

    // Check customer exemption first
    if (params.isCustomerExempt) {
      return {
        decision: ProductTaxability.EXEMPT,
        isTaxable: false,
        statutoryCitation: 'Exemption Certificate on file',
        reason: 'Customer holds an active, verified sales tax exemption certificate.',
        isReviewerOverride: false
      };
    }

    // Check for existing CPA reviewer override for this taxCase & category & state
    if (params.taxCaseId) {
      const existingOverride = await prisma.taxabilityDecision.findFirst({
        where: {
          taxCaseId: params.taxCaseId,
          stateCode: state,
          OR: [
            { productTaxCategory: { code: category } },
            { productCategoryId: null }
          ],
          isReviewerOverride: true
        },
        orderBy: { updatedAt: 'desc' }
      });

      if (existingOverride) {
        return {
          decision: existingOverride.decision,
          isTaxable: existingOverride.decision === ProductTaxability.TAXABLE,
          statutoryCitation: existingOverride.ruleCitation,
          reason: existingOverride.determinationReason,
          isReviewerOverride: true,
          reviewerUserId: existingOverride.reviewerUserId || undefined
        };
      }
    }

    // Look up state catalog rule
    const stateCatalog = STATE_TAXABILITY_CATALOG[state];
    const rule = stateCatalog ? stateCatalog[category] : undefined;

    if (!rule) {
      // General merchandise default fallback
      const defaultTaxable = category === 'TPP' || category === 'DIGITAL_GOODS';
      return {
        decision: defaultTaxable ? ProductTaxability.TAXABLE : ProductTaxability.EXEMPT,
        isTaxable: defaultTaxable,
        statutoryCitation: `${state} Standard Sales Tax Code`,
        reason: `Default determination for ${category} in ${state}.`,
        isReviewerOverride: false
      };
    }

    return {
      decision: rule.taxability,
      isTaxable: rule.taxability === ProductTaxability.TAXABLE,
      statutoryCitation: rule.statutoryCitation,
      reason: rule.reason,
      isReviewerOverride: false
    };
  }

  /**
   * CPA reviewer overrides taxability determination with custom citation & rationale
   */
  public async overrideTaxability(params: {
    taxCaseId: string;
    productCategoryId?: string;
    categoryCode?: string;
    stateCode: string;
    decision: ProductTaxability;
    ruleCitation: string;
    determinationReason: string;
    reviewerUserId: string;
  }) {
    let productCategoryId = params.productCategoryId;
    if (!productCategoryId && params.categoryCode) {
      const taxCase = await prisma.taxCase.findUnique({ where: { id: params.taxCaseId } });
      if (taxCase) {
        const cat = await prisma.productTaxCategory.upsert({
          where: {
            organizationId_code: {
              organizationId: taxCase.organizationId,
              code: params.categoryCode.toUpperCase()
            }
          },
          update: {},
          create: {
            organizationId: taxCase.organizationId,
            code: params.categoryCode.toUpperCase(),
            name: params.categoryCode.toUpperCase(),
            standardCategory: params.categoryCode.toUpperCase()
          }
        });
        productCategoryId = cat.id;
      }
    }

    return await prisma.taxabilityDecision.create({
      data: {
        taxCaseId: params.taxCaseId,
        productCategoryId,
        stateCode: params.stateCode.toUpperCase(),
        decision: params.decision,
        ruleCitation: params.ruleCitation,
        determinationReason: params.determinationReason,
        isReviewerOverride: true,
        reviewerUserId: params.reviewerUserId,
        ruleSetVersion: '2026.1'
      }
    });
  }
}
