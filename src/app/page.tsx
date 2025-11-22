'use client';

import { useState, useMemo } from 'react';
import { format, isSameDay, startOfToday } from 'date-fns';
import { Bell, Calendar as CalendarIcon, Clock, GripVertical } from 'lucide-react';
import type { Event } from '@/lib/types';
import { AddEventDialog } from '@/components/add-event-dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion, Reorder } from 'framer-motion';

const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Team Meeting',
    date: new Date(),
    completed: false,
    reminder: true,
  },
  {
    id: '2',
    title: 'Design Review',
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    completed: false,
    reminder: true,
  },
  {
    id: '3',
    title: 'Doctor Appointment',
    date: new Date(),
    completed: true,
    reminder: false,
  },
];

export default function Home() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfToday());

  const addEvent = (newEventData: Omit<Event, 'id' | 'completed'>) => {
    const newEvent: Event = {
      ...newEventData,
      id: crypto.randomUUID(),
      completed: false,
    };
    setEvents((prev) => [...prev, newEvent].sort((a, b) => a.date.getTime() - b.date.getTime()));
  };

  const toggleEventCompletion = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, completed: !event.completed } : event
      )
    );
  };
  
  const eventsForSelectedDay = useMemo(() => {
    return events.filter((event) => selectedDate && isSameDay(event.date, selectedDate));
  }, [events, selectedDate]);
  
  const setEventsForDay = (newOrder: Event[]) => {
    const otherDaysEvents = events.filter(event => !(selectedDate && isSameDay(event.date, selectedDate)));
    setEvents([...otherDaysEvents, ...newOrder]);
  }

  const daysWithEvents = useMemo(() => events.map((event) => event.date), [events]);

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground font-headline">DayFlow</h1>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto grid h-full grid-cols-1 gap-8 p-4 md:grid-cols-3 md:p-6 lg:gap-12">
          <div className="flex flex-col gap-6 md:col-span-1">
            <Card className="shadow-md">
              <CardContent className="p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="w-full"
                  modifiers={{ hasEvent: daysWithEvents }}
                  modifiersClassNames={{ hasEvent: 'day-with-event' }}
                />
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col gap-6 md:col-span-2">
            <Card className="flex-1 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline">
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Your Day'}
                </CardTitle>
                <AddEventDialog onEventAdd={addEvent} />
              </CardHeader>
              <CardContent>
                {eventsForSelectedDay.length > 0 ? (
                  <Reorder.Group axis="y" values={eventsForSelectedDay} onReorder={setEventsForDay} className="space-y-3">
                     <AnimatePresence>
                      {eventsForSelectedDay.map((event) => (
                        <Reorder.Item
                          key={event.id}
                          value={event}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, transition: { duration: 0.2 } }}
                          transition={{ duration: 0.3 }}
                          className="group"
                        >
                          <div
                            className={cn(
                              'flex items-center gap-4 rounded-lg border p-4 transition-all duration-300',
                              event.completed
                                ? 'border-dashed bg-muted/50'
                                : 'bg-card hover:bg-muted/60'
                            )}
                          >
                             <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab group-hover:opacity-100 md:opacity-0 transition-opacity" />
                            <Checkbox
                              id={`task-${event.id}`}
                              checked={event.completed}
                              onCheckedChange={() => toggleEventCompletion(event.id)}
                              aria-label={`Mark ${event.title} as ${event.completed ? 'incomplete' : 'complete'}`}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`task-${event.id}`}
                                className={cn(
                                  'font-medium transition-all duration-300',
                                  event.completed && 'text-muted-foreground line-through'
                                )}
                              >
                                {event.title}
                              </label>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{format(event.date, 'p')}</span>
                              </div>
                            </div>
                            {event.reminder && !event.completed && (
                              <Bell className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </Reorder.Item>
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No events scheduled</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Add a new event to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
