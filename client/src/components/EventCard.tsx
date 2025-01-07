import { updateEventStatus } from "@/api/event.api"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
  CalendarIcon,
  ChevronRight,
  Clock,
  Clock3,
  MapPin,
  User,
  Users2
} from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

interface EventCardProps {
  id: string
  title: string
  type: "1:1" | "group"
  description: string
  location?: string
  dateTimeSlots: Array<{
    date: string
    timeSlots: Array<{
      startTime: string
      endTime: string
    }>
  }>
  status?: "pending" | "active" | "completed" | "cancelled"
  participants: Array<{
    id: string
    is_anonymous: boolean
    participant_name?: string
    participant_email?: string
    user?: {
      name: string
      email: string
    }
  }>
  duration?: number
  onStatusUpdate?: () => void
}

export function EventCard({ 
  id,
  title, 
  type,
  description, 
  location,
  dateTimeSlots = [],
  status = "pending",
  participants = [],
  duration = 30,
  onStatusUpdate
}: EventCardProps) {
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const navigate = useNavigate()

  const handleViewDetails = () => {
    navigate(`/event/details/${id}`)
  }

  const handlePublish = async () => {
    try {
      await updateEventStatus(id, "active")
      toast.success("Event published successfully")
      onStatusUpdate?.()
    } catch (error) {
      toast.error("Failed to publish event")
    } finally {
      setShowPublishDialog(false)
    }
  }

  const statusColors = {
    pending: "text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10",
    active: "text-green-600 bg-green-50 dark:bg-green-500/10",
    completed: "text-blue-600 bg-blue-50 dark:bg-blue-500/10",
    cancelled: "text-red-600 bg-red-50 dark:bg-red-500/10"
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes 
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`
  }

  const getParticipantDisplay = () => {
    const count = participants.length;
    if (type === "1:1") {
      if (count === 0) return "No bookings";
      if (count === 1) return "1 booking";
      return `${count} bookings`;
    }
    return `${count} participant${count !== 1 ? 's' : ''}`;
  };

  return (
    <>
      <Card className="hover:shadow-md dark:hover:shadow-gray-800 transition-shadow group max-w-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                {title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {type === "1:1" ? (
                  <User className="h-4 w-4 text-blue-600" />
                ) : (
                  <Users2 className="h-4 w-4 text-blue-600" />
                )}
                <span className="text-sm text-muted-foreground">
                  {type === "1:1" ? "One-on-one Event" : "Group Event"}
                </span>
              </div>
            </div>
            <div className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-medium",
              statusColors[status]
            )}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center text-muted-foreground">
                  <Clock3 className="mr-2 h-4 w-4" />
                  <span>{formatDuration(duration)}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Users2 className="mr-2 h-4 w-4" />
                  <span>{getParticipantDisplay()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground border-t pt-4">
              {location && (
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 shrink-0" />
                  <span>{location}</span>
                </div>
              )}
              {dateTimeSlots.length > 0 && (
                <div className="space-y-2">
                  {dateTimeSlots.slice(0, 2).map((slot, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        <span>{format(new Date(slot.date), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 shrink-0" />
                        <span>
                          {slot.timeSlots.length === 1 
                            ? `${slot.timeSlots[0].startTime} - ${slot.timeSlots[0].endTime}`
                            : `${slot.timeSlots.length} time slots`
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                  {dateTimeSlots.length > 2 && (
                    <div className="text-sm text-muted-foreground">
                      +{dateTimeSlots.length - 2} more dates
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button 
              variant="ghost" 
              className="w-full justify-between hover:bg-blue-50 dark:hover:bg-blue-950/50 group/button"
              onClick={handleViewDetails}
            >
              View Details
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/button:text-blue-600 transition-colors" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This event is currently in pending status. Would you like to publish it now?
              Publishing will make the event visible to participants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish}>
              Publish Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 