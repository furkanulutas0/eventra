import { deleteParticipantAvailability, getEvent, submitParticipantAvailability } from "@/api/event.api"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Clock, Globe, Users2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

interface TimeSlot {
  id: string
  start_time: string
  end_time: string
  created_at: string
  event_date_id: string
}

interface DateSlot {
  id: string
  date: string
  event_id: string
  created_at: string
  event_time_slots: TimeSlot[]
}

interface Event {
  id: string
  creator_id: string
  type: "1:1" | "group"
  name: string
  detail: string
  location: string
  status: string
  created_at: string
  updated_at: string
  share_url: string
  is_anonymous_allowed: boolean
  event_dates: DateSlot[]
  event_schedule: EventSchedule | null
  event_participants: EventParticipant[]
  event_votes: EventVote[]
  can_multiple_vote: boolean;
}

interface EventParticipant {
  id: string
  event_id: string
  user_id: string
  status: string
  is_anonymous: boolean
  email: string
  user: {
    name: string
    email: string
  }
  participant_availability: ParticipantAvailability[]
}

interface EventVote {
  id: string
  event_id: string
  voter_email: string
  is_anonymous: boolean
  voted_at: string
}

interface ParticipantAvailability {
  id: string
  participant_id: string
  time_slot_id: string
  vote: boolean
  created_at: string
  updated_at: string
}

export default function EventShare() {
  const { eventId } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSlots, setSelectedSlots] = useState<Record<string, boolean>>({})
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [pendingSubmission, setPendingSubmission] = useState<{
    name: string;
    email: string;
    timeSlotIds: string[];
  } | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [votes, setVotes] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (eventId) {
          setLoading(true)
          const response = await getEvent(eventId)
          setEvent(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch event:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  const handleTimeSelect = (timeSlotId: string) => {
    setSelectedSlots(prev => {
      const isSelected = !prev[timeSlotId];
      
      if (!event.can_multiple_vote && isSelected) {
        // If multiple votes are not allowed, clear other selections
        const newSlots = Object.keys(prev).reduce((acc, key) => ({
          ...acc,
          [key]: false
        }), {});
        return {
          ...newSlots,
          [timeSlotId]: true
        };
      }

      return {
        ...prev,
        [timeSlotId]: isSelected
      };
    });
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const selectedTimeSlots = Object.entries(selectedSlots)
        .filter(([_, selected]) => selected)
        .map(([timeSlotId]) => timeSlotId);

      const response = await submitParticipantAvailability({
        name: isAnonymous ? 'Anonymous' : name,
        email,
        isAnonymous,
        eventId: event!.id,
        timeSlotIds: selectedTimeSlots
      });

      if (response.status === "duplicate") {
        // Store the current submission data
        setPendingSubmission({
          name,
          email,
          timeSlotIds: selectedTimeSlots
        });
        // Show the update dialog
        setShowUpdateDialog(true);
        return;
      }

      setSubmitted(true);
      toast.success("Your availability has been submitted successfully");
      
      // Clear form
      setSelectedSlots({});
      setName("");
      setEmail("");
      setPendingSubmission(null);
    } catch (error) {
      toast.error("Failed to submit availability. Please try again.");
      console.error("Error submitting availability:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateConfirm = async () => {
    if (!pendingSubmission) return;
    
    setIsSubmitting(true);
    try {
      // Delete existing participant's availability
      await deleteParticipantAvailability(email, event!.id);
      
      // Submit new availability
      await submitParticipantAvailability({
        name: isAnonymous ? 'Anonymous' : pendingSubmission.name,
        email: pendingSubmission.email,
        isAnonymous,
        eventId: event!.id,
        timeSlotIds: pendingSubmission.timeSlotIds
      });

      toast.success("Availability updated successfully");
      setShowUpdateDialog(false);
      setSubmitted(true);
      
      // Clear form
      setSelectedSlots({});
      setName("");
      setEmail("");
      setPendingSubmission(null);
    } catch (error) {
      toast.error("Failed to update availability. Please try again.");
      console.error("Error updating availability:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCancel = () => {
    setShowUpdateDialog(false);
    setPendingSubmission(null);
    setSelectedSlots({});
    setIsSubmitting(false);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.slice(0, 5).split(':')
    const hour = parseInt(hours)
    return `${hour < 10 ? '0' : ''}${hour}:${minutes}`
  }

  const handleAnonymousChange = (checked: boolean) => {
    setIsAnonymous(checked);
    if (checked) {
      //setName("Anonymous");
      //setEmail(""); // Clear email since it's not needed
    } else {
      setName(""); // Reset name when unchecked
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!event) {
    return <div className="flex items-center justify-center min-h-screen">Event not found</div>
  }

  if (event?.status === "completed") {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <Card className="p-6">
            <div className="space-y-4 text-center">
              <div className="p-3 bg-yellow-500/10 text-yellow-600 rounded-md inline-block mx-auto">
                <Clock className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-semibold">{event.name}</h1>
              <p className="text-muted-foreground">
                This poll has ended and is no longer accepting responses.
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = `/event/stats/${event.id}`}
              >
                View Results
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-2xl mx-auto p-6 space-y-6 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold tracking-tight">
                {event.name}
              </h1>
              <div className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-md">
                {event.type === "group" ? (
                  <Users2 className="h-4 w-4" />
                ) : null}
                <span className="font-medium">
                  {event.type === "group" ? "Group Event" : "One-on-one"}
                </span>
              </div>
            </div>

            {event.detail && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {event.detail}
              </p>
            )}

            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold tracking-tight">
              Select all the times you're available to meet
            </h2>
            
            <div className="space-y-6">
              {event.is_anonymous_allowed && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={handleAnonymousChange}
                  />
                  <label
                    htmlFor="anonymous"
                    className="text-sm font-medium leading-none"
                  >
                    Submit anonymously
                  </label>
                </div>
              )}
              {event.event_dates.map((dateSlot) => (
                <div key={dateSlot.id} className="space-y-3">
                  <h3 className="text-sm font-medium">
                    {format(new Date(dateSlot.date), "EEEE, MMMM d, yyyy")}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {dateSlot.event_time_slots.map((timeSlot) => (
                      <Button
                        key={timeSlot.id}
                        variant={selectedSlots[timeSlot.id] ? "default" : "outline"}
                        className={cn(
                          "justify-center h-10 px-3 text-sm transition-colors",
                          selectedSlots[timeSlot.id] && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => handleTimeSelect(timeSlot.id)}
                      >
                        {`${timeSlot.start_time.slice(0, 5)} - ${timeSlot.end_time.slice(0, 5)}`}
                        {selectedSlots[timeSlot.id] && (
                          <span className="ml-1.5">✓</span>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isAnonymous}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isAnonymous}
                    required
                  />
                </div>
              </div>
              <Button 
                variant="blue"
                className={cn(
                  "h-10 px-4 text-sm font-medium min-w-[140px]",
                  isSubmitting && "opacity-80"
                )}
                disabled={
                  (!isAnonymous && (!name || !email)) || // Only require name and email if not anonymous
                  Object.values(selectedSlots).filter(Boolean).length === 0 || 
                  isSubmitting
                }
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Confirm Selection"
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <AlertDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Previous Selection?</AlertDialogTitle>
            <AlertDialogDescription>
              You have made a selection before. Would you like to cancel your previous selection and update it with your new choices?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleUpdateCancel}>No, keep previous selection</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateConfirm}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                "Yes, update selection"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
