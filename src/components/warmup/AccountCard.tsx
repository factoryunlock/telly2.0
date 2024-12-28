import { Account } from '@/types/account';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface AccountCardProps {
  account: Account;
  source: 'available' | 'auto';
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent, account: Account, source: 'available' | 'auto') => void;
}

export function AccountCard({ 
  account, 
  source, 
  isSelected, 
  onSelect, 
  onDragStart 
}: AccountCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, account, source)}
      className="flex items-center gap-4 rounded-lg border p-4 mb-2 cursor-move hover:bg-accent"
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onSelect}
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
        {source === 'auto' && account.warmupDurationHours > 0 && (
          <div className="text-xs text-muted-foreground">
            Warmup time: {account.warmupDurationHours.toFixed(1)}h
          </div>
        )}
      </div>
      <Badge variant="secondary">{account.status}</Badge>
    </div>
  );
}