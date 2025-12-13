'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PlusIcon, CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { TransactionService } from '@/services/transaction-service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Event } from '@/features/events/schemas';
import { Transaction } from '@/features/transactions/schemas'; // Import Transaction types
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const formSchema = z.object({
  type: z.enum(['EXPENSE', 'TRANSFER']),
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  amount: z.number().min(0.01, {
    message: 'Amount must be greater than 0.',
  }),
  date: z.date({
    message: 'A transaction date is required.',
  }),
  note: z.string().optional(),
  // Expense specific fields
  paidBy: z.record(z.string(), z.number()).optional(),
  splitDetails: z.record(z.string(), z.number()).optional(),
  // Transfer specific fields
  fromId: z.string().optional(),
  toId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTransactionDialogProps {
  eventId: string;
  eventParticipants: Event['participants'];
}

export function AddTransactionDialog({ eventId, eventParticipants }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'EXPENSE',
      title: '',
      amount: 0,
      date: new Date(),
      note: '',
      paidBy: {},
      splitDetails: {},
      fromId: '',
      toId: '',
    },
  });

  const transactionType = form.watch('type');

  useEffect(() => {
    if (!open) {
      form.reset(); // Reset form when dialog closes
    }
  }, [open, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const tempOwnerId = 'temp-owner-id'; // Using temp ID as per instruction/current state

      if (values.type === 'EXPENSE') {
        const defaultPayerId = eventParticipants[0]?.id;
        const paidBy = { [defaultPayerId]: values.amount };
        const splitAmount = values.amount / eventParticipants.length;
        const splitDetails = eventParticipants.reduce(
          (acc, p) => {
            acc[p.id] = splitAmount;
            return acc;
          },
          {} as Record<string, number>
        );

        await TransactionService.createExpenseTransaction(
          eventId,
          {
            title: values.title,
            amount: values.amount,
            date: values.date.getTime(),
            note: values.note,
            paidBy,
            splitDetails,
            type: 'EXPENSE',
          },
          tempOwnerId
        );
      } else if (values.type === 'TRANSFER') {
        if (!values.fromId || !values.toId) {
           toast.error('From and To fields are required for transfer');
           return;
        }
        await TransactionService.createTransferTransaction(
          eventId,
          {
            title: values.title,
            amount: values.amount,
            date: values.date.getTime(),
            note: values.note,
            fromId: values.fromId,
            toId: values.toId,
            type: 'TRANSFER',
          },
          tempOwnerId
        );
      }

      toast.success('Transaction added successfully!');
      setOpen(false); // Close dialog on success
      form.reset(); // Reset form fields
      // TODO: Revalidate event page data
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast.error('Failed to add transaction.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>Record an expense or a transfer for this event.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control as any}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-y-0 space-x-3">
                        <FormControl>
                          <RadioGroupItem value="EXPENSE" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Expense (e.g., Dinner, Transport)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-y-0 space-x-3">
                        <FormControl>
                          <RadioGroupItem value="TRANSFER" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Transfer (e.g., Alice paid Bob back)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="What was this for?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>{' '}
                  {/* Currency should be passed as prop if needed, or derived from event context. Removed invalid access for now */}
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-[240px] pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {transactionType === 'EXPENSE' && (
              <>
                {/* Simplified Paid By and Split Details for now */}
                {/* Will add more complex logic/UI later */}
                <p className="text-muted-foreground text-sm">
                  (For now, assume first participant pays and it&apos;s split equally)
                </p>
              </>
            )}

            {transactionType === 'TRANSFER' && (
              <>
                <FormField
                  control={form.control as any}
                  name="fromId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventParticipants.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="toId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select receiver" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventParticipants.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control as any}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Add Transaction</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
