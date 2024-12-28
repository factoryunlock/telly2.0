import { Users, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAccounts } from '@/hooks/useAccounts';
import { calculateMessagesPerDay } from '@/lib/utils/healthCalculator';

export function MessagesStats() {
  const { accounts } = useAccounts();
  const availableAccounts = accounts.filter(a => a.status === 'Open');

  const stats = {
    totalAccounts: availableAccounts.length,
    dailyMessages: availableAccounts.reduce((total, account) => 
      total + calculateMessagesPerDay(account), 0),
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Available Accounts</p>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-2xl font-bold">{stats.totalAccounts}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Daily Messages</p>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <p className="text-2xl font-bold">{stats.dailyMessages}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0">
            <div className="w-full">
              <p className="text-sm font-medium text-muted-foreground mb-2">Active Campaign</p>
              <div className="w-full rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground text-center">No active campaign</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}