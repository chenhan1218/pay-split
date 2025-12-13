'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PlusIcon } from 'lucide-react';

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
import { EventService } from '@/services/event-service';
import { ParticipantSchema } from '@/features/events/schemas';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Event name must be at least 2 characters.',
  }),
  currency: z.string().min(1, {
    message: 'Currency is required.',
  }),
  participants: z.array(ParticipantSchema).min(1, {
    message: 'At least one participant is required.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateEventDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      currency: 'TWD', // Default currency
      participants: [{ id: 'temp-user-1', name: 'You' }], // Default participant
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // TODO: Replace with actual authenticated user ID when auth is implemented
      const tempOwnerId = 'temp-owner-id';
      const newEvent = await EventService.createEvent(values, tempOwnerId);
      toast.success('Event created successfully!');
      setOpen(false); // Close dialog on success
      form.reset(); // Reset form fields
      router.push(`/events/${newEvent.id}`); // Navigate to new event page
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event.');
    }
  };

  useEffect(() => {
    if (!open) {
      form.reset(); // Reset form when dialog closes
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-10 w-full">
          <PlusIcon className="mr-2 h-4 w-4" /> Create New Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>Start a new event to split expenses.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Tokyo Trip 2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input placeholder="TWD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Participants Field - simplified for now */}
            <FormField
              control={form.control}
              name="participants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participants (comma separated)</FormLabel>
                  <FormControl>
                    {/* Simplified for now, will implement proper participant management later */}
                    <Input
                      placeholder="You, Alice, Bob"
                      value={field.value.map((p) => p.name).join(', ')}
                      onChange={(e) => {
                        const names = e.target.value
                          .split(',')
                          .map((name) => name.trim())
                          .filter(Boolean);
                        field.onChange(
                          names.map((name, index) => ({ id: `temp-user-${index + 1}`, name }))
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Create Event</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
