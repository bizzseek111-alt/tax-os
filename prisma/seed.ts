import { PrismaClient, UserRole, SubscriptionTier, CaseType, ReviewMode, CaseStatus, RiskLevel, TaxDomain, ObligationStatus, CredentialType, CredentialStatus, TaskOwnerType, TaskStatus, TaskPriority, DocumentType, DocumentStatus, ExtractionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuditEventService } from '../src/server/services/audit';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Autonomous TaxOS Phase 1 Database Seed...');

  // 1. Clean existing records in dependency order
  console.log('🧹 Purging existing test records...');
  await prisma.privilegedPiiAccessGrant.deleteMany({});
  await prisma.auditEvent.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.taxDecision.deleteMany({});
  await prisma.reviewTask.deleteMany({});
  await prisma.professionalReview.deleteMany({});
  await prisma.taxReview.deleteMany({});
  await prisma.taxCalculation.deleteMany({});
  await prisma.taxFiling.deleteMany({});
  await prisma.taxTask.deleteMany({});
  await prisma.taxPosition.deleteMany({});
  await prisma.taxFact.deleteMany({});
  await prisma.taxObligation.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.agentRun.deleteMany({});
  await prisma.consent.deleteMany({});
  await prisma.integrationConnection.deleteMany({});
  await prisma.taxCase.deleteMany({});
  await prisma.businessProfile.deleteMany({});
  await prisma.taxpayerProfile.deleteMany({});
  await prisma.professionalProfile.deleteMany({});
  await prisma.credential.deleteMany({});
  await prisma.userProfile.deleteMany({});
  await prisma.organizationMembership.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.taxJurisdiction.deleteMany({});

  // 2. Seed Tax Jurisdictions
  console.log('🏛️ Seeding Tax Jurisdictions...');
  const jurisdictions = [
    { code: 'US-FED', name: 'United States Federal', country: 'US', level: 'FEDERAL', authorityName: 'Internal Revenue Service (IRS)', portalUrl: 'https://www.irs.gov' },
    { code: 'US-CA', name: 'California Franchise Tax Board', country: 'US', level: 'STATE', authorityName: 'California FTB', portalUrl: 'https://www.ftb.ca.gov' },
    { code: 'CA-CDTFA', name: 'California Dept of Tax and Fee Administration', country: 'US', level: 'STATE', authorityName: 'CDTFA', portalUrl: 'https://www.cdtfa.ca.gov' },
    { code: 'US-NY', name: 'New York Department of Taxation and Finance', country: 'US', level: 'STATE', authorityName: 'NYS-DTF', portalUrl: 'https://www.tax.ny.gov' },
    { code: 'US-TX', name: 'Texas Comptroller of Public Accounts', country: 'US', level: 'STATE', authorityName: 'Texas Comptroller', portalUrl: 'https://comptroller.texas.gov' },
    { code: 'US-FL', name: 'Florida Department of Revenue', country: 'US', level: 'STATE', authorityName: 'FL DOR', portalUrl: 'https://floridarevenue.com' },
    { code: 'US-IL', name: 'Illinois Department of Revenue', country: 'US', level: 'STATE', authorityName: 'IDOR', portalUrl: 'https://tax.illinois.gov' },
    { code: 'US-WA', name: 'Washington Department of Revenue', country: 'US', level: 'STATE', authorityName: 'WA DOR', portalUrl: 'https://dor.wa.gov' },
  ];

  for (const j of jurisdictions) {
    await prisma.taxJurisdiction.create({ data: j });
  }

  // 3. Seed Organizations (Tenants)
  console.log('🏢 Seeding Organizations (Tenants)...');
  const apexOrg = await prisma.organization.create({
    data: {
      id: 'org-apex-dynamics-2026',
      name: 'Apex Dynamics LLC',
      slug: 'apex-dynamics',
      fein: '82-9481029',
      tier: SubscriptionTier.FULL_TAX_OS,
      settings: {
        enforceMfa: true,
        defaultTaxYear: 2026,
        primaryState: 'CA',
        filingRegimes: ['FEDERAL_1040', 'CA_540', 'CA_CDTFA_SALES', 'FED_941_PAYROLL']
      }
    }
  });

  const boutiqueOrg = await prisma.organization.create({
    data: {
      id: 'org-boutique-roasters-2026',
      name: 'Boutique Roasters Inc',
      slug: 'boutique-roasters',
      fein: '47-3829104',
      tier: SubscriptionTier.BUSINESS_CORE,
      settings: {
        enforceMfa: false,
        defaultTaxYear: 2026,
        primaryState: 'NY'
      }
    }
  });

  // Seed Business Profile for Apex
  await prisma.businessProfile.create({
    data: {
      organizationId: apexOrg.id,
      legalName: 'Apex Dynamics LLC',
      dba: 'Rivera Consulting',
      entityType: 'S_CORP',
      fein: '82-9481029',
      naicsCode: '541511',
      incorporationState: 'CA',
      headquartersState: 'CA'
    }
  });

  // Seed Business Profile for Boutique Roasters
  await prisma.businessProfile.create({
    data: {
      organizationId: boutiqueOrg.id,
      legalName: 'Boutique Roasters Inc',
      dba: 'Artisan Coffee Works',
      entityType: 'LLC',
      fein: '47-3829104',
      naicsCode: '722515',
      incorporationState: 'NY',
      headquartersState: 'NY'
    }
  });

  // 4. Seed Users & Passwords (bcrypt salt rounds = 10)
  console.log('👥 Seeding Users & Roles...');
  const commonPasswordHash = await bcrypt.hash('TaxOS2026!', 10);

  // A. Primary Taxpayer (Alex Rivera)
  const alexUser = await prisma.user.create({
    data: {
      id: 'usr-alex-rivera-2026',
      email: 'alex.rivera@apex.example.com',
      passwordHash: commonPasswordHash,
      fullName: 'Alex Rivera',
      role: UserRole.TAXPAYER,
      isMfaEnabled: true,
      emailVerifiedAt: new Date(),
      userProfile: {
        create: {
          phone: '+1 (415) 890-1284',
          addressLine1: '450 Mission Street',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          taxResidentState: 'US-CA'
        }
      },
      taxpayerProfile: {
        create: {
          filingStatus: 'SINGLE',
          ssnEncrypted: 'AES256:CIPHERTEXT:000-12-6789:SECURE',
          ssnLast4: '6789',
          occupation: 'Principal Cloud Architect & Software Consultant',
          dependentsCount: 0
        }
      },
      memberships: {
        create: {
          organizationId: apexOrg.id,
          role: UserRole.TAXPAYER
        }
      }
    }
  });

  // B. CPA Reviewer (Sarah Jenkins) - CA and FED
  const sarahUser = await prisma.user.create({
    data: {
      id: 'usr-cpa-sarah-jenkins',
      email: 'cpa.sarah.jenkins@taxos.example.com',
      passwordHash: commonPasswordHash,
      fullName: 'Sarah Jenkins, CPA',
      role: UserRole.CPA,
      isMfaEnabled: true,
      emailVerifiedAt: new Date(),
      userProfile: {
        create: {
          phone: '+1 (213) 441-9021',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90012'
        }
      },
      professionalProfile: {
        create: {
          credentialType: CredentialType.CPA,
          credentialNumber: 'CPA-CA-149204',
          credentialStatus: CredentialStatus.ACTIVE,
          ptin: 'P01849201',
          stateBarOrBoard: 'California Board of Accountancy',
          authorizedJurisdictions: ['US-FED', 'US-CA'],
          authorizedTaxDomains: ['INCOME_TAX', 'SALES_TAX'],
          maxActiveCaseCapacity: 25,
          currentActiveCases: 4
        }
      },
      credentials: {
        create: {
          type: CredentialType.CPA,
          identifier: 'CA CPA #149204',
          issuingBody: 'California Board of Accountancy',
          status: CredentialStatus.ACTIVE,
          verifiedAt: new Date()
        }
      },
      memberships: {
        create: {
          organizationId: apexOrg.id,
          role: UserRole.CPA
        }
      }
    }
  });

  // C. Enrolled Agent (Marcus Vance) - NY and FED
  const marcusUser = await prisma.user.create({
    data: {
      id: 'usr-ea-marcus-vance',
      email: 'ea.marcus.vance@taxos.example.com',
      passwordHash: commonPasswordHash,
      fullName: 'Marcus Vance, EA',
      role: UserRole.EA,
      isMfaEnabled: true,
      emailVerifiedAt: new Date(),
      userProfile: {
        create: {
          phone: '+1 (212) 555-0199',
          city: 'New York',
          state: 'NY',
          postalCode: '10001'
        }
      },
      professionalProfile: {
        create: {
          credentialType: CredentialType.ENROLLED_AGENT,
          credentialNumber: 'EA-00129482',
          credentialStatus: CredentialStatus.ACTIVE,
          ptin: 'P02948192',
          stateBarOrBoard: 'IRS Return Preparer Office',
          authorizedJurisdictions: ['US-FED', 'US-NY'],
          authorizedTaxDomains: ['INCOME_TAX', 'PAYROLL_TAX'],
          maxActiveCaseCapacity: 30,
          currentActiveCases: 6
        }
      },
      credentials: {
        create: {
          type: CredentialType.ENROLLED_AGENT,
          identifier: 'EA #00129482',
          issuingBody: 'IRS Return Preparer Office',
          status: CredentialStatus.ACTIVE,
          verifiedAt: new Date()
        }
      },
      memberships: {
        create: {
          organizationId: apexOrg.id,
          role: UserRole.EA
        }
      }
    }
  });

  // D. Tax Attorney (Elena Rostova)
  const elenaUser = await prisma.user.create({
    data: {
      id: 'usr-attorney-elena-rostova',
      email: 'attorney.elena.rostova@taxos.example.com',
      passwordHash: commonPasswordHash,
      fullName: 'Elena Rostova, J.D., LL.M.',
      role: UserRole.ATTORNEY,
      isMfaEnabled: true,
      emailVerifiedAt: new Date(),
      userProfile: {
        create: {
          phone: '+1 (415) 332-9988',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94104'
        }
      },
      professionalProfile: {
        create: {
          credentialType: CredentialType.TAX_ATTORNEY,
          credentialNumber: 'BAR-CA-291048',
          credentialStatus: CredentialStatus.ACTIVE,
          ptin: 'P03948172',
          stateBarOrBoard: 'State Bar of California',
          authorizedJurisdictions: ['US-FED', 'US-CA', 'US-NY'],
          authorizedTaxDomains: ['INCOME_TAX', 'SALES_TAX', 'PAYROLL_TAX'],
          maxActiveCaseCapacity: 15,
          currentActiveCases: 2
        }
      },
      credentials: {
        create: {
          type: CredentialType.TAX_ATTORNEY,
          identifier: 'State Bar #291048',
          issuingBody: 'State Bar of California',
          status: CredentialStatus.ACTIVE,
          verifiedAt: new Date()
        }
      },
      memberships: {
        create: {
          organizationId: apexOrg.id,
          role: UserRole.ATTORNEY
        }
      }
    }
  });

  // E. Operations Manager (David Kim)
  await prisma.user.create({
    data: {
      id: 'usr-ops-david-kim',
      email: 'ops.david.kim@taxos.example.com',
      passwordHash: commonPasswordHash,
      fullName: 'David Kim',
      role: UserRole.OPERATIONS_MANAGER,
      isMfaEnabled: true,
      emailVerifiedAt: new Date(),
      memberships: {
        create: {
          organizationId: apexOrg.id,
          role: UserRole.OPERATIONS_MANAGER
        }
      }
    }
  });

  // F. Super Admin (Rachel Cohen)
  await prisma.user.create({
    data: {
      id: 'usr-admin-rachel-cohen',
      email: 'admin.rachel.cohen@taxos.example.com',
      passwordHash: commonPasswordHash,
      fullName: 'Rachel Cohen',
      role: UserRole.SUPER_ADMIN,
      isMfaEnabled: true,
      emailVerifiedAt: new Date(),
      memberships: {
        create: {
          organizationId: apexOrg.id,
          role: UserRole.SUPER_ADMIN
        }
      }
    }
  });

  // G. Isolated Tenant User (Boutique Roasters)
  const boutiqueTaxpayer = await prisma.user.create({
    data: {
      id: 'usr-boutique-taxpayer',
      email: 'external.taxpayer@boutique.example.com',
      passwordHash: commonPasswordHash,
      fullName: 'Noah Green',
      role: UserRole.TAXPAYER,
      isMfaEnabled: false,
      emailVerifiedAt: new Date(),
      memberships: {
        create: {
          organizationId: boutiqueOrg.id,
          role: UserRole.TAXPAYER
        }
      }
    }
  });

  // 5. Seed Canonical TaxCase for Alex Rivera (Apex Dynamics)
  console.log('📑 Seeding Canonical TaxCase for Apex Dynamics...');
  const alexTaxCase = await prisma.taxCase.create({
    data: {
      id: 'case-2026-alex-rivera',
      organizationId: apexOrg.id,
      ownerId: alexUser.id,
      taxYear: 2026,
      caseType: CaseType.MULTI_DOMAIN_BUSINESS,
      reviewMode: ReviewMode.HUMAN_VERIFIED,
      status: CaseStatus.NEEDS_YOU,
      riskLevel: RiskLevel.LOW,
      grossIncomeCents: 14820000n,          // $148,200.00
      deductionsCents: 3044000n,            // $30,440.00
      taxableIncomeCents: 12165000n,        // $121,650.00
      federalRefundOrDueCents: 412000n,     // +$4,120.00 Federal Refund
      stateDueCents: 184000n,               // -$1,840.00 CA Balance Due
      completionPercent: 92,
      auditHash: 'sha256:4a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b'
    }
  });

  // Seed Isolated TaxCase for Boutique Roasters (to verify isolation)
  const boutiqueTaxCase = await prisma.taxCase.create({
    data: {
      id: 'case-2026-boutique-roasters',
      organizationId: boutiqueOrg.id,
      ownerId: boutiqueTaxpayer.id,
      taxYear: 2026,
      caseType: CaseType.BUSINESS_INCOME,
      reviewMode: ReviewMode.FULL_SERVICE,
      status: CaseStatus.DRAFT,
      riskLevel: RiskLevel.MEDIUM,
      grossIncomeCents: 85000000n,          // $850,000.00
      deductionsCents: 62000000n,           // $620,000.00
      taxableIncomeCents: 23000000n,        // $230,000.00
      federalRefundOrDueCents: -1850000n,   // -$18,500.00 Tax Due
      stateDueCents: 420000n,
      completionPercent: 35,
      auditHash: 'sha256:9999999999999999999999999999999999999999'
    }
  });

  // 6. Seed Multi-Domain Tax Obligations for Alex Rivera
  console.log('⚖️ Seeding Multi-Domain Tax Obligations...');
  const obFed = await prisma.taxObligation.create({
    data: {
      id: 'ob-inc-2026-fed',
      taxCaseId: alexTaxCase.id,
      taxDomain: TaxDomain.INCOME_TAX,
      jurisdictionCode: 'US-FED',
      period: '2026-ANNUAL',
      status: ObligationStatus.CALCULATED,
      ruleSetVersion: '2026.1-IRC',
      reviewStatus: 'PENDING_HUMAN_VERIFICATION',
      filingStatus: 'UNFILED',
      dueDate: new Date('2027-04-15T23:59:59Z')
    }
  });

  const obCa = await prisma.taxObligation.create({
    data: {
      id: 'ob-inc-2026-ca',
      taxCaseId: alexTaxCase.id,
      taxDomain: TaxDomain.INCOME_TAX,
      jurisdictionCode: 'US-CA',
      period: '2026-ANNUAL',
      status: ObligationStatus.CALCULATED,
      ruleSetVersion: '2026.1-FTB',
      reviewStatus: 'PENDING_HUMAN_VERIFICATION',
      filingStatus: 'UNFILED',
      dueDate: new Date('2027-04-15T23:59:59Z')
    }
  });

  const obSales = await prisma.taxObligation.create({
    data: {
      id: 'ob-sales-2026-q1-cdtfa',
      taxCaseId: alexTaxCase.id,
      taxDomain: TaxDomain.SALES_TAX,
      jurisdictionCode: 'CA-CDTFA',
      period: '2026-Q1',
      status: ObligationStatus.IN_PROGRESS,
      ruleSetVersion: '2026.1-CDTFA',
      reviewStatus: 'PENDING',
      filingStatus: 'UNFILED',
      dueDate: new Date('2026-04-30T23:59:59Z')
    }
  });

  const obPayroll = await prisma.taxObligation.create({
    data: {
      id: 'ob-pay-2026-q1-fed',
      taxCaseId: alexTaxCase.id,
      taxDomain: TaxDomain.PAYROLL_TAX,
      jurisdictionCode: 'US-FED',
      period: '2026-Q1',
      status: ObligationStatus.IN_PROGRESS,
      ruleSetVersion: '2026.1-FICA',
      reviewStatus: 'PENDING',
      filingStatus: 'UNFILED',
      dueDate: new Date('2026-04-30T23:59:59Z')
    }
  });

  // 7. Seed Canonical TaxTasks (Needs You queue)
  console.log('📌 Seeding Canonical TaxTasks...');
  await prisma.taxTask.create({
    data: {
      id: 'task-ny-01',
      taxCaseId: alexTaxCase.id,
      taxObligationId: obFed.id,
      taskType: 'DEDUCTION_VERIFICATION',
      ownerType: TaskOwnerType.TAXPAYER,
      ownerId: alexUser.id,
      status: TaskStatus.PENDING_TAXPAYER,
      priority: TaskPriority.HIGH,
      reason: 'Delta Air Lines ticket to San Francisco ($412.50) requires business purpose confirmation under 26 U.S.C. § 162.',
      financialImpactCents: 41250n,
      requiredEvidence: ['receipt_hash', 'travel_purpose'],
      auditRecordHash: 'sha256:7b1e8d91f24a68c093a129d816f19812984128f119e8cfa10291e1291823901b'
    }
  });

  await prisma.taxTask.create({
    data: {
      id: 'task-ny-02',
      taxCaseId: alexTaxCase.id,
      taxObligationId: obFed.id,
      taskType: 'HOME_OFFICE_VERIFICATION',
      ownerType: TaskOwnerType.TAXPAYER,
      ownerId: alexUser.id,
      status: TaskStatus.PENDING_TAXPAYER,
      priority: TaskPriority.MEDIUM,
      reason: 'Home office deduction calculation of $1,500 requires square footage affirmation under 26 U.S.C. § 280A.',
      financialImpactCents: 150000n,
      requiredEvidence: ['square_footage_confirmation'],
      auditRecordHash: 'sha256:3c8f12a9b40d58e172a9102c9182301928410283019283019283019283019283'
    }
  });

  await prisma.taxTask.create({
    data: {
      id: 'task-ny-03',
      taxCaseId: alexTaxCase.id,
      taxObligationId: obFed.id,
      taskType: 'FORM_1099K_RECONCILIATION',
      ownerType: TaskOwnerType.TAXPAYER,
      ownerId: alexUser.id,
      status: TaskStatus.PENDING_TAXPAYER,
      priority: TaskPriority.CRITICAL,
      reason: 'Stripe 1099-K reporting $12,400 unlinked gross payment transactions requires Schedule C revenue reconciliation under 26 U.S.C. § 6050W.',
      financialImpactCents: 1240000n,
      requiredEvidence: ['stripe_payout_export', 'invoicing_ledger'],
      auditRecordHash: 'sha256:9f8e7d6c5b4a3a2b1c0d9e8f7a6b5c4d3e2f1a0b1c2d3e4f5a6b7c8d9e0f1a2b'
    }
  });

  // 8. Seed TaxFacts and TaxPositions
  console.log('📊 Seeding TaxFacts & TaxPositions...');
  const factWages = await prisma.taxFact.create({
    data: {
      id: 'fact-w2-gross-wages',
      taxCaseId: alexTaxCase.id,
      category: 'INCOME',
      key: 'w2_box1_wages',
      valueCents: 11000000n,
      confidence: 1.0,
      isVerified: true,
      verifiedByUserId: alexUser.id
    }
  });

  const fact1099 = await prisma.taxFact.create({
    data: {
      id: 'fact-1099nec-nonemp',
      taxCaseId: alexTaxCase.id,
      category: 'INCOME',
      key: 'form_1099nec_box1',
      valueCents: 3820000n,
      confidence: 1.0,
      isVerified: true,
      verifiedByUserId: alexUser.id
    }
  });

  const posSoftware = await prisma.taxPosition.create({
    data: {
      id: 'pos-sched-c-software',
      taxCaseId: alexTaxCase.id,
      taxObligationId: obFed.id,
      positionType: 'DEDUCTION',
      statutoryCitation: '26 U.S.C. § 162(a)',
      amountCents: 489000n,
      rationale: 'Necessary ordinary trade/business expenses: AWS infrastructure and GitHub subscriptions directly generating client deliverables.',
      riskScore: 0.05,
      status: 'CONFIRMED'
    }
  });

  const posQbi = await prisma.taxPosition.create({
    data: {
      id: 'pos-qbi-deduction',
      taxCaseId: alexTaxCase.id,
      taxObligationId: obFed.id,
      positionType: 'DEDUCTION',
      statutoryCitation: '26 U.S.C. § 199A',
      amountCents: 1195000n,
      rationale: 'Qualified Business Income 20% pass-through deduction on eligible qualified trade or business income below phase-out thresholds.',
      riskScore: 0.12,
      status: 'CONFIRMED'
    }
  });

  // 9. Seed ReviewTasks for Professional Reviewers
  console.log('🩺 Seeding ReviewTasks (Jurisdiction & Domain Routing)...');
  // CA Income Review Task -> Sarah Jenkins is qualified (CA, INCOME_TAX)
  await prisma.reviewTask.create({
    data: {
      id: 'rev-task-ca-540-01',
      taxCaseId: alexTaxCase.id,
      taxObligationId: obCa.id,
      taxPositionId: posSoftware.id,
      jurisdiction: 'US-CA',
      taxDomain: TaxDomain.INCOME_TAX,
      requiredRole: UserRole.CPA,
      assignedUserId: sarahUser.id,
      riskLevel: RiskLevel.LOW,
      materialityCents: 184000n,
      status: 'IN_REVIEW',
      deadline: new Date('2026-04-10T17:00:00Z'),
      notes: 'Confirm California Form 540 Schedule CA non-conformity adjustments for depreciation.'
    }
  });

  // NY Income Review Task -> Marcus Vance is qualified (NY, INCOME_TAX); Sarah is NOT
  await prisma.reviewTask.create({
    data: {
      id: 'rev-task-ny-it201-01',
      taxCaseId: boutiqueTaxCase.id,
      jurisdiction: 'US-NY',
      taxDomain: TaxDomain.INCOME_TAX,
      requiredRole: UserRole.EA,
      assignedUserId: marcusUser.id,
      riskLevel: RiskLevel.MEDIUM,
      materialityCents: 420000n,
      status: 'IN_REVIEW',
      deadline: new Date('2026-04-12T17:00:00Z'),
      notes: 'Verify NY Form IT-201 apportionment formula and resident credit computations.'
    }
  });

  // 10. Seed Documents & Object Vault metadata
  console.log('📁 Seeding Documents & Evidence lineage...');
  const docW2 = await prisma.document.create({
    data: {
      id: 'doc-w2-2026-alex',
      organizationId: apexOrg.id,
      taxCaseId: alexTaxCase.id,
      ownerId: alexUser.id,
      filename: '2026_Form_W2_Rivera.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 184920n,
      storageKey: 'vault/apex/case-2026-alex-rivera/2026_Form_W2_Rivera.pdf',
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      documentType: DocumentType.FORM_W2,
      taxYear: 2026,
      status: DocumentStatus.PROCESSED,
      extractionStatus: ExtractionStatus.EXTRACTED
    }
  });

  const doc1099k = await prisma.document.create({
    data: {
      id: 'doc-1099k-2026-stripe',
      organizationId: apexOrg.id,
      taxCaseId: alexTaxCase.id,
      ownerId: alexUser.id,
      filename: '1099K_Stripe_Payments_2026.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 94812n,
      storageKey: 'vault/apex/case-2026-alex-rivera/1099K_Stripe_Payments_2026.pdf',
      sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      documentType: DocumentType.FORM_1099_K,
      taxYear: 2026,
      status: DocumentStatus.PROCESSED,
      extractionStatus: ExtractionStatus.EXTRACTED
    }
  });

  // Seed Evidence linking Fact & Document
  await prisma.evidence.create({
    data: {
      taxCaseId: alexTaxCase.id,
      documentId: docW2.id,
      factId: factWages.id,
      relationType: 'SUBSTANTIATES',
      hash: 'sha256:b10a8db164e0754105b7a99be72e3fe5'
    }
  });

  await prisma.evidence.create({
    data: {
      taxCaseId: alexTaxCase.id,
      documentId: doc1099k.id,
      factId: fact1099.id,
      relationType: 'PROVES_LINE',
      hash: 'sha256:c21b9ec275f1865216c8b00cf83f4gf6'
    }
  });

  // 11. Seed Cryptographic Audit Trail (SHA-256 Block Hashing)
  console.log('⛓️ Seeding Cryptographic Audit Trail...');
  
  // Block 1: Organization Genesis
  await AuditEventService.recordEvent({
    organizationId: apexOrg.id,
    actorId: alexUser.id,
    actorRole: UserRole.TAXPAYER,
    action: 'ORGANIZATION_INITIALIZED',
    objectType: 'Organization',
    objectId: apexOrg.id,
    reason: 'Tenant account provisioned under subscription tier FULL_TAX_OS'
  });

  // Block 2: TaxCase Created
  await AuditEventService.recordEvent({
    organizationId: apexOrg.id,
    actorId: alexUser.id,
    actorRole: UserRole.TAXPAYER,
    taxCaseId: alexTaxCase.id,
    action: 'TAX_CASE_CREATED',
    objectType: 'TaxCase',
    objectId: alexTaxCase.id,
    reason: 'Tax year 2026 multi-domain return initiated'
  });

  // Block 3: Documents Ingested
  await AuditEventService.recordEvent({
    organizationId: apexOrg.id,
    actorId: alexUser.id,
    actorRole: UserRole.TAXPAYER,
    taxCaseId: alexTaxCase.id,
    action: 'DOCUMENT_INGESTED',
    objectType: 'Document',
    objectId: docW2.id,
    reason: 'Form W-2 uploaded, verified sha256 checksum and extracted wages fact'
  });

  console.log('✅ Phase 1 Database Seed Completed Successfully!');
  console.log('--------------------------------------------------');
  console.log(`Tenants: 2 (${apexOrg.name}, ${boutiqueOrg.name})`);
  console.log(`Users: 7 (Taxpayers, CPA, EA, Attorney, Ops, SuperAdmin)`);
  console.log(`Jurisdictions: ${jurisdictions.length}`);
  console.log(`Tax Cases: 2 (Multi-domain & Business Income)`);
  console.log(`Audit Blocks: 3 verified cryptographic links`);
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error executing database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
