import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccounts } from '@/hooks/useAccounts';
import { MessagesStats } from '@/components/messages/MessagesStats';
import { calculateMessagesPerDay } from '@/lib/utils/healthCalculator';

export function Messages() {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const { accounts } = useAccounts();
  const { toast } = useToast();

  const sortedAccounts = [...accounts]
    .filter(a => a.status === 'Open')
    .sort((a, b) => calculateMessagesPerDay(b) - calculateMessagesPerDay(a));

  const handleSend = async () => {
    // ... rest of the code remains the same
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="new" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="new">New Broadcast</TabsTrigger>
            <TabsTrigger value="history">Broadcast History</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="new">
          <div className="space-y-6">
            <MessagesStats />

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-4">
                <h2 className="mb-4 text-lg font-semibold">Available Accounts ({sortedAccounts.length})</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {sortedAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{account.username}</span>
                          <Badge variant="default">
                            {calculateMessagesPerDay(account)} msg/day
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={account.healthScore} className="w-[60px]" />
                          <span className="text-sm text-muted-foreground">
                            {account.healthScore}%
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setSelectedAccounts((prev) =>
                            prev.includes(account.id)
                              ? prev.filter((id) => id !== account.id)
                              : [...prev, account.id]
                          )
                        }
                      >
                        {selectedAccounts.includes(account.id) ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h2 className="mb-4 text-lg font-semibold">Broadcast Message</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Selected Accounts ({selectedAccounts.length})
                    </label>
                    <div className="rounded-lg border bg-muted p-2 min-h-[50px]">
                      {selectedAccounts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No accounts selected
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedAccounts.map((id) => {
                            const account = sortedAccounts.find((a) => a.id === id);
                            return (
                              account && (
                                <Badge key={id} variant="secondary">
                                  {account.username}
                                </Badge>
                              )
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Message Content
                    </label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="min-h-[200px]"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleSend}
                    disabled={!selectedAccounts.length || !message}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Broadcast ({selectedAccounts.length} accounts)
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-6">
            <MessagesStats />
            <Card>
              <div className="p-4 text-center text-muted-foreground">
                Broadcast history coming soon...
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}