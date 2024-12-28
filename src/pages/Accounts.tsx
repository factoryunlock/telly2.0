import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AccountList } from '@/components/accounts/AccountList';
import { CreateAccountForm } from '@/components/accounts/CreateAccountForm';
import { useAccounts } from '@/hooks/useAccounts';

export function Accounts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { accounts, addAccount, deleteAccount } = useAccounts();

  const filteredAccounts = accounts.filter((account) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = 
      (account.username?.toLowerCase() || '').includes(searchTerm) ||
      (account.phoneNumber?.toLowerCase() || '').includes(searchTerm) ||
      (account.nickname?.toLowerCase() || '').includes(searchTerm);
      
    const matchesStatus =
      statusFilter === 'all' || account.status === statusFilter;
    const matchesHealth =
      healthFilter === 'all' ||
      (healthFilter === 'high' && account.healthScore >= 80) ||
      (healthFilter === 'medium' &&
        account.healthScore >= 50 &&
        account.healthScore < 80) ||
      (healthFilter === 'low' && account.healthScore < 50);

    return matchesSearch && matchesStatus && matchesHealth;
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">
            Manage and monitor your Telegram accounts
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by username, phone, or nickname..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Limited">Limited</SelectItem>
            <SelectItem value="Warming Up">Warming Up</SelectItem>
          </SelectContent>
        </Select>
        <Select value={healthFilter} onValueChange={setHealthFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by health" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Health Scores</SelectItem>
            <SelectItem value="high">High (80-100)</SelectItem>
            <SelectItem value="medium">Medium (50-79)</SelectItem>
            <SelectItem value="low">Low (0-49)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AccountList
        accounts={filteredAccounts}
        onDelete={deleteAccount}
      />

      <CreateAccountForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={addAccount}
      />
    </div>
  );
}