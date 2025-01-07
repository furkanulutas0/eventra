import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { RootState } from "@/redux/store"
import { format } from "date-fns"
import { Clock, User, Users2 } from "lucide-react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import { createEvent } from "../../api/event.api"
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: () => void
}

type EventType = "1:1" | "group" | null

interface TimeSlot {
  startTime: string
  endTime: string
}

interface DateTimeSlot {
  date: Date
  timeSlots: TimeSlot[]
}

interface EventFormData {
  type: EventType
  name: string
  detail: string
  location: string
  dateTimeSlots: DateTimeSlot[]
}

export function CreateEventModal({ isOpen, onClose, onEventCreated }: CreateEventModalProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const user = useSelector((state: RootState) => state.user.currentUser)
  const [isAnonymousAllowed, setIsAnonymousAllowed] = useState(false)
  const [canMultipleVote, setCanMultipleVote] = useState(false)
  
  // Initial form state
  const initialFormState: EventFormData = {
    type: null,
    name: "",
    detail: "",
    location: "",
    dateTimeSlots: []
  }
  
  const [formData, setFormData] = useState<EventFormData>(initialFormState)

  // Reset form function
  const resetForm = () => {
    setFormData(initialFormState)
    setStep(1)
  }

  // Handle modal close
  const handleClose = () => {
    resetForm()
    onClose()
  }

  const eventTypes = [
    {
      id: "1:1",
      title: "1:1 Event",
      icon: User,
      description: "Schedule one-on-one meetings with individuals"
    },
    {
      id: "group",
      title: "Group Event",
      icon: Users2,
      description: "Schedule meetings with multiple participants"
    }
  ]

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) return

    // If it's a single date being toggled
    if (dates.length > formData.dateTimeSlots.length) {
      // New date being added
      const newDate = dates[dates.length - 1]
      setFormData(prev => ({
        ...prev,
        dateTimeSlots: [
          ...prev.dateTimeSlots,
          {
            date: newDate,
            timeSlots: [{ startTime: "09:00", endTime: "17:00" }]
          }
        ].sort((a, b) => a.date.getTime() - b.date.getTime())
      }))
    } else {
      // Date being removed
      const removedDate = formData.dateTimeSlots.find(
        slot => !dates.some(
          d => d.toDateString() === slot.date.toDateString()
        )
      )?.date

      if (removedDate) {
        setFormData(prev => ({
          ...prev,
          dateTimeSlots: prev.dateTimeSlots.filter(
            slot => slot.date.toDateString() !== removedDate.toDateString()
          )
        }))
      }
    }
  }

  const handleTimeChange = (dateIndex: number, timeIndex: number, field: keyof TimeSlot, value: string) => {
    setFormData(prev => ({
      ...prev,
      dateTimeSlots: prev.dateTimeSlots.map((dateSlot, dIndex) =>
        dIndex === dateIndex
          ? {
              ...dateSlot,
              timeSlots: dateSlot.timeSlots.map((timeSlot, tIndex) =>
                tIndex === timeIndex
                  ? { ...timeSlot, [field]: value }
                  : timeSlot
              )
            }
          : dateSlot
      )
    }))
  }

  const addTimeSlot = (dateIndex: number) => {
    setFormData(prev => ({
      ...prev,
      dateTimeSlots: prev.dateTimeSlots.map((dateSlot, index) =>
        index === dateIndex
          ? {
              ...dateSlot,
              timeSlots: [...dateSlot.timeSlots, { startTime: "09:00", endTime: "17:00" }]
            }
          : dateSlot
      )
    }))
  }

  const removeTimeSlot = (dateIndex: number, timeIndex: number) => {
    setFormData(prev => ({
      ...prev,
      dateTimeSlots: prev.dateTimeSlots.map((dateSlot, dIndex) =>
        dIndex === dateIndex
          ? {
              ...dateSlot,
              timeSlots: dateSlot.timeSlots.filter((_, tIndex) => tIndex !== timeIndex)
            }
          : dateSlot
      ).filter(dateSlot => dateSlot.timeSlots.length > 0)
    }))
  }

  const checkTimeConflicts = (slots: DateTimeSlot[]): boolean => {
    for (const dateSlot of slots) {
      const sortedTimeSlots = [...dateSlot.timeSlots].sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      );

      for (let i = 0; i < sortedTimeSlots.length - 1; i++) {
        const currentSlot = sortedTimeSlots[i];
        const nextSlot = sortedTimeSlots[i + 1];

        if (currentSlot.endTime > nextSlot.startTime) {
          toast.error(
            `Time conflict detected on ${format(dateSlot.date, "MMMM d, yyyy")}: ` +
            `${currentSlot.startTime}-${currentSlot.endTime} overlaps with ` +
            `${nextSlot.startTime}-${nextSlot.endTime}`
          );
          return true;
        }
      }
    }
    return false;
  };

  const hasPastDates = (slots: DateTimeSlot[]): boolean => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    for (const slot of slots) {
      const date = new Date(slot.date);
      date.setHours(0, 0, 0, 0);
      
      if (date < now) {
        toast.error(`Cannot create event for past date: ${format(date, "MMMM d, yyyy")}`);
        return true;
      }
    }
    return false;
  };

  const validate1on1Event = (formData: EventFormData) => {
    if (formData.type === "1:1") {
      // Ensure there aren't too many time slots for 1:1 events
      const totalSlots = formData.dateTimeSlots.reduce(
        (sum, date) => sum + date.timeSlots.length,
        0
      );
      
      if (totalSlots > 10) {
        toast.error("1:1 events can have a maximum of 10 time slots");
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    // Check for past dates and time conflicts before moving to overview step
    if (step === 3) {
      if (hasPastDates(formData.dateTimeSlots) || checkTimeConflicts(formData.dateTimeSlots)) {
        return;
      }
      setStep(4);
      return;
    }

    if (step === 4) {
      if (!validate1on1Event(formData)) {
        return;
      }
      try {
        setIsLoading(true);
        const response = await createEvent({
          ...formData,
          creator_id: user?.uuid,
          isAnonymousAllowed: formData.type === "group" ? isAnonymousAllowed : false,
          can_multiple_vote: formData.type === "group" ? canMultipleVote : false
        });
        onEventCreated?.();
        handleClose();
      } catch (error) {
        console.error("Failed to create event:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (step === 1) {
        setStep(2)
      } else if (step === 2) {
        setStep(3)
      }
    }
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const isNextDisabled = () => {
    switch (step) {
      case 1:
        return !formData.type
      case 2:
        return !formData.name
      case 3:
        return formData.dateTimeSlots.length === 0
      case 4:
        return formData.dateTimeSlots.some(slot => slot.timeSlots.length === 0)
      default:
        return false
    }
  }

  const renderEventTypeSelection = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold">
          1: Choosing Event Type
        </DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4 py-8">
        {eventTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              setFormData(prev => ({ ...prev, type: type.id as EventType }))
            }}
            className={cn(
              "relative flex flex-col items-center justify-center p-6 rounded-lg border-2 border-muted bg-background transition-all hover:border-primary",
              formData.type === type.id && "border-primary ring-2 ring-primary ring-offset-2"
            )}
          >
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <type.icon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{type.title}</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {type.description}
            </p>
          </button>
        ))}
      </div>
      
    </>
  )

  const renderBasicDetails = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold">
          2: Set Basic Event Details
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Event Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter event name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="detail">Event Detail (optional)</Label>
          <Textarea
            id="detail"
            name="detail"
            value={formData.detail}
            onChange={handleInputChange}
            placeholder="Enter event details"
            className="min-h-[100px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location (optional)</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Enter location"
          />
        </div>
        <div className="py-[2px] opacity-50 w-full bg-gray-400 rounded-md"></div>
        {formData.type === 'group' && (
          <div className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymousAllowed}
                onCheckedChange={(checked) => setIsAnonymousAllowed(checked as boolean)}
              />
              <label
                htmlFor="anonymous"
                className="text-sm text-muted-foreground"
              >
                Allow anonymous responses
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="multipleVotes"
                checked={canMultipleVote}
                onCheckedChange={(checked) => setCanMultipleVote(checked as boolean)}
              />
              <label
                htmlFor="multipleVotes"
                className="text-sm text-muted-foreground"
              >
                Allow participants to select multiple time slots
              </label>
            </div>
          </div>
        )}
      </div>
    </>
  )

  const isPastTime = (date: Date, time: string): boolean => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const compareDate = new Date(date);
    compareDate.setHours(hours, minutes);
    return compareDate < now;
  };

  const validateTimeSlots = (dateSlot: DateTimeSlot) => {
    if (formData.type === "1:1") {
      // For 1:1 events, ensure time slots are at least 30 minutes apart
      const sortedSlots = [...dateSlot.timeSlots].sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      );

      for (let i = 0; i < sortedSlots.length - 1; i++) {
        const currentEnd = new Date(`2000-01-01T${sortedSlots[i].endTime}`);
        const nextStart = new Date(`2000-01-01T${sortedSlots[i + 1].startTime}`);
        const diffInMinutes = (nextStart.getTime() - currentEnd.getTime()) / 1000 / 60;

        if (diffInMinutes < 30) {
          toast.error("Time slots must be at least 30 minutes apart for 1:1 events");
          return false;
        }
      }
    }
    return true;
  };

  const renderDateTimeSelection = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold">
          3: Select {formData.type === "1:1" ? "Available Time Slots" : "Dates and Times"}
        </DialogTitle>
        {formData.type === "1:1" && (
          <p className="text-sm text-muted-foreground mt-2">
            For 1:1 meetings, select specific time slots that you're available. 
            Each slot should be at least 30 minutes apart.
          </p>
        )}
      </DialogHeader>
      <div className="grid grid-cols-[400px,1fr] gap-8 py-4">
        <div className="space-y-4">
          <Label>Select Dates</Label>
          <Calendar
            mode="multiple"
            selected={formData.dateTimeSlots.map(slot => slot.date)}
            onSelect={handleDateSelect}
            className="rounded-md border p-3"
            showOutsideDays={false}
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center px-10",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] h-8 flex items-center justify-center",
              row: "flex w-full mt-2",
              cell: cn(
                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
              ),
              day: cn(
                "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                "rounded-md transition-colors hover:bg-blue-100/50 hover:text-blue-600",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              ),
              day_selected: cn(
                "bg-blue-600 text-white",
                "hover:bg-blue-600 hover:text-white",
                "focus:bg-blue-600 focus:text-white"
              ),
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-600",
              day_hidden: "invisible",
            }}
          />
        </div>
        <div className="space-y-6 overflow-y-auto pr-2 max-h-[300px]">
          <Label>
            {formData.type === "1:1" ? "Available Time Slots" : "Set Time Slots"}
          </Label>
          {formData.dateTimeSlots.map((dateSlot, dateIndex) => (
            <div key={dateIndex} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-medium">
                  {format(dateSlot.date, "EEEE, MMMM d")}
                </h4>
                {formData.type === "1:1" && (
                  <span className="text-sm text-muted-foreground">
                    {dateSlot.timeSlots.length} slot{dateSlot.timeSlots.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {dateSlot.timeSlots.map((timeSlot, timeIndex) => (
                  <div key={timeIndex} className="grid grid-cols-[1fr,1fr,auto] items-end gap-6">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          value={timeSlot.startTime}
                          onChange={(e) => {
                            const newTime = e.target.value;
                            if (!isPastTime(dateSlot.date, newTime)) {
                              handleTimeChange(dateIndex, timeIndex, "startTime", newTime);
                              validateTimeSlots(dateSlot);
                            } else {
                              toast.error("Cannot select a past time");
                            }
                          }}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          value={timeSlot.endTime}
                          onChange={(e) => {
                            const newTime = e.target.value;
                            if (!isPastTime(dateSlot.date, newTime)) {
                              handleTimeChange(dateIndex, timeIndex, "endTime", newTime);
                              validateTimeSlots(dateSlot);
                            } else {
                              toast.error("Cannot select a past time");
                            }
                          }}
                          className="w-full"
                        />
                      </div>
                    </div>
                    {(formData.type !== "1:1" || dateSlot.timeSlots.length > 1) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeTimeSlot(dateIndex, timeIndex)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {(!formData.type || formData.type === "group" || 
                  (formData.type === "1:1" && dateSlot.timeSlots.length < 5)) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => addTimeSlot(dateIndex)}
                  >
                    Add Time Slot
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  const renderOverview = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold">
          4: Review Event Details
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-4 max-h-[500px] overflow-y-auto">
        {/* Event Type */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground">Event Type</h3>
          <div className="flex items-center gap-2">
            {formData.type === "1:1" ? (
              <User className="h-5 w-5 text-blue-600" />
            ) : (
              <Users2 className="h-5 w-5 text-blue-600" />
            )}
            <span className="font-medium">
              {formData.type === "1:1" ? "1:1 Event" : "Group Event"}
            </span>
          </div>
        </div>

        {/* Basic Details */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Event Name</h3>
            <p className="mt-1">{formData.name}</p>
          </div>
          {formData.detail && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Event Details</h3>
              <p className="mt-1 whitespace-pre-wrap">{formData.detail}</p>
            </div>
          )}
          {formData.location && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Location</h3>
              <p className="mt-1">{formData.location}</p>
            </div>
          )}
        </div>

        {/* Date and Time Slots */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">
            Selected Dates and Times
          </h3>
          <div className="divide-y rounded-md border">
            {formData.dateTimeSlots.map((dateSlot, index) => (
              <div key={index} className="p-4 space-y-2">
                <div className="font-medium">
                  {format(dateSlot.date, "EEEE, MMMM d, yyyy")}
                </div>
                <div className="space-y-1">
                  {dateSlot.timeSlots.map((timeSlot, timeIndex) => (
                    <div 
                      key={timeIndex}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Clock className="h-4 w-4" />
                      <span>
                        {timeSlot.startTime} - {timeSlot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderEventTypeSelection()
      case 2:
        return renderBasicDetails()
      case 3:
        return renderDateTimeSelection()
      case 4:
        return renderOverview()
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[1000px]">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin">
                <svg
                  className="h-full w-full text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium">Creating event...</span>
            </div>
          </div>
        )}
        {renderStepContent()}
        <div className="flex justify-end gap-4">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            disabled={isNextDisabled() || isLoading}
            onClick={handleNext}
          >
            {step === 4 ? "Create Event" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 