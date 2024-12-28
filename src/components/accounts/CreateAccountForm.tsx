import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AccountFormData } from '@/types/account';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

const formSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
  username: z.string().optional(),
  accountAge: z.string().min(1, 'Account creation date is required'),
  proxy: z.string().optional(),
  apiId: z.string().optional(),
  apiHash: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateAccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AccountFormData) => void;
  initialData?: AccountFormData;
}

export function CreateAccountForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: CreateAccountFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: '',
      username: '',
      accountAge: '', // Remove default value to start with empty field
      proxy: '',
      apiId: '',
      apiHash: '',
    },
  });

  const handleSubmit = async (data: FormValues) => {
    try {
      await onSubmit({
        ...data,
        accountAge: new Date(data.accountAge),
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+1234567890" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="@username" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Creation Date</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="date"
                      max={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </FormControl>
                  <FormDescription className="text-yellow-500">
                    Please verify this date carefully. It cannot be changed after account creation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="proxy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proxy (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter proxy address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API ID (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter API ID" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiHash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Hash (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter API Hash" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}