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
import { Transaction } from '@/features/transactions/schemas';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  type: z.enum(['EXPENSE', 'TRANSFER']),
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  amount: z.coerce.number().min(0.01, {
    message: 'Amount must be greater than 0.',
  }),
  date: z.date({
    required_error: 'A transaction date is required.',
  }),
  note: z.string().optional(),
  // Expense specific fields
  payerId: z.string().optional(), // For EXPENSE: who paid
  splitAmong: z.array(z.string()).optional(), // For EXPENSE: IDs of people to split among
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

  // Default payer is the first participant (usually the creator/User)
  const defaultPayerId = eventParticipants[0]?.id;
  const allParticipantIds = eventParticipants.map((p) => p.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'EXPENSE',
      title: '',
      amount: 0,
      date: new Date(),
      note: '',
      payerId: defaultPayerId,
      splitAmong: allParticipantIds, // Default split among everyone
      fromId: '',
      toId: '',
    },
  });

  const transactionType = form.watch('type');

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      form.reset({
        type: 'EXPENSE',
        title: '',
        amount: 0,
        date: new Date(),
        note: '',
        payerId: defaultPayerId,
        splitAmong: allParticipantIds,
        fromId: '',
        toId: '',
      });
    }
  }, [open, form, defaultPayerId, allParticipantIds]);

  const onSubmit = async (values: FormValues) => {
    try {
      const transactionToCreate: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> =
        {
          eventId,
          title: values.title,
          amount: values.amount,
          date: values.date.getTime(),
          note: values.note,
          type: values.type,
        };

      if (values.type === 'EXPENSE') {
        if (!values.payerId) {
          form.setError('payerId', { message: 'Please select who paid.' });
          return;
        }
        if (!values.splitAmong || values.splitAmong.length === 0) {
          form.setError('splitAmong', { message: 'Please select at least one person to split.' });
          return;
        }

        // 1. Paid By
        transactionToCreate.paidBy = { [values.payerId]: values.amount };

        // 2. Split Details (Equal Split)
        const splitCount = values.splitAmong.length;
        const splitAmount = values.amount / splitCount;
        transactionToCreate.splitDetails = values.splitAmong.reduce(
          (acc, id) => {
            acc[id] = splitAmount;
            return acc;
          },
          {} as Record<string, number>
        );
      } else if (values.type === 'TRANSFER') {
        if (!values.fromId) {
          form.setError('fromId', { message: 'Please select payer.' });
          return;
        }
        if (!values.toId) {
          form.setError('toId', { message: 'Please select receiver.' });
          return;
        }
        transactionToCreate.fromId = values.fromId;
        transactionToCreate.toId = values.toId;
      }

      await TransactionService.createTransaction(transactionToCreate);
      toast.success('Transaction added successfully!');
      setOpen(false);
      // We are relying on Next.js Server Components or page refresh to update data.
      // Ideally we should use router.refresh()
      window.location.reload(); // Simple reload for now to fetch new data
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast.error('Failed to add transaction.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>Record an expense or a transfer for this event.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="EXPENSE" />
                        </FormControl>
                        <FormLabel className="font-normal">Expense</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="TRANSFER" />
                        </FormControl>
                        <FormLabel className="font-normal">Transfer</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="What was this for?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
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
                              'w-full pl-3 text-left font-normal',
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
            </div>

            {transactionType === 'EXPENSE' && (
              <div className="space-y-4 rounded-md border p-4 bg-muted/50">
                <FormField
                  control={form.control}
                  name="payerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paid By</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select who paid" />
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
                  control={form.control}
                  name="splitAmong"
                  render={() => (
                    <FormItem>
                      <div className="mb-2">
                        <FormLabel className="text-base">Split Amongst</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {eventParticipants.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="splitAmong"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item.id])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== item.id)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">{item.name}</FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {transactionType === 'TRANSFER' && (
              <div className="grid grid-cols-2 gap-4 rounded-md border p-4 bg-muted/50">
                <FormField
                  control={form.control}
                  name="fromId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sender" />
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
                  control={form.control}
                  name="toId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Receiver" />
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
              </div>
            )}

            <FormField
              control={form.control}
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
              <Button type="submit">Save Transaction</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
