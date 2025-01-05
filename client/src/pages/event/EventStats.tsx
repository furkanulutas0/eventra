import { getEvent } from "@/api/event.api";
import { VoteBarChart } from "@/components/charts/VoteBarChart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ArrowLeft, Calendar, ChevronDown, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  vote_count?: number;
  participants?: Array<{
    name: string;
    is_anonymous: boolean;
  }>;
}

interface DateSlot {
  id: string;
  date: string;
  event_time_slots: TimeSlot[];
}

interface Event {
  id: string;
  name: string;
  type: "1:1" | "group";
  detail: string;
  status: string;
  location: string;
  event_dates: DateSlot[];
  event_participants: Array<{
    id: string;
    participant_name?: string;
    is_anonymous: boolean;
    participant_availability: Array<{
      time_slot_id: string;
      vote: boolean;
    }>;
  }>;
}

interface MostVotedSlot {
  date: Date;
  startTime: string;
  endTime: string;
  voteCount: number;
}

function generateGoogleCalendarUrl(event: Event, slot: MostVotedSlot) {
  const startDate = format(slot.date, "yyyyMMdd");
  const startTime = slot.startTime.replace(':', '');
  const endTime = slot.endTime.replace(':', '');
  
  const details = event.detail || "No additional details";
  const location = event.location || "No location specified";

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${startDate}T${startTime}00/${startDate}T${endTime}00&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
}

function generateAppleCalendarUrl(event: Event, slot: MostVotedSlot) {
  const startDate = format(slot.date, "yyyy-MM-dd");
  const details = event.detail || "No additional details";
  
  return `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate}T${slot.startTime.replace(':', '')}00
DTEND:${startDate}T${slot.endTime.replace(':', '')}00
SUMMARY:${event.name}
DESCRIPTION:${details}
LOCATION:${event.location || ""}
END:VEVENT
END:VCALENDAR`;
}

function generateOutlookCalendarUrl(event: Event, slot: MostVotedSlot) {
  const startDate = format(slot.date, "yyyyMMdd");
  const startTime = slot.startTime.replace(':', '');
  const endTime = slot.endTime.replace(':', '');
  
  const details = event.detail || "No additional details";
  const location = event.location || "No location specified";

  return `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.name)}&startdt=${startDate}T${startTime}&enddt=${startDate}T${endTime}&body=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
}

export default function EventStats() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [mostVotedSlot, setMostVotedSlot] = useState<MostVotedSlot | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (eventId) {
          setLoading(true);
          const response = await getEvent(eventId);
          const eventData = response.data;

          if (eventData && eventData.event_dates) {
            eventData.event_dates = eventData.event_dates.map((date: DateSlot) => ({
              ...date,
              event_time_slots: date.event_time_slots.map((slot: TimeSlot) => ({
                ...slot,
                vote_count:
                  eventData.event_participants?.reduce((count, participant) => {
                    return (
                      count +
                      participant.participant_availability.filter(
                        (avail) => avail.time_slot_id === slot.id && avail.vote
                      ).length
                    );
                  }, 0) || 0,
                participants:
                  eventData.event_participants
                    ?.filter((participant) =>
                      participant.participant_availability.some(
                        (avail) => avail.time_slot_id === slot.id && avail.vote
                      )
                    )
                    .map((participant) => ({
                      name: participant.is_anonymous ? "Anonymous" : participant.participant_name || "Unknown",
                      is_anonymous: participant.is_anonymous,
                    })) || [],
              })),
            }));

            // Find the most voted time slot
            let maxVotes = 0;
            let mostVoted: MostVotedSlot | null = null;

            eventData.event_dates.forEach((dateSlot: DateSlot) => {
              dateSlot.event_time_slots.forEach((timeSlot) => {
                const voteCount = timeSlot.vote_count || 0;
                if (voteCount > maxVotes) {
                  maxVotes = voteCount;
                  mostVoted = {
                    date: new Date(dateSlot.date),
                    startTime: timeSlot.start_time,
                    endTime: timeSlot.end_time,
                    voteCount: voteCount
                  };
                }
              });
            });

            setMostVotedSlot(mostVoted);
          }

          setEvent(eventData);
        }
      } catch (error) {
        console.error("Failed to fetch event:", error);
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const processChartData = (eventData: Event) => {
    const chartData: Array<{ date: string; votes: number; timeSlot: string }> = [];

    eventData.event_dates.forEach((dateSlot) => {
      const formattedDate = format(new Date(dateSlot.date), "MMM d");

      dateSlot.event_time_slots.forEach((timeSlot) => {
        const voteCount = timeSlot.vote_count || 0;
        const startTime = timeSlot.start_time.slice(0, 5);
        const endTime = timeSlot.end_time.slice(0, 5);
        const timeRange = `${startTime} - ${endTime}`;

        chartData.push({
          date: formattedDate,
          votes: voteCount,
          timeSlot: `${formattedDate}, ${timeRange}`,
        });
      });
    });

    return chartData;
  };

  const handleAddToCalendar = (type: 'google' | 'apple' | 'outlook') => {
    if (!event || !mostVotedSlot) return;

    const url = type === 'google' 
      ? generateGoogleCalendarUrl(event, mostVotedSlot)
      : type === 'apple'
      ? generateAppleCalendarUrl(event, mostVotedSlot)
      : generateOutlookCalendarUrl(event, mostVotedSlot);

    window.open(url, '_blank');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!event) {
    return <div className="flex items-center justify-center min-h-screen">Event not found</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to={`/event/details/${eventId}`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Event
            </Button>
          </Link>
          
          {event.status === "completed" && mostVotedSlot && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Calendar
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem 
                  onClick={() => handleAddToCalendar('google')}
                  className="flex items-center"
                >
                  <img src="/google.svg" alt="Google" className="mr-2 h-4 w-4" />
                  Google Calendar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAddToCalendar('outlook')}
                  className="flex items-center"
                >
                  <img src="/microsoft.svg" alt="Outlook" className="mr-2 h-4 w-4" />
                  Outlook Calendar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAddToCalendar('apple')}
                  className="flex items-center"
                >
                  <img src="/apple.svg" alt="Apple" className="mr-2 h-4 w-4" />
                  Apple Calendar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {event.status !== "completed" && (
            <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-600 px-3 py-1.5 rounded-md">
              <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-sm font-medium">Voting in progress</span>
            </div>
          )}
        </div>

        {event.status === "completed" && mostVotedSlot && (
          <div className="bg-blue-500/10 text-blue-600 px-4 py-3 rounded-md">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Most voted time: {format(mostVotedSlot.date, "EEEE, MMMM d, yyyy")} at{" "}
                {mostVotedSlot.startTime.slice(0, 5)} - {mostVotedSlot.endTime.slice(0, 5)}
              </span>
            </div>
          </div>
        )}

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{event.name}</h1>
              {event.detail && (
                <p className="mt-2 text-sm text-muted-foreground">{event.detail}</p>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Vote Distribution</h2>
              <div className="pt-4">
                <VoteBarChart data={processChartData(event)} />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Detailed Results</h2>
              <div className="space-y-8">
                {event.event_dates.map((dateSlot) => (
                  <div key={dateSlot.id} className="space-y-3">
                    <h3 className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(dateSlot.date), "EEEE, MMMM d, yyyy")}
                    </h3>
                    <div className="grid gap-3">
                      {dateSlot.event_time_slots.map((timeSlot) => (
                        <div
                          key={timeSlot.id}
                          className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {timeSlot.start_time.slice(0, 5)} - {timeSlot.end_time.slice(0, 5)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground">
                              {timeSlot.vote_count} {timeSlot.vote_count === 1 ? "vote" : "votes"}
                            </div>
                            {timeSlot.participants && timeSlot.participants.length > 0 && (
                              <div className="flex -space-x-2">
                                {timeSlot.participants.map((participant, index) => (
                                  <div
                                    key={index}
                                    className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs border-2 border-background"
                                    title={participant.name}>
                                    {participant.is_anonymous ? "A" : participant.name[0]}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
