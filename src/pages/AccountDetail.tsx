import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Activity,
  MessageSquare,
  Shield,
  AlertTriangle,
  Clock,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountEditForm } from '@/components/accounts/AccountEditForm';
import { ApiSection } from '@/components/accounts/ApiSection';
import { DeleteAccountDialog } from '@/components/accounts/DeleteAccountDialog';
import { useToast } from '@/hooks/use-toast';
import { useAccounts } from '@/hooks/useAccounts';

export function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accounts, deleteAccount } = useAccounts();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const account = accounts.find(a => a.id === id);

  if (!account) {
    return <div>Account not found</div>;
  }

  const handleDelete = async () => {
    try {
      await deleteAccount(account.id);
      navigate('/accounts');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{account.username}</h1>
          {account.nickname && (
            <p className="text-muted-foreground">{account.nickname}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Badge
            variant={account.status === 'Open' ? 'default' : 'destructive'}
            className="text-sm"
          >
            {account.status}
          </Badge>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Progress value={account.healthScore} className="w-[60px]" />
              <span className="text-2xl font-bold">{account.healthScore}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={account.apiConnected ? 'default' : 'destructive'}>
              {account.apiConnected ? 'Connected' : 'Not Connected'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warmup Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {account.warmupDurationHours.toFixed(1)}h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Age</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(account.accountAge, 'MMM d, yyyy')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Account Details</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountEditForm account={account} />
              <div className="mt-6">
                <ApiSection
                  accountId={account.id}
                  apiId={account.apiId}
                  apiHash={account.apiHash}
                  onUpdate={(data) => {
                    toast({
                      title: 'API Details Updated',
                      description: 'The API configuration has been saved.',
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                Activity log coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Message Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                Analytics coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        username={account.username}
        onConfirm={handleDelete}
      />
    </div>
  );
}