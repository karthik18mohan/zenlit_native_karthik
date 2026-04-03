import { supabase } from '../lib/supabase';
import { PRIVACY_VERSION, TERMS_VERSION } from '../constants/legal';
import { logger } from '../utils/logger';

export type LegalAcceptanceRecord = {
  user_id: string;
  terms_version: string;
  privacy_version: string;
  accepted_at: string;
  created_at?: string;
  updated_at?: string;
};

export const getCurrentUserLegalAcceptance = async (): Promise<{ acceptance: LegalAcceptanceRecord | null; error: Error | null }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { acceptance: null, error: userError ?? new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('legal_acceptances')
      .select('user_id, terms_version, privacy_version, accepted_at, created_at, updated_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return { acceptance: null, error };
    }

    return { acceptance: data as LegalAcceptanceRecord | null, error: null };
  } catch (error) {
    return { acceptance: null, error: error as Error };
  }
};

export const hasCurrentUserAcceptedLatestLegal = async (): Promise<{ accepted: boolean; error: Error | null }> => {
  const { acceptance, error } = await getCurrentUserLegalAcceptance();

  if (error) {
    logger.error('LegalAcceptance', 'Failed to load legal acceptance', error);
    return { accepted: false, error };
  }

  const accepted = Boolean(
    acceptance &&
    acceptance.terms_version === TERMS_VERSION &&
    acceptance.privacy_version === PRIVACY_VERSION &&
    acceptance.accepted_at,
  );

  return { accepted, error: null };
};

export const saveCurrentUserLegalAcceptance = async (): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: userError ?? new Error('Not authenticated') };
    }

    const nowIso = new Date().toISOString();

    const { error } = await supabase
      .from('legal_acceptances')
      .upsert({
        user_id: user.id,
        terms_version: TERMS_VERSION,
        privacy_version: PRIVACY_VERSION,
        accepted_at: nowIso,
        updated_at: nowIso,
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};
