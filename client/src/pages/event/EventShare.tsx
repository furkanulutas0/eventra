import { getEvent, submitParticipantAvailability } from "@/api/event.api"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Globe, Users2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { useParams } from "react-router-dom"

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
  event_schedule: null | any
  event_participants: any[]
}

// Add interface for participant submission
interface ParticipantSubmission {
  name: string
  email: string
  isAnonymous: boolean
  eventId: string
  timeSlotIds: string[]
  votes: Record<string, boolean>
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
          setEvent(response.data[0])
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
    setSelectedSlots(prev => ({
      ...prev,
      [timeSlotId]: !prev[timeSlotId]
    }))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const selectedTimeSlots = Object.entries(selectedSlots)
        .filter(([_, selected]) => selected)
        .map(([timeSlotId]) => timeSlotId);

      await submitParticipantAvailability({
        name,
        email,
        isAnonymous,
        eventId: event!.id,
        timeSlotIds: selectedTimeSlots,
        votes
      });

      setSubmitted(true)
      toast.success("Your availability has been submitted successfully!");
      
      // Clear form
      setSelectedSlots({})
      setName("")
      setEmail("")
      setPendingSubmission(null)
    } catch (error) {
      toast.error("Failed to submit availability. Please try again.");
      console.error("Error submitting availability:", error);
    } finally {
      setIsSubmitting(false)
    }
  };

  const handleUpdateConfirm = async () => {
    if (!pendingSubmission) return;
    
    setIsSubmitting(true);
    try {
      await submitAvailability(
        pendingSubmission.name,
        pendingSubmission.email,
        pendingSubmission.timeSlotIds
      );
    } catch (error) {
      toast.error("Failed to update availability. Please try again.");
      console.error("Error updating availability:", error);
    } finally {
      setIsSubmitting(false);
      setShowUpdateDialog(false);
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!event) {
    return <div className="flex items-center justify-center min-h-screen">Event not found</div>
  }

  return (
    <>
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-2xl mx-auto p-6 space-y-6 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold tracking-tight">
                {event.name}
              </h1>
              <div className="flex items-center gap-2 text-sm bg-gray-100 px-2.5 py-1.5 rounded-md">
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
              {event.event_dates.map((dateSlot) => (
                <div key={dateSlot.id} className="space-y-3">
                  <h3 className="text-sm font-medium">
                    {format(new Date(dateSlot.date), "EEEE, MMMM d, yyyy")}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {dateSlot.event_time_slots.map((timeSlot) => (
                      <Button
                        key={timeSlot.id}
                        variant={selectedSlots[timeSlot.id] ? "blue" : "outline"}
                        className={cn(
                          "justify-center h-10 px-3 text-sm transition-colors",
                          selectedSlots[timeSlot.id] 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "hover:border-blue-600/50 hover:text-blue-600"
                        )}
                        onClick={() => handleTimeSelect(timeSlot.id)}
                      >
                        {formatTime(timeSlot.start_time)}
                        {selectedSlots[timeSlot.id] && (
                          <span className="ml-1.5 text-white">✓</span>
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
                  <label className="text-sm font-medium">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 pt-4">
              {submitted && (
                <p className="text-sm text-green-600 font-medium">
                  Thank you! Your availability has been submitted successfully.
                </p>
              )}
              <Button 
                variant="blue"
                className={cn(
                  "h-10 px-4 text-sm font-medium min-w-[140px]",
                  isSubmitting && "opacity-80"
                )}
                disabled={!name || !email || Object.values(selectedSlots).filter(Boolean).length === 0 || isSubmitting}
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

      {event?.is_anonymous_allowed && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
          />
          <label
            htmlFor="anonymous"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Submit anonymously
          </label>
        </div>
      )}
    </>
  )
}
