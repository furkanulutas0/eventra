import { deleteEvent, getEvent, updateEventStatus } from "@/api/event.api";
import { VoteBarChart } from "@/components/charts/VoteBarChart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar, Clock, Globe, Link, Users2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  location: string;
  status: string;
  share_url: string;
  is_anonymous_allowed: boolean;
  event_dates: DateSlot[];
  event_participants: Array<{
    id: string;
    user?: {
      name: string;
      email: string;
    };
    participant_name?: string;
    participant_email?: string;
    is_anonymous: boolean;
    participant_availability: Array<{
      time_slot_id: string;
      vote: boolean;
    }>;
  }>;
}

interface EventSchedule {
  id: string;
  event_id: string;
  selected_date: string;
  selected_time_slot_id: string;
  status: string;
  created_at: string;
}

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (eventId) {
          setLoading(true);
          const response = await getEvent(eventId);
          const eventData = response.data;

          // Ensure eventData and its properties are not null
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
                      name: participant.is_anonymous ? "Anonymous" : (participant.participant_name || participant.user?.name || "Unknown"),
                      is_anonymous: participant.is_anonymous,
                    })) || [],
              })),
            }));
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

  const getShareUrl = (eventId: string) => {
    const baseUrl = `${window.location.origin}`;
    return `${baseUrl}/event/share/${eventId}`;
  };

  const copyShareLink = async () => {
    if (!event?.id) return;

    try {
      const shareUrl = getShareUrl(event.id);
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch (error) {
      // Fallback implementation
      const textarea = document.createElement("textarea");
      textarea.value = getShareUrl(event.id);
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        toast.success("Share link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link. Please try again.");
      }
      document.body.removeChild(textarea);
    }
  };

  const handleDelete = async () => {
    if (!eventId) return;

    try {
      await deleteEvent(eventId);
      toast.success("Event marked as deleted successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const handleEndPoll = async () => {
    try {
      await updateEventStatus(event.id, "completed");
      toast.success("Poll has been ended successfully");
      navigate(`/event/stats/${event.id}`);
    } catch (error) {
      console.error("Failed to end poll:", error);
      toast.error("Failed to end poll");
    }
  };

  const handleShowStats = () => {
    navigate(`/event/stats/${event.id}`);
  };

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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!event) {
    return <div className="flex items-center justify-center min-h-screen">Event not found</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">{event.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {event.type === "group" ? <Users2 className="h-4 w-4" /> : null}
                  <span>{event.type === "group" ? "Group Event" : "One-on-one"}</span>
                  <span className="px-2">•</span>
                  <span className="capitalize">{event.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={copyShareLink}
                        disabled={isCopying}>
                        <Link className={cn("h-4 w-4", isCopying && "animate-pulse")} />
                        {isCopying ? "Copying..." : "Share"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to copy share link</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShowStats}
                >
                  Show Stats
                </Button>

                {event.status !== "completed" && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleEndPoll}
                  >
                    End Poll
                  </Button>
                )}
                
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </div>

            {event.detail && (
              <p className="text-sm leading-relaxed text-muted-foreground">{event.detail}</p>
            )}

            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Vote Distribution</h2>
            <div className="pt-4">
              <VoteBarChart data={processChartData(event)} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Availability</h2>
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
                              {timeSlot.participants.map((participant, index) => {
                                const displayName = participant.is_anonymous
                                  ? "Anonymous"
                                  : participant.name;
                                const initial = participant.is_anonymous
                                  ? "A"
                                  : participant.name?.[0] || "?";

                                return (
                                  <div
                                    key={index}
                                    className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs border-2 border-background"
                                    title={displayName}>
                                    {initial}
                                  </div>
                                );
                              })}
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
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              Participants ({event.event_participants.length})
            </h2>
            <div className="divide-y">
              {event.event_participants.map((participant) => (
                <div key={participant.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {participant.is_anonymous ? "A" : (participant.participant_name?.[0] || participant.user?.name?.[0] || "?")}
                    </div>
                    <div>
                      <div className="font-medium">
                        {participant.is_anonymous
                          ? "Anonymous"
                          : (participant.participant_name || participant.user?.name || "Unknown")}
                      </div>
                      {!participant.is_anonymous && (participant.participant_email || participant.user?.email) && (
                        <div className="text-sm text-muted-foreground">
                          {participant.participant_email || participant.user?.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
