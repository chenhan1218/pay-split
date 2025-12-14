import { WalletIcon } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateEventDialog } from '@/features/events/components/create-event-dialog';
import type { Event } from '@/features/events/schemas';
import { EventService } from '@/services/event-service';

export default async function Home() {
  const events = await EventService.getAllEvents();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Events</h1>
        <CreateEventDialog />
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <WalletIcon className="h-6 w-6 text-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No events created yet</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Get started by creating a new event to track expenses with friends.
          </p>
          <CreateEventDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event: Event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card className="transition-all hover:scale-[1.02] hover:shadow-md">
                <CardHeader>
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription>
                    {event.participants.length} participants &bull; {event.currency}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Created: {new Date(event.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
