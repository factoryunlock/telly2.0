import { supabase } from '@/lib/supabase';
import { Account, AccountFormData } from '@/types/account';

export async function getAccounts(): Promise<Account[]> {
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return accounts.map(account => ({
    id: account.id,
    username: account.username,
    nickname: account.nickname || undefined,
    healthScore: account.health_score,
    proxy: account.proxy || undefined,
    phoneNumber: account.phone_number || undefined,
    accountAge: new Date(account.account_age),
    status: account.status,
    apiId: account.api_id || undefined,
    apiHash: account.api_hash || undefined,
    warmupStartTime: account.warmup_start_time ? new Date(account.warmup_start_time) : undefined,
    warmupDurationHours: account.warmup_duration_hours,
    apiConnected: account.api_connected
  }));
}

export async function createAccount(data: AccountFormData): Promise<Account> {
  // Start a Supabase transaction
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Create the account
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .insert({
      username: data.username,
      nickname: data.nickname,
      proxy: data.proxy,
      api_id: data.apiId,
      api_hash: data.apiHash,
      account_age: new Date().toISOString(),
      status: 'Open',
      health_score: 100,
      api_connected: false,
      warmup_duration_hours: 0
    })
    .select()
    .single();

  if (accountError) throw accountError;

  // Create the user-account association
  const { error: linkError } = await supabase
    .from('user_accounts')
    .insert({
      user_id: user.id,
      account_id: account.id
    });

  if (linkError) {
    // If linking fails, delete the account and throw error
    await supabase.from('accounts').delete().eq('id', account.id);
    throw linkError;
  }

  return {
    id: account.id,
    username: account.username,
    nickname: account.nickname || undefined,
    healthScore: account.health_score,
    proxy: account.proxy || undefined,
    phoneNumber: account.phone_number || undefined,
    accountAge: new Date(account.account_age),
    status: account.status,
    apiId: account.api_id || undefined,
    apiHash: account.api_hash || undefined,
    warmupStartTime: account.warmup_start_time ? new Date(account.warmup_start_time) : undefined,
    warmupDurationHours: account.warmup_duration_hours,
    apiConnected: account.api_connected
  };
}

// ... rest of the file remains the same ...