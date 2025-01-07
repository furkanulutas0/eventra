import { Calendar, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getEventsByUser } from "../../api/event.api";
import { EventCard } from "../../components/EventCard";
import { CreateEventModal } from "../../components/modals/CreateEventModal";
import { Sidebar } from "../../components/Sidebar";
import { Button } from "../../components/ui/button";
import { RootState } from "../../redux/store";

interface Event {
  id: string;
  creator_id: string;
  type: "1:1" | "group";
  name: string;
  description: string;
  location: string;
  status: "pending" | "active" | "completed" | "cancelled";
  event_dates: Array<{
    id: string;
    date: string;
    event_time_slots: Array<{
      start_time: string;
      end_time: string;
    }>;
  }>;
  event_participants: Array<{
    id: string;
    is_anonymous: boolean;
    participant_name?: string;
    participant_email?: string;
    user?: {
      name: string;
      email: string;
    };
  }>;
}

const EmptyEventsState = ({ onCreateEvent }: { onCreateEvent: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="flex flex-col items-center space-y-4 max-w-[400px] text-center">
        <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-900/20">
          <Calendar className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-2xl font-semibold tracking-tight">No events yet</h3>
        <p className="text-muted-foreground">
          You haven't created any events yet. Start by creating your first event!
        </p>
        <Button
          variant="blue"
          size="lg"
          onClick={onCreateEvent}
          className="mt-4"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Create Your First Event
        </Button>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("events");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const user = useSelector((state: RootState) => state.user.currentUser);

  const fetchEvents = async () => {
    try {
      if (user?.uuid) {
        setLoading(true);
        const response = await getEventsByUser(user.uuid);
          setEvents(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user?.uuid]);

  const renderContent = () => {
    switch (currentPage) {
      case "events":
        return (
          <>
            <header className="border-b">
              <div className="flex h-16 items-center px-4 gap-4">
                <h1 className="text-2xl font-semibold">Events</h1>
              </div>
            </header>
            <main className="p-4">
              {loading ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-muted-foreground">Loading events...</span>
                  </div>
                </div>
              ) : events.length === 0 ? (
                <EmptyEventsState onCreateEvent={() => setIsCreateModalOpen(true)} />
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
                      dateTimeSlots={
                        event.event_dates?.map((date) => ({
                          date: date.date,
                          timeSlots: date.event_time_slots.map((slot) => ({
                            startTime: slot.start_time,
                            endTime: slot.end_time,
                          })),
                        })) || []
                      }
                      status={event.status as "pending" | "active" | "completed" | "cancelled"}
                      participants={event.event_participants || []}
                      onStatusUpdate={fetchEvents}
                    />
                  ))}
                </div>
              )}
            </main>
          </>
        );
      case "attendees":
        return (
          <div className="p-4 min-h-screen">
            <h1 className="text-2xl font-semibold">Attendees</h1>
            <div className="flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <p className="mt-4 text-lg text-gray-600">This feature is coming soon!</p>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="p-4 min-h-screen">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <div className="flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <p className="mt-4 text-lg text-gray-600">This feature is coming soon!</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen pt-16 bg-background">
      <Sidebar 
        onPageChange={setCurrentPage} 
        onCreateEvent={() => setIsCreateModalOpen(true)}
      />
      <div className="flex-1 overflow-auto">{renderContent()}</div>
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={fetchEvents}
      />
    </div>
  );
}
