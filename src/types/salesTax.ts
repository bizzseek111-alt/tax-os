import { 
  TaxJurisdiction, 
  Registration,
  TaxRegistration, 
  TaxPeriod, 
  CalculationProvenance, 
  TaxFiling, 
  TaxPayment, 
  TaxNotice, 
  TaxReturn,
  FilingFrequency 
} from './common';

// ============================================================================
// SALES & USE TAX DOMAIN GRAPH OBJECTS
// ============================================================================

export type NexusType = 'ECONOMIC' | 'PHYSICAL' | 'AFFILIATE' | 'CLICK_THROUGH' | 'MARKETPLACE';
export type SourcingRule = 'DESTINATION' | 'ORIGIN' | 'HYBRID';
export type TaxabilityStatus = 'TAXABLE' | 'EXEMPT' | 'PARTIALLY_TAXABLE' | 'ZERO_RATED';

export interface SalesTaxProfile {
  id: string;
  businessId: string;
  legalEntityName: string;
  primaryHomeState: string;
  activeRegistrationsCount: number;
  nexusStatesCount: number;
  sourcingDefault: SourcingRule;
  updatedAt: string;
}

export interface SalesTaxRegistration extends TaxRegistration {
  domain: 'SALES_USE_TAX';
  stateCode: string;
  salesTaxPermitNumber: string;
  localJurisdictionsCovered: string[];
  effectiveDate: string;
  renewalDate?: string;
}

export interface SalesTaxJurisdiction extends TaxJurisdiction {
  stateCode: string;
  countyName?: string;
  cityName?: string;
  districtName?: string;
  fipsCode?: string;
}

export interface SalesTaxState extends SalesTaxJurisdiction {
  level: 'STATE';
  stateCode: string; // e.g. "CA", "NY", "TX", "WA"
  stateName: string;
  departmentOfRevenueName: string;
  hasStatewideSalesTax: boolean; // false for AK, DE, MT, NH, OR
  defaultSourcing: SourcingRule;
  economicNexusThresholdAmount: number;
  economicNexusTransactionThreshold?: number;
}

export interface SalesTaxLocality extends SalesTaxJurisdiction {
  level: 'COUNTY' | 'CITY';
  localityType: 'COUNTY' | 'CITY' | 'TOWNSHIP' | 'BOROUGH';
  parentStateCode: string;
  localTaxCode: string;
  isHomeRuleJurisdiction: boolean; // true for states like Colorado or Louisiana where cities administer their own tax
}

export interface SalesTaxDistrict extends SalesTaxJurisdiction {
  level: 'SPECIAL_DISTRICT';
  districtType: 'TRANSIT_MTA' | 'STADIUM' | 'HOSPITAL' | 'POLICE_FIRE' | 'TOURISM' | 'ECONOMIC_DEVELOPMENT';
  parentStateCode: string;
  parentCounties: string[];
  specialRate: number;
}

export interface SalesTaxRateVersion {
  id: string;
  versionNumber: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  stateRate: number;      // e.g. 0.0600 (6.0%)
  countyRate: number;     // e.g. 0.0125 (1.25%)
  cityRate: number;       // e.g. 0.0100 (1.0%)
  specialDistrictRate: number; // e.g. 0.0050 (0.50% transit/stadium)
  compositeRate: number;  // sum of above: e.g. 0.0875 (8.75%)
  statuteCitation: string;
}

export interface SalesTaxRate {
  id: string;
  jurisdictionId: string;
  jurisdictionName: string;
  currentVersion: SalesTaxRateVersion;
  historicalVersions: SalesTaxRateVersion[];
}

export interface SalesTaxNexus {
  id: string;
  stateCode: string;
  stateName: string;
  nexusType: NexusType;
  thresholdType: 'SALES_AMOUNT_ONLY' | 'TRANSACTION_COUNT_ONLY' | 'AMOUNT_OR_TRANSACTION' | 'AMOUNT_AND_TRANSACTION' | 'PHYSICAL_PRESENCE';
  thresholdAmount: number; // e.g. $100,000 or $500,000
  thresholdTransactionCount?: number; // e.g. 200 transactions
  measurementPeriod: 'TRAILING_12_MONTHS' | 'CALENDAR_YEAR' | 'CURRENT_OR_PREVIOUS_YEAR';
  currentTrailingSales: number;
  currentTrailingTransactions: number;
  percentageTowardsThreshold: number;
  hasNexus: boolean;
  nexusTriggerDate?: string;
  registrationDeadline?: string;
  registrationStatus: 'NOT_REQUIRED' | 'PENDING_REGISTRATION' | 'REGISTERED' | 'EXEMPT';
  filingObligation: FilingFrequency;
  events: NexusEvent[];
}

export interface NexusEvent {
  id: string;
  eventType: 'THRESHOLD_BREACHED' | 'PHYSICAL_PROPERTY_ADDED' | 'REMOTE_EMPLOYEE_HIRED' | 'TRADE_SHOW_ATTENDANCE';
  description: string;
  occurredAt: string;
  metricValue?: number;
  evaluatedRuleId: string;
}

export interface ProductTaxCategory {
  id: string;
  code: string; // e.g., "SW_SAAS", "DIGITAL_AUDIO", "APPAREL", "TANGIBLE_PROPERTY"
  name: string;
  description: string;
  isTangible: boolean;
  isDigital: boolean;
  isService: boolean;
}

export interface ServiceTaxCategory {
  id: string;
  code: string;
  name: string;
  serviceCategoryType: 'PROFESSIONAL' | 'IT_CONSULTING' | 'REPAIR' | 'SAAS_IMPLEMENTATION';
  generallyTaxableStates: string[];
}

export interface DigitalProductCategory {
  id: string;
  code: string;
  name: string;
  digitalType: 'SAAS_B2B' | 'SAAS_B2C' | 'DOWNLOADABLE_SOFTWARE' | 'EBOOK' | 'STREAMING_MEDIA';
  ruleNotes: string;
}

export interface SalesTaxabilityRule {
  id: string;
  productCategoryId: string;
  jurisdictionId: string;
  effectiveDate: string;
  status: TaxabilityStatus;
  rateModifier?: number; // for partial taxation or discount
  ruleCitation: string; // e.g. "NY Tax Law § 1105(c)(1) / TSB-M-08(7)S"
  exemptionConditions?: string[];
  version: string;
}

export interface SalesTaxCustomer {
  id: string;
  customerNumber: string;
  name: string;
  entityType: 'INDIVIDUAL' | 'BUSINESS' | 'NON_PROFIT' | 'GOVERNMENT';
  isTaxExempt: boolean;
  exemptionCertificates: ExemptionCertificate[];
}

export interface ExemptionCertificate {
  id: string;
  certificateNumber: string;
  certificateType: 'RESALE' | 'MANUFACTURING' | 'EXEMPT_ENTITY' | 'DIRECT_PAY_PERMIT';
  issuingState: string;
  issuedToBuyerName: string;
  issuedBySellerName: string;
  issuedDate: string;
  expirationDate: string;
  documentHash: string;
  isValid: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'AUDIT_FLAGGED';
}

export interface ResaleCertificate extends ExemptionCertificate {
  certificateType: 'RESALE';
  permitNumberVerified: boolean;
}

export interface CustomerExemption {
  customerId: string;
  jurisdictionId: string;
  certificateId: string;
  validThrough: string;
}

export interface SalesTaxTransaction {
  id: string;
  transactionNumber: string;
  orderId: string;
  salesChannel: 'DIRECT_ECOMMERCE' | 'STRIPE' | 'SHOPIFY' | 'AMAZON' | 'SQUARE' | 'ETSY' | 'WOOCOMMERCE' | 'PAYPAL' | 'POS_TERMINAL' | 'CUSTOM_API';
  isMarketplaceFacilitator: boolean;
  marketplaceName?: string;
  transactionDate: string;
  sellerLocation: {
    address: string;
    city: string;
    county: string;
    state: string;
    zipCode: string;
  };
  buyerLocation: {
    address: string;
    city: string;
    county: string;
    state: string;
    zipCode: string;
  };
  shipToLocation?: {
    city: string;
    county: string;
    state: string;
    zipCode: string;
  };
  billToLocation?: {
    city: string;
    county: string;
    state: string;
    zipCode: string;
  };
  serviceLocation?: {
    city: string;
    county: string;
    state: string;
    zipCode: string;
  };
  productCategoryId: string;
  productName: string;
  customerCategory: 'B2B' | 'B2C';
  customerId?: string;
  sourcingApplied: SourcingRule;
  grossAmount: number;
  exemptAmount: number;
  taxableAmount: number;
  rateApplied: SalesTaxRateVersion;
  taxCalculated: number;
  taxCollected: number;
  marketplaceCollectedAmount: number;
  directlyCollectedAmount: number;
  currency: string;
  provenance: CalculationProvenance;
}

export interface Marketplace {
  id: string;
  name: string; // e.g. "Amazon US", "Etsy", "Shopify Marketplace"
  facilitatorLawCompliant: boolean;
  collectsAndRemitsOnBehalf: boolean;
}

export interface MarketplaceFacilitator {
  marketplaceId: string;
  coveredStates: string[];
  reportingMechanism: 'SELLER_1099K' | 'STATEMENT_PORTAL';
}

export interface MarketplaceTransaction extends SalesTaxTransaction {
  isMarketplaceFacilitator: true;
  facilitatorRemitted: boolean;
}

export interface SalesTaxReturnPeriod extends TaxPeriod {
  domain: 'SALES_USE_TAX';
  jurisdictionId: string;
}

export interface SalesTaxReturn extends TaxReturn {
  id: string;
  returnPeriodId: string;
  jurisdictionId: string;
  stateCode: string;
  grossSales: number;
  taxableSales: number;
  exemptSales: number;
  marketplaceSales: number;
  directSales: number;
  stateTaxDue: number;
  localTaxDue: number;
  totalTaxOwed: number;
  taxCollected: number;
  prepaymentsDeducted: number;
  netRemittanceDue: number;
  filing: SalesTaxFiling;
}

export interface SalesTaxFiling extends TaxFiling {
  domain: 'SALES_USE_TAX';
  stateReturnReferenceId?: string;
  localSchedulesIncluded: string[];
}

export interface SalesTaxPayment extends TaxPayment {
  domain: 'SALES_USE_TAX';
  returnId: string;
}

export interface SalesTaxNotice extends TaxNotice {
  domain: 'SALES_USE_TAX';
  stateCode: string;
  auditPeriod?: string;
}

export interface UseTaxPosition {
  id: string;
  taxYear: number;
  itemDescription: string;
  purchaseDate: string;
  vendorName: string;
  purchaseAmount: number;
  salesTaxPaidAtPurchase: number;
  destinationJurisdictionId: string;
  applicableUseTaxRate: number;
  useTaxOwed: number;
  provenance: CalculationProvenance;
}

export interface SalesTaxReconciliationSummary {
  periodId: string;
  stateCode: string;
  grossSalesECommerce: number;
  grossSalesGeneralLedger: number;
  taxableSalesTotal: number;
  exemptSalesTotal: number;
  marketplaceFacilitatorSales: number;
  directMerchantSales: number;
  taxCollectedByMerchant: number;
  taxCollectedByMarketplaces: number;
  taxRemittedToState: number;
  varianceAmount: number;
  isDiscrepancyDetected: boolean;
  reconciliationItems: {
    channel: string;
    recordedTax: number;
    expectedTax: number;
    variance: number;
    explanation?: string;
  }[];
}

// Ingestion Abstraction for High-Volume Commerce Data Sources
export interface CommerceDataProvider {
  sourceName: 'Stripe' | 'Shopify' | 'Square' | 'Amazon' | 'Etsy' | 'WooCommerce' | 'PayPal' | 'POS_Terminal' | 'Accounting_GL' | 'CustomCommerceAPI';
  streamTransactions(businessId: string, sinceDate: string): AsyncIterable<SalesTaxTransaction>;
  fetchBatchTransactions(businessId: string, startDate: string, endDate: string): Promise<SalesTaxTransaction[]>;
  fetchExemptionCertificates(businessId: string): Promise<ExemptionCertificate[]>;
}

// Provider Abstraction for third-party sales tax infrastructure
export interface SalesTaxEngineProvider {
  providerName: string; // e.g. "NativeTaxOS", "AvalaraAdapter", "TaxJarAdapter", "VertexAdapter"
  determineNexus(stateCode: string, trailingSales: number, txCount: number): Promise<SalesTaxNexus>;
  determineTaxability(productCode: string, jurisdictionId: string): Promise<SalesTaxabilityRule>;
  determineJurisdiction(address: { zipCode: string; state: string; city: string }): Promise<SalesTaxJurisdiction>;
  calculateTax(transaction: Partial<SalesTaxTransaction>): Promise<SalesTaxTransaction>;
  validateReturn(salesReturn: SalesTaxReturn): Promise<{ isValid: boolean; errors: string[] }>;
  generateReturn(periodId: string, jurisdictionId: string): Promise<SalesTaxReturn>;
  generateFilingPayload(salesReturnId: string): Promise<{ payload: Record<string, any>; hash: string }>;
  fileReturn(salesReturnId: string): Promise<{ filingId: string; confirmation: string }>;
  retrieveFilingStatus(filingId: string): Promise<{ status: string; timestamp: string }>;
}
