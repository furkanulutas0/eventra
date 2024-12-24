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
  event_name: string
  description: string
  location: string
  start_date: string
  end_date: string
  duration_minute: number
  status: string | null
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState("events")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const user = useSelector((state: RootState) => state.user.currentUser)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (user?.uuid) {
          const response = await getEventsByUser(user.uuid)
          setEvents(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch events:", error)
      } finally {
        setLoading(false)
      }
    }

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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      title={event.event_name}
                      date={new Date(event.start_date).toLocaleDateString()}
                      description={event.description}
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
      />
    </div>
  )
}
