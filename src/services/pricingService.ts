import { supabase } from '../lib/supabaseClient';

export class PricingService {
  static async getAdditionalKioskDiscountPercent(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'additional_kiosk_discount_percent')
        .single();

      if (error) return 10; // default 10%

      const value = data?.value;
      if (typeof value === 'number') return value;
      if (value && typeof value.percent === 'number') return value.percent;
      return 10;
    } catch {
      return 10;
    }
  }

  static calculateCampaignCost(params: {
    baseRatePerSlot: number;
    totalSlots: number;
    numKiosks: number;
    discountPercent: number;
  }): number {
    const { baseRatePerSlot, totalSlots, numKiosks, discountPercent } = params;
    if (numKiosks <= 0) return 0;
    const firstKioskCost = totalSlots * baseRatePerSlot;
    const additionalKiosks = Math.max(0, numKiosks - 1);
    const discountedRate = baseRatePerSlot * (1 - (discountPercent || 0) / 100);
    const additionalCost = totalSlots * discountedRate * additionalKiosks;
    const total = firstKioskCost + additionalCost;
    return Math.round(total * 100) / 100;
  }
}
