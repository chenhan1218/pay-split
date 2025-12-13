import { EventService } from '@/services/event-service';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { TransactionService } from '@/services/transaction-service';
// import { Transaction } from "@/features/transactions/schemas"; // Removed unused import
import { format } from 'date-fns';

interface EventDetailPageProps {
  params: {
    id: string;
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const event = await EventService.getEventById(params.id);
  const transactions = await TransactionService.getTransactionsByEventId(params.id);

  if (!event) {
    notFound();
  }

  const getParticipantName = (id: string) => {
    return event.participants.find((p) => p.id === id)?.name || 'Unknown';
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{event.currency}</Badge>
          <AddTransactionDialog eventId={event.id} eventParticipants={event.participants} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Overview of the event.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">Participants:</h3>
                <div className="flex flex-wrap gap-2">
                  {event.participants.map((p) => (
                    <Badge key={p.id} variant="outline">
                      {p.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="mb-2 font-semibold">Transactions:</h3>
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground">No transactions yet. Add one above!</p>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((txn) => (
                      <Card key={txn.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{txn.title}</h4>
                          <span className="text-lg font-semibold">
                            {event.currency} {txn.amount.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {format(new Date(txn.date), 'PPP')} &bull; {txn.type}
                        </p>
                        {txn.type === 'EXPENSE' && (
                          <div className="mt-2 text-sm">
                            <p>
                              Paid by:{' '}
                              {Object.keys(txn.paidBy || {})
                                .map((id) => getParticipantName(id))
                                .join(', ')}
                            </p>
                            <p>
                              Split among:{' '}
                              {Object.keys(txn.splitDetails || {})
                                .map((id) => getParticipantName(id))
                                .join(', ')}
                            </p>
                          </div>
                        )}
                        {txn.type === 'TRANSFER' && (
                          <p className="mt-2 text-sm">
                            From: {getParticipantName(txn.fromId)} to {getParticipantName(txn.toId)}
                          </p>
                        )}
                        {txn.note && (
                          <p className="text-muted-foreground mt-2 text-sm italic">
                            Note: {txn.note}
                          </p>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Financial summary of the event.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for Summary */}
              <p className="text-muted-foreground">Summary will be calculated here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
