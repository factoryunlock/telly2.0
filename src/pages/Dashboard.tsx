import {
  Activity,
  MessageSquare,
  Shield,
  Users,
  Loader2,
} from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AccountsChart } from '@/components/dashboard/AccountsChart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAccounts } from '@/hooks/useAccounts';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { calculateMessagesPerDay } from '@/lib/utils/healthCalculator';

export function Dashboard() {
  const navigate = useNavigate();
  const { accounts, loading } = useAccounts();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    totalAccounts: accounts.length,
    messageLimit: accounts.reduce((total, account) => 
      total + calculateMessagesPerDay(account), 0),
    averageHealth: Math.round(
      accounts.reduce((acc, curr) => acc + curr.healthScore, 0) / (accounts.length || 1)
    ),
    activeProxies: accounts.filter((a) => a.proxy).length,
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Telegram accounts and activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Accounts"
          value={stats.totalAccounts}
          icon={Users}
          description="Active Telegram accounts"
        />
        <StatsCard
          title="Daily Message Limit"
          value={stats.messageLimit}
          icon={MessageSquare}
          description="Maximum daily capacity"
        />
        <StatsCard
          title="Average Health"
          value={`${stats.averageHealth}%`}
          icon={Activity}
          description="Across all accounts"
        />
        <StatsCard
          title="Active Proxies"
          value={stats.activeProxies}
          icon={Shield}
          description={`Of ${stats.totalAccounts} total accounts`}
        />
      </div>

      <AccountsChart />

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recent Accounts</h2>
          <p className="text-muted-foreground">
            Your most recently added Telegram accounts.
          </p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Health Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Proxy</TableHead>
                <TableHead>Account Age</TableHead>
                <TableHead>Messages/Day</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.slice(0, 5).map((account) => (
                <TableRow
                  key={account.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/accounts/${account.id}`)}
                >
                  <TableCell className="font-medium">
                    {account.username || account.phoneNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={account.healthScore} className="w-[60px]" />
                      <span className="text-sm text-muted-foreground">
                        {account.healthScore}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={account.status === 'Open' ? 'default' : 'destructive'}
                    >
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {account.proxy ? (
                      <Badge variant="secondary">Active</Badge>
                    ) : (
                      <Badge variant="outline">No Proxy</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(account.accountAge, 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {calculateMessagesPerDay(account)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}