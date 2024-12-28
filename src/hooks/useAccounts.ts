import { useState, useEffect } from 'react';
import { Account, AccountFormData } from '@/types/account';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { calculateAccountHealth, isAccountLimited } from '@/lib/utils/healthCalculator';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAccounts();
    } else {
      setAccounts([]);
      setLoading(false);
    }
  }, [user]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedAccounts: Account[] = data.map(account => {
        const accountAge = new Date(account.account_age);
        const warmupDurationHours = account.warmup_duration_hours;
        
        return {
          id: account.id,
          username: account.username,
          phoneNumber: account.phone_number,
          nickname: account.nickname || undefined,
          healthScore: calculateAccountHealth({ accountAge, warmupDurationHours }),
          proxy: account.proxy || undefined,
          accountAge,
          status: account.status === 'In Use' ? 'In Use' : 
                 isAccountLimited({ accountAge, warmupDurationHours }) ? 'Limited' : 
                 account.status,
          apiId: account.api_id || undefined,
          apiHash: account.api_hash || undefined,
          warmupStartTime: account.warmup_start_time ? new Date(account.warmup_start_time) : undefined,
          warmupDurationHours,
          apiConnected: account.api_connected
        };
      });

      setAccounts(mappedAccounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load accounts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (data: AccountFormData) => {
    try {
      const { data: newAccount, error } = await supabase
        .rpc('create_account_with_user', {
          p_phone_number: data.phoneNumber,
          p_username: data.username || null,
          p_account_age: data.accountAge.toISOString(),
          p_proxy: data.proxy || null,
          p_api_id: data.apiId || null,
          p_api_hash: data.apiHash || null
        });

      if (error) throw error;

      await loadAccounts();
      
      toast({
        title: 'Success',
        description: 'Account created successfully'
      });
      
      return newAccount;
    } catch (error) {
      console.error('Failed to create account:', error);
      toast({
        title: 'Error',
        description: 'Failed to create account',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateAccount = async (id: string, data: Partial<AccountFormData>) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({
          username: data.username,
          proxy: data.proxy,
          api_id: data.apiId,
          api_hash: data.apiHash
        })
        .eq('id', id);

      if (error) throw error;

      await loadAccounts();
      
      toast({
        title: 'Success',
        description: 'Account updated successfully'
      });
    } catch (error) {
      console.error('Failed to update account:', error);
      toast({
        title: 'Error',
        description: 'Failed to update account',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAccounts(prev => prev.filter(account => account.id !== id));
      toast({
        title: 'Success',
        description: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete account',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const warmupAccount = async (id: string, status: Account['status']) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({
          status,
          warmup_start_time: status === 'Warming Up' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      await loadAccounts();
      
      toast({
        title: 'Success',
        description: status === 'Warming Up' ? 
          'Account added to warmup' : 
          'Account removed from warmup'
      });
    } catch (error) {
      console.error('Failed to update account warmup status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update account warmup status',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const removeFromWarmup = async (id: string) => {
    return warmupAccount(id, 'Open');
  };

  return {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    warmupAccount,
    removeFromWarmup
  };
}