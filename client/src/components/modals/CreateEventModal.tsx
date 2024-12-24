import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock, User, Users2 } from "lucide-react"
import { useState } from "react"
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Textarea } from "../ui/textarea"

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
}

type EventType = "1:1" | "group" | null

interface TimeSlot {
  startTime: string
  endTime: string
}

interface EventFormData {
  type: EventType
  name: string
  detail: string
  location: string
  startDate: Date | undefined
  endDate: Date | undefined
  timeSlots: TimeSlot[]
}

export function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<EventFormData>({
    type: null,
    name: "",
    detail: "",
    location: "",
    startDate: undefined,
    endDate: undefined,
    timeSlots: [{ startTime: "09:00", endTime: "17:00" }]
  })

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

  const handleTimeChange = (index: number, field: keyof TimeSlot, value: string) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }))
  }

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { startTime: "09:00", endTime: "17:00" }]
    }))
  }

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }))
  }

  const handleNext = () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      if (formData.type === "group") {
        setStep(3)
      } else {
        // Handle 1:1 event flow
        console.log("1:1 event flow")
      }
    } else if (step === 3) {
      setStep(4)
    } else {
      console.log("Form data:", formData)
      // Handle form submission
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
        return !formData.startDate || !formData.endDate
      case 4:
        return formData.timeSlots.length === 0
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
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
      case 2:
        return (
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
            </div>
          </>
        )
      case 3:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">
                3: Select Event Dates
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? (
                          format(formData.startDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) =>
                          setFormData(prev => ({ ...prev, startDate: date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? (
                          format(formData.endDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) =>
                          setFormData(prev => ({ ...prev, endDate: date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </>
        )
      case 4:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">
                4: Set Available Time Slots
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {formData.timeSlots.map((slot, index) => (
                <div key={index} className="flex items-end gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleTimeChange(index, "startTime", e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleTimeChange(index, "endTime", e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                  {formData.timeSlots.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeTimeSlot(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addTimeSlot}
              >
                Add Another Time Slot
              </Button>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        {renderStepContent()}
        <div className="flex justify-end gap-4">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isNextDisabled()}
            onClick={handleNext}
          >
            {step === 4 ? "Create Event" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 