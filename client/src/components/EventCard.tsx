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
      <Card className="hover:shadow-md dark:hover:shadow-gray-800 transition-shadow group w-full max-w-sm mx-auto sm:mx-0">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className="text-lg sm:text-xl group-hover:text-blue-600 transition-colors truncate">
                {title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {type === "1:1" ? (
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                ) : (
                  <Users2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                )}
                <span className="text-xs sm:text-sm text-muted-foreground truncate">
                  {type === "1:1" ? "One-on-one Event" : "Group Event"}
                </span>
              </div>
            </div>
            <div className={cn(
              "px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium flex-shrink-0",
              statusColors[status]
            )}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>
          <CardDescription className="line-clamp-2 text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-2">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center text-muted-foreground">
                  <Clock3 className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">{formatDuration(duration)}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Users2 className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">{getParticipantDisplay()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 text-sm text-muted-foreground border-t pt-3 sm:pt-4">
              {location && (
                <div className="flex items-center">
                  <MapPin className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{location}</span>
                </div>
              )}              {dateTimeSlots.length > 0 && (
                <div className="space-y-2">
                  {dateTimeSlots.slice(0, 2).map((slot, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center">
                        <CalendarIcon className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{format(new Date(slot.date), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">
                          {slot.timeSlots.length === 1 
                            ? `${slot.timeSlots[0].startTime} - ${slot.timeSlots[0].endTime}`
                            : `${slot.timeSlots.length} time slots`
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                  {dateTimeSlots.length > 2 && (
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      +{dateTimeSlots.length - 2} more dates
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button 
              variant="ghost" 
              className="w-full justify-between hover:bg-blue-50 dark:hover:bg-blue-950/50 group/button text-sm"
              onClick={handleViewDetails}
            >
              View Details
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover/button:text-blue-600 transition-colors" />
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