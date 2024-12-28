import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import { Account } from '@/types/account';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DeleteAccountDialog } from './DeleteAccountDialog';

interface AccountListProps {
  accounts: Account[];
  onDelete: (id: string) => void;
}

export function AccountList({ accounts, onDelete }: AccountListProps) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, account: Account) => {
    e.stopPropagation();
    setAccountToDelete(account);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (accountToDelete) {
      onDelete(accountToDelete.id);
      setShowDeleteDialog(false);
      setAccountToDelete(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Health Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Proxy / API</TableHead>
              <TableHead>Account Age</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow
                key={account.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/accounts/${account.id}`)}
              >
                <TableCell className="font-medium">
                  {account.username}
                  {account.nickname && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({account.nickname})
                    </span>
                  )}
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
                  <Badge variant={account.status === 'Open' ? 'default' : 'destructive'}>
                    {account.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {account.proxy ? (
                      <Badge variant="secondary">Proxy Active</Badge>
                    ) : (
                      <Badge variant="outline">No Proxy</Badge>
                    )}
                    {account.apiConnected ? (
                      <Badge variant="default">API Connected</Badge>
                    ) : (
                      <Badge variant="destructive">Not Connected</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(account.accountAge).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/accounts/${account.id}`);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteClick(e, account)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {accountToDelete && (
        <DeleteAccountDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          username={accountToDelete.username}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}