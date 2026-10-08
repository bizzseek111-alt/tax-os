/**
 * Autonomous Tax OS — Sales Tax Rate Service & Hierarchical Rate Engine
 * 
 * Manages versioned composite sales tax rates across State, County, City,
 * and Special Districts with memory caching and database persistence.
 */

import { prisma } from '../../../db';
import { DefaultAddressProvider, NormalizedAddress } from '../address/addressProvider';

export interface CompositeRateQuote {
  stateCode: string;
  jurisdictionCode: string;
  name: string;
  stateRate: number;
  countyRate: number;
  cityRate: number;
  specialDistrictRate: number;
  compositeRate: number;
  rateVersion: string;
}

export class RateService {
  private addressProvider: DefaultAddressProvider;
  private rateCache: Map<string, { quote: CompositeRateQuote; expiresAt: number }> = new Map();
  private cacheTtlMs: number = 60 * 60 * 1000; // 1 hour

  constructor(addressProvider?: DefaultAddressProvider) {
    this.addressProvider = addressProvider || new DefaultAddressProvider();
  }

  /**
   * Resolves composite sales tax rate for a normalized address
   */
  public async getRateForAddress(address: NormalizedAddress): Promise<CompositeRateQuote> {
    const cacheKey = `${address.state}-${address.postalCode}-${address.city.toUpperCase()}`;
    const cached = this.rateCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.quote;
    }

    const breakdown = await this.addressProvider.resolveJurisdiction(address);

    const quote: CompositeRateQuote = {
      stateCode: breakdown.stateCode,
      jurisdictionCode: breakdown.compositeJurisdictionCode,
      name: `${breakdown.city}, ${breakdown.county} County, ${breakdown.stateCode}`,
      stateRate: breakdown.stateRate,
      countyRate: breakdown.countyRate,
      cityRate: breakdown.cityRate,
      specialDistrictRate: breakdown.specialDistrictRate,
      compositeRate: breakdown.compositeRate,
      rateVersion: '2026.1'
    };

    // Cache quote
    this.rateCache.set(cacheKey, {
      quote,
      expiresAt: Date.now() + this.cacheTtlMs
    });

    return quote;
  }

  /**
   * Seeds default launch state jurisdictions into the database if not present
   */
  public async seedDefaultJurisdictions(): Promise<number> {
    const defaultJurisdictions = [
      {
        stateCode: 'CA',
        jurisdictionCode: 'US-CA-06075',
        jurisdictionType: 'COMPOSITE',
        name: 'San Francisco City & County',
        stateRate: 0.0600,
        countyRate: 0.0125,
        cityRate: 0.0000,
        specialDistrictRate: 0.01375,
        compositeRate: 0.08625
      },
      {
        stateCode: 'CA',
        jurisdictionCode: 'US-CA-06037',
        jurisdictionType: 'COMPOSITE',
        name: 'Los Angeles County (Composite)',
        stateRate: 0.0600,
        countyRate: 0.0125,
        cityRate: 0.0000,
        specialDistrictRate: 0.0225,
        compositeRate: 0.0950
      },
      {
        stateCode: 'NY',
        jurisdictionCode: 'US-NY-36061',
        jurisdictionType: 'COMPOSITE',
        name: 'New York City (5 Boroughs & MCTD)',
        stateRate: 0.0400,
        countyRate: 0.0000,
        cityRate: 0.0450,
        specialDistrictRate: 0.00375,
        compositeRate: 0.08875
      },
      {
        stateCode: 'NJ',
        jurisdictionCode: 'US-NJ-STATE',
        jurisdictionType: 'STATE',
        name: 'New Jersey Statewide Flat',
        stateRate: 0.06625,
        countyRate: 0.0000,
        cityRate: 0.0000,
        specialDistrictRate: 0.0000,
        compositeRate: 0.06625
      },
      {
        stateCode: 'IL',
        jurisdictionCode: 'US-IL-17031',
        jurisdictionType: 'COMPOSITE',
        name: 'Chicago & Cook County Composite',
        stateRate: 0.0625,
        countyRate: 0.0175,
        cityRate: 0.0125,
        specialDistrictRate: 0.0100,
        compositeRate: 0.1025
      },
      {
        stateCode: 'MA',
        jurisdictionCode: 'US-MA-STATE',
        jurisdictionType: 'STATE',
        name: 'Massachusetts Statewide Flat',
        stateRate: 0.0625,
        countyRate: 0.0000,
        cityRate: 0.0000,
        specialDistrictRate: 0.0000,
        compositeRate: 0.0625
      }
    ];

    let count = 0;
    for (const j of defaultJurisdictions) {
      await prisma.salesTaxJurisdiction.upsert({
        where: { jurisdictionCode: j.jurisdictionCode },
        update: {
          stateRate: j.stateRate,
          countyRate: j.countyRate,
          cityRate: j.cityRate,
          specialDistrictRate: j.specialDistrictRate,
          compositeRate: j.compositeRate
        },
        create: {
          stateCode: j.stateCode,
          jurisdictionCode: j.jurisdictionCode,
          jurisdictionType: j.jurisdictionType,
          name: j.name,
          stateRate: j.stateRate,
          countyRate: j.countyRate,
          cityRate: j.cityRate,
          specialDistrictRate: j.specialDistrictRate,
          compositeRate: j.compositeRate
        }
      });
      count++;
    }

    return count;
  }
}
