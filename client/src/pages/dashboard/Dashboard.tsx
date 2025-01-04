import { PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { getEventsByUser } from "../../api/event.api"
import { EventCard } from "../../components/EventCard"
import { CreateEventModal } from "../../components/modals/CreateEventModal"
import { Sidebar } from "../../components/Sidebar"
import { Button } from "../../components/ui/button"
import { RootState } from "../../redux/store"

interface Event {
  id: string
  creator_id: string
  type: "1:1" | "group"
  name: string
  description: string
  location: string
  status: "pending" | "scheduled" | "completed" | "cancelled"
  duration: number
  participant_count: number
  event_dates: Array<{
    id: string
    date: string
    event_time_slots: Array<{
      start_time: string
      end_time: string
    }>
  }>
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState("events")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const user = useSelector((state: RootState) => state.user.currentUser)

  const fetchEvents = async () => {
    try {
      if (user?.uuid) {
        setLoading(true)
        const response = await getEventsByUser(user.uuid)
        setEvents(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [user?.uuid])

  const renderContent = () => {
    switch (currentPage) {
      case "events":
        return (
          <>
            <header className="border-b">
              <div className="flex h-16 items-center px-4 gap-4">
                <h1 className="text-2xl font-semibold">Events</h1>
                <Button 
                  variant="blue" 
                  className="ml-auto" 
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Event
                </Button>
              </div>
            </header>
            <main className="p-4">
              {loading ? (
                <div>Loading events...</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      title={event.name}
                      type={event.type}
                      description={event.description}
                      location={event.location}
                      dateTimeSlots={event.event_dates?.map(date => ({
                        date: date.date,
                        timeSlots: date.event_time_slots.map(slot => ({
                          startTime: slot.start_time,
                          endTime: slot.end_time
                        }))
                      })) || []}
                      status={event.status}
                      duration={event.duration}
                      participantCount={event.participant_count}
                      onStatusUpdate={fetchEvents}
                    />
                  ))}
                </div>
              )}
            </main>
          </>
        )
      case "attendees":
        return (
          <div className="p-4">
            <h1 className="text-2xl font-semibold">Attendees</h1>
            {/* Attendees content */}
          </div>
        )
      case "settings":
        return (
          <div className="p-4">
            <h1 className="text-2xl font-semibold">Settings</h1>
            {/* Settings content */}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen pt-16 bg-background">
      <Sidebar onPageChange={setCurrentPage} />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
      <CreateEventModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={fetchEvents}
      />
    </div>
  )
}
