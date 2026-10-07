import React from 'react';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { HomePage } from './HomePage';
import { IndividualsPage } from './IndividualsPage';
import { SelfEmployedPage } from './SelfEmployedPage';
import { BusinessPage } from './BusinessPage';
import { BusinessIncomeTaxPage } from './BusinessIncomeTaxPage';
import { SalesTaxPage } from './SalesTaxPage';
import { PayrollTaxPage } from './PayrollTaxPage';
import { TaxProfessionalsPage } from './TaxProfessionalsPage';
import { ExpertReviewPage } from './ExpertReviewPage';
import { HowItWorksPage } from './HowItWorksPage';
import { TaxTwinPage } from './TaxTwinPage';
import { StatePages } from './StatePages';
import { PricingPage } from './PricingPage';
import { SecurityPage } from './SecurityPage';
import { ResourcesPage } from './ResourcesPage';
import { AboutPage } from './AboutPage';
import { ContactPage } from './ContactPage';
import { SignInPage } from './SignInPage';

interface PublicWebsiteProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onStartFiling: () => void;
  onSignIn: (targetRole?: string) => void;
}

export function PublicWebsite({
  currentPath,
  onNavigate,
  onStartFiling,
  onSignIn
}: PublicWebsiteProps) {
  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#122A26] flex flex-col font-sans selection:bg-[#C2E8A2] selection:text-[#08211C]">
      
      {/* 1. Global Public Header with Mega Menu */}
      <PublicHeader 
        currentPath={currentPath}
        onNavigate={onNavigate}
        onStartFiling={onStartFiling}
        onSignIn={() => onNavigate('/signin')}
      />

      {/* 2. Main Public Route Dispatcher */}
      <main className="flex-1">
        {currentPath === '/' && (
          <HomePage onStartFiling={onStartFiling} onNavigate={onNavigate} />
        )}

        {currentPath === '/individuals' && (
          <IndividualsPage onStartFiling={onStartFiling} onNavigate={onNavigate} />
        )}

        {currentPath === '/self-employed' && (
          <SelfEmployedPage onStartFiling={onStartFiling} onNavigate={onNavigate} />
        )}

        {currentPath === '/business' && (
          <BusinessPage onStartFiling={onStartFiling} onNavigate={onNavigate} />
        )}

        {currentPath === '/business/income-tax' && (
          <BusinessIncomeTaxPage onStartFiling={onStartFiling} onNavigate={onNavigate} />
        )}

        {currentPath === '/sales-tax' && (
          <SalesTaxPage onStartFiling={onStartFiling} onNavigate={onNavigate} />
        )}

        {currentPath === '/payroll-tax' && (
          <PayrollTaxPage onStartFiling={onStartFiling} onNavigate={onNavigate} />
        )}

        {currentPath === '/tax-professionals' && (
          <TaxProfessionalsPage onStartFiling={onStartFiling} onNavigate={onNavigate} />
        )}

        {currentPath === '/expert-review' && (
          <ExpertReviewPage onStartFiling={onStartFiling} onNavigate={onNavigate} />
        )}

        {currentPath === '/how-it-works' && (
          <HowItWorksPage onStartFiling={onStartFiling} onNavigate={onNavigate} />
        )}

        {currentPath === '/tax-twin' && (
          <TaxTwinPage onStartFiling={onStartFiling} onNavigate={onNavigate} />
        )}

        {(currentPath === '/states' || currentPath.startsWith('/states/')) && (
          <StatePages 
            currentPath={currentPath} 
            onStartFiling={onStartFiling} 
            onNavigate={onNavigate} 
          />
        )}

        {currentPath === '/pricing' && (
          <PricingPage onStartFiling={onStartFiling} onNavigate={onNavigate} />
        )}

        {currentPath === '/security' && (
          <SecurityPage onStartFiling={onStartFiling} onNavigate={onNavigate} />
        )}

        {currentPath === '/resources' && (
          <ResourcesPage onStartFiling={onStartFiling} onNavigate={onNavigate} />
        )}

        {currentPath === '/about' && (
          <AboutPage onStartFiling={onStartFiling} onNavigate={onNavigate} />
        )}

        {currentPath === '/contact' && (
          <ContactPage onNavigate={onNavigate} />
        )}

        {currentPath === '/signin' && (
          <SignInPage onSignIn={onSignIn} onNavigate={onNavigate} />
        )}
      </main>

      {/* 3. Global Public Footer */}
      <PublicFooter 
        onNavigate={onNavigate}
        onStartFiling={onStartFiling}
      />

    </div>
  );
}
