import { deleteEvent, getEvent, updateEventStatus } from "@/api/event.api";
import { VoteBarChart } from "@/components/charts/VoteBarChart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, Globe, Link, Users2 } from "lucide-react";
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
    setIsCopying(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
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
    } finally {
      setIsCopying(false);
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
      if (event.type === "1:1") {
        // For 1:1 events, collect all booked slots
        const bookedSlots = event?.event_dates.flatMap(date => 
          date.event_time_slots
            .filter(slot => slot.participants && slot.participants.length > 0)
            .map(slot => ({
              date: date.date,
              timeSlot: slot,
              participant: slot.participants![0]
            }))
        );

        if (bookedSlots?.length === 0) {
          toast.error("No time slots have been booked yet");
          return;
        }

        // Update event status to completed
        await updateEventStatus(event.id, "completed");
        
        toast.success("Poll has been ended successfully");
        navigate(`/event/stats/${event.id}`);
      } else {
        // For group events, use the existing most voted logic
        await updateEventStatus(event.id, "completed");
        toast.success("Poll has been ended successfully");
        navigate(`/event/stats/${event.id}`);
      }
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

  const processStatsData = (eventData: Event) => {
    if (eventData.type === "1:1") {
      // For 1:1 events, return booked slots data
      const bookedSlots = eventData.event_dates.flatMap(date => 
        date.event_time_slots
          .filter(slot => slot.participants && slot.participants.length > 0)
          .map(slot => ({
            date: format(new Date(date.date), "MMM d"),
            timeSlot: `${format(new Date(date.date), "MMM d")}, ${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`,
            participant: slot.participants![0].name || "Anonymous",
            isAnonymous: slot.participants![0].is_anonymous
          }))
      );

      return bookedSlots;
    } else {
      // For group events, use the existing vote distribution logic
      return processChartData(eventData);
    }
  };

  const renderTimeSlots = (dateSlot: DateSlot) => {
    if (event.type === "1:1") {
      return (
        <div className="grid gap-3">
          {dateSlot.event_time_slots.map((timeSlot) => {
            const participant = timeSlot.participants?.[0];
            return (
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
                  {participant ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs border-2 border-background"
                        title={participant.is_anonymous ? "Anonymous" : participant.name}>
                        {participant.is_anonymous ? "A" : participant.name?.[0] || "?"}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {participant.is_anonymous ? "Anonymous" : participant.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Existing group event rendering
    return (
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
                      title={participant.is_anonymous ? "Anonymous" : participant.name}>
                      {participant.is_anonymous ? "A" : participant.name?.[0] || "?"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStats = () => {
    if (event.type === "1:1") {
      const bookedSlots = processStatsData(event);
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Booked Time Slots</h2>
          <div className="divide-y">
            {bookedSlots.map((slot, index) => (
              <div key={index} className="py-3 flex justify-between items-center">
                <div>
                  <span className="font-medium">{slot.timeSlot}</span>
                  <div className="text-sm text-muted-foreground">
                    Booked by: {slot.isAnonymous ? "Anonymous" : slot.participant}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Vote Distribution</h2>
          <div className="pt-4">
            <VoteBarChart data={processChartData(event)} />
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!event) {
    return <div className="flex items-center justify-center min-h-screen">Event not found</div>;
  }
  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to Events</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        <Card className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1 flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight break-words">{event.name}</h1>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  {event.type === "group" ? <Users2 className="h-3 w-3 sm:h-4 sm:w-4" /> : null}
                  <span>{event.type === "group" ? "Group Event" : "One-on-one"}</span>
                  <span className="px-1 sm:px-2">•</span>
                  <span className="capitalize">{event.status}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 flex-1 sm:flex-none text-xs sm:text-sm"                        onClick={copyShareLink}
                        disabled={isCopying}>
                        <Link className={cn("h-3 w-3 sm:h-4 sm:w-4", isCopying && "animate-pulse")} />
                        <span className="hidden sm:inline">{isCopying ? "Copying..." : "Share"}</span>
                        <span className="sm:hidden">{isCopying ? "..." : "Share"}</span>
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
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Show Stats</span>
                  <span className="sm:hidden">Stats</span>
                </Button>

                {event.status !== "completed" && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleEndPoll}
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">End Poll</span>
                    <span className="sm:hidden">End</span>
                  </Button>
                )}
                
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete}
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  Delete
                </Button>
              </div>
            </div>

            {event.detail && (
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground break-words">{event.detail}</p>
            )}

            {event.location && (
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Globe className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="break-words">{event.location}</span>
              </div>
            )}
          </div>
        </Card>        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6">
            {renderStats()}
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-base sm:text-lg font-semibold">
                {event.type === "1:1" ? "Time Slot Availability" : "Availability"}
              </h2>
              <div className="space-y-6 sm:space-y-8 max-h-[400px] overflow-y-auto">
                {event.event_dates.map((dateSlot) => (
                  <div key={dateSlot.id} className="space-y-3">
                    <h3 className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="break-words">{format(new Date(dateSlot.date), "EEEE, MMMM d, yyyy")}</span>
                    </h3>
                    {renderTimeSlots(dateSlot)}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 sm:p-6">
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-semibold">
              Participants ({event.event_participants.length})
            </h2>
            <div className="divide-y max-h-[300px] overflow-y-auto">
              {event.event_participants.map((participant) => (
                <div key={participant.id} className="py-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">
                      {participant.is_anonymous ? "A" : (participant.participant_name?.[0] || participant.user?.name?.[0] || "?")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-xs sm:text-sm truncate">
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
