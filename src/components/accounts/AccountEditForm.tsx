import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Account } from '@/types/account';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAccounts } from '@/hooks/useAccounts';
import { format } from 'date-fns';

const formSchema = z.object({
  username: z.string().optional(),
  proxy: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AccountEditFormProps {
  account: Account;
}

export function AccountEditForm({ account }: AccountEditFormProps) {
  const { toast } = useToast();
  const { updateAccount } = useAccounts();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: account.username || '',
      proxy: account.proxy || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateAccount(account.id, data);
      toast({
        title: 'Account Updated',
        description: 'The account has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update account',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              value={account.phoneNumber || ''}
              disabled
              className="bg-background"
            />
            <FormDescription>
              Phone number cannot be changed
            </FormDescription>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Account Age</label>
            <Input
              value={format(account.accountAge, 'MMM d, yyyy')}
              disabled
              className="bg-background"
            />
            <FormDescription>
              Account age cannot be changed
            </FormDescription>
          </div>
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="@username" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="proxy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proxy</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="Enter proxy address" />
              </FormControl>
              <FormDescription>
                The proxy server used for this account
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}