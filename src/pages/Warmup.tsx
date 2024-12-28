import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Account } from '@/types/account';
import { useAccounts } from '@/hooks/useAccounts';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { WarmupStats } from '@/components/warmup/WarmupStats';
import { AccountSelectionDialog } from '@/components/warmup/AccountSelectionDialog';
import { StopWarmupDialog } from '@/components/warmup/StopWarmupDialog';
import { DragDropConfirmDialog } from '@/components/warmup/DragDropConfirmDialog';

export function Warmup() {
  const { accounts, warmupAccount, removeFromWarmup } = useAccounts();
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [autoWarmupAccounts, setAutoWarmupAccounts] = useState<Account[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedWarmup, setSelectedWarmup] = useState<string[]>([]);
  const [showSelectionDialog, setShowSelectionDialog] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [draggedAccount, setDraggedAccount] = useState<Account | null>(null);
  const [dragAction, setDragAction] = useState<'start' | 'stop'>('start');
  const [showDragConfirm, setShowDragConfirm] = useState(false);
  const { toast } = useToast();

  // Update available and warmup accounts when accounts change
  useEffect(() => {
    setAvailableAccounts(accounts.filter(a => a.status === 'Open'));
    setAutoWarmupAccounts(accounts.filter(a => a.status === 'Warming Up'));
  }, [accounts]);

  const handleDragStart = (e: React.DragEvent, account: Account, source: 'available' | 'auto') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ account, source }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, target: 'available' | 'auto') => {
    e.preventDefault();
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (!data) return;
      
      const { account, source } = JSON.parse(data) as { account: Account; source: 'available' | 'auto' };
      if (!account.id || source === target) return;

      setDraggedAccount(account);
      setDragAction(target === 'auto' ? 'start' : 'stop');
      setShowDragConfirm(true);
    } catch (error) {
      console.error('Error handling drop:', error);
      toast({
        title: "Error",
        description: "Failed to move account.",
        variant: "destructive"
      });
    }
  };

  const handleDragConfirm = async () => {
    if (!draggedAccount) return;

    try {
      if (dragAction === 'start') {
        await warmupAccount(draggedAccount.id, 'Warming Up');
      } else {
        await removeFromWarmup(draggedAccount.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process account.",
        variant: "destructive"
      });
    }

    setShowDragConfirm(false);
    setDraggedAccount(null);
  };

  const handleStartWarmup = async () => {
    for (const id of selectedAvailable) {
      try {
        await warmupAccount(id, 'Warming Up');
      } catch (error) {
        console.error('Error starting warmup:', error);
      }
    }
    setSelectedAvailable([]);
    setShowSelectionDialog(false);
    toast({
      title: "Warmup Started",
      description: `Started warmup for ${selectedAvailable.length} accounts.`
    });
  };

  const handleStopWarmup = async () => {
    for (const id of selectedWarmup) {
      try {
        await removeFromWarmup(id);
      } catch (error) {
        console.error('Error stopping warmup:', error);
      }
    }
    setSelectedWarmup([]);
    setShowStopDialog(false);
    toast({
      title: "Warmup Stopped",
      description: `Stopped warmup for ${selectedWarmup.length} accounts.`
    });
  };

  const AccountCard = ({ account, source }: { account: Account; source: 'available' | 'auto' }) => {
    const isSelected = source === 'available' 
      ? selectedAvailable.includes(account.id)
      : selectedWarmup.includes(account.id);

    const handleSelect = () => {
      if (source === 'available') {
        setSelectedAvailable(prev => 
          isSelected ? prev.filter(id => id !== account.id) : [...prev, account.id]
        );
      } else {
        setSelectedWarmup(prev => 
          isSelected ? prev.filter(id => id !== account.id) : [...prev, account.id]
        );
      }
    };

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, account, source)}
        className="flex items-center gap-4 rounded-lg border p-4 mb-2 cursor-move hover:bg-accent"
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => handleSelect()}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex-1 space-y-1">
          <div className="font-medium">{account.username}</div>
          <div className="flex items-center gap-2">
            <Progress value={account.healthScore} className="w-[60px]" />
            <span className="text-sm text-muted-foreground">
              {account.healthScore}%
            </span>
          </div>
        </div>
        <Badge variant="secondary">{account.status}</Badge>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Warmup</h1>
        <p className="text-muted-foreground">
          Manage your account warmup process
        </p>
      </div>

      <WarmupStats
        accounts={accounts}
        autoWarmupAccounts={autoWarmupAccounts}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Available Accounts */}
        <Card
          className="p-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'available')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Available Accounts ({availableAccounts.length})</h2>
            {selectedAvailable.length > 0 && (
              <Button onClick={() => setShowSelectionDialog(true)}>
                Start Warmup ({selectedAvailable.length})
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {availableAccounts.map((account) => (
              <AccountCard key={account.id} account={account} source="available" />
            ))}
            {availableAccounts.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No accounts available for warmup
              </p>
            )}
          </div>
        </Card>

        {/* Auto Warmup */}
        <Card
          className="p-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'auto')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Auto Warmup ({autoWarmupAccounts.length})</h2>
            {selectedWarmup.length > 0 && (
              <Button 
                variant="destructive"
                onClick={() => setShowStopDialog(true)}
              >
                Stop Warmup ({selectedWarmup.length})
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {autoWarmupAccounts.map((account) => (
              <AccountCard key={account.id} account={account} source="auto" />
            ))}
            {autoWarmupAccounts.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No accounts in warmup
              </p>
            )}
          </div>
        </Card>
      </div>

      <AccountSelectionDialog
        open={showSelectionDialog}
        onOpenChange={setShowSelectionDialog}
        accountCount={selectedAvailable.length}
        onConfirm={handleStartWarmup}
      />

      <StopWarmupDialog
        open={showStopDialog}
        onOpenChange={setShowStopDialog}
        accountCount={selectedWarmup.length}
        onConfirm={handleStopWarmup}
      />

      <DragDropConfirmDialog
        open={showDragConfirm}
        onOpenChange={setShowDragConfirm}
        account={draggedAccount}
        action={dragAction}
        onConfirm={handleDragConfirm}
      />
    </div>
  );
}