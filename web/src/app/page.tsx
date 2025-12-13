import { CreateEventDialog } from '@/components/create-event-dialog';
import { EventService } from '@/services/event-service';
import { Event } from '@/features/events/schemas';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { PlusIcon } from "lucide-react"; // Removed unused import
// import { Button } from "@/components/ui/button"; // Removed unused import

export default async function Home() {
  const events = await EventService.getAllEvents();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Events</h1>
        <CreateEventDialog />
      </div>

      {events.length === 0 ? (
        <div className="text-center text-gray-500">
          No events created yet. Start by creating a new event!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event: Event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card className="transition-shadow duration-200 hover:shadow-lg">
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
