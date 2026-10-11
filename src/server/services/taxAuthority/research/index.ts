/**
 * Autonomous Tax OS — Phase 11A Live Tax Authority Runtime & Research Module
 * 
 * Barrel exports for connectors, decision engine, authority hierarchy, specialists,
 * proposition graph, legal escalation, cache, and master research engine.
 */

export * from './types';
export * from './connectors/baseConnector';
export * from './connectors/federalConnector';
export * from './connectors/californiaConnector';
export * from './connectors/newYorkConnector';
export * from './connectors/newJerseyConnector';
export * from './connectors/illinoisConnector';
export * from './connectors/massachusettsConnector';
export * from './connectors/connectorRegistry';

export * from './decision/sourceFreshnessService';
export * from './decision/liveResearchDecisionEngine';

export * from './hierarchy/authorityHierarchyEngine';

export * from './binding/factApplicabilityMap';
export * from './binding/caseRuleResolver';

export * from './specialists/federalSpecialist';
export * from './specialists/californiaSpecialist';
export * from './specialists/newYorkSpecialist';
export * from './specialists/newJerseySpecialist';
export * from './specialists/illinoisSpecialist';
export * from './specialists/massachusettsSpecialist';
export * from './specialists/salesTaxSpecialist';
export * from './specialists/payrollSpecialist';
export * from './specialists/multiStateCoordinator';

export * from './propositions/citationValidator';
export * from './propositions/propositionGraph';

export * from './escalation/legalEscalationService';
export * from './cache/taxResearchCache';

export * from './engine/caseTaxResearchEngine';
export * from './engine/proveThisRuleService';
