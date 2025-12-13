import { EventService } from '@/services/event-service';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AddTransactionDialog } from '@/features/transactions/components/add-transaction-dialog';
import { TransactionService } from '@/services/transaction-service';
import { format } from 'date-fns';
import { ReceiptTextIcon, ArrowRightLeftIcon } from 'lucide-react';

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventDetailPage(props: EventDetailPageProps) {
  const params = await props.params;
  const event = await EventService.getEventById(params.id);
  const transactions = await TransactionService.getTransactionsByEventId(params.id);

  if (!event) {
    notFound();
    return null;
  }

  const getParticipantName = (id: string) => {
    return event.participants.find((p) => p.id === id)?.name || 'Unknown';
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <div className="mt-2 flex items-center space-x-2">
            <Badge variant="secondary">{event.currency}</Badge>
            <span className="text-sm text-muted-foreground">
              {event.participants.length} Participants
            </span>
          </div>
        </div>
        <AddTransactionDialog eventId={event.id} eventParticipants={event.participants} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Details & Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Participants</h3>
                <div className="flex flex-wrap gap-2">
                  {event.participants.map((p) => (
                    <Badge key={p.id} variant="outline" className="text-base font-normal">
                      {p.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">Recent Activity</h3>
                </div>

                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <ReceiptTextIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      No transactions yet. Add one to get started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((txn) => (
                      <Card key={txn.id} className="overflow-hidden">
                        <div className="p-4 sm:flex sm:items-start sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`rounded-full p-2 ${txn.type === 'EXPENSE' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                              {txn.type === 'EXPENSE' ? (
                                <ReceiptTextIcon className="h-4 w-4" />
                              ) : (
                                <ArrowRightLeftIcon className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                <h4 className="font-semibold">{txn.title}</h4>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(txn.date), 'MMM d, yyyy')}
                                </span>
                              </div>

                              {txn.type === 'EXPENSE' && (
                                <div className="mt-1 text-sm text-muted-foreground">
                                  <span className="font-medium text-foreground">
                                    {Object.keys(txn.paidBy || {})
                                      .map((id) => getParticipantName(id))
                                      .join(', ')}
                                  </span>{' '}
                                  paid{' '}
                                  <span className="font-medium text-foreground">
                                    {event.currency} {txn.amount.toFixed(2)}
                                  </span>
                                  {' • '}
                                  Split by{' '}
                                  {Object.keys(txn.splitDetails || {}).length === event.participants.length
                                    ? 'everyone'
                                    : `${Object.keys(txn.splitDetails || {}).length} people`}
                                </div>
                              )}

                              {txn.type === 'TRANSFER' && (
                                <div className="mt-1 text-sm text-muted-foreground">
                                  <span className="font-medium text-foreground">{getParticipantName(txn.fromId)}</span>
                                  {' sent '}
                                  <span className="font-medium text-foreground">
                                    {event.currency} {txn.amount.toFixed(2)}
                                  </span>
                                  {' to '}
                                  <span className="font-medium text-foreground">{getParticipantName(txn.toId)}</span>
                                </div>
                              )}

                              {txn.note && (
                                <p className="mt-2 text-xs italic text-muted-foreground bg-muted/50 p-2 rounded">
                                  {txn.note}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 text-right sm:mt-0">
                            <span className={`text-lg font-bold ${txn.type === 'EXPENSE' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
                              {txn.type === 'EXPENSE' ? '-' : ''}{event.currency} {txn.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Balances & Debts</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for Summary */}
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <p>Balances calculation coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
