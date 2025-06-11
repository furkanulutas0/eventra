
import { CreateEventModal } from "@/components/modals/CreateEventModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Plus, User, Users2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EventCreate() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const eventTypes = [
    {
      id: "1:1",
      title: "1:1 Event",
      icon: User,
      description: "Schedule one-on-one meetings with individuals. Perfect for interviews, consultations, or personal meetings.",
      features: ["Individual scheduling", "Direct booking", "Personal calendar integration"]
    },
    {
      id: "group",
      title: "Group Event",
      icon: Users2,
      description: "Schedule meetings with multiple participants. Great for team meetings, workshops, or group sessions.",
      features: ["Multiple participants", "Voting system", "Flexible time slots"]
    }
  ];

  const handleEventCreated = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        <div className="text-center space-y-2 sm:space-y-4 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Create a New Event
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the type of event you want to create and start scheduling effortlessly
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {eventTypes.map((type) => (
            <Card key={type.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 rounded-full bg-primary/10 p-4 sm:p-6 group-hover:bg-primary/20 transition-colors">
                  <type.icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl">{type.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base leading-relaxed">
                  {type.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm sm:text-base">Features:</h4>
                  <ul className="space-y-1">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-xs sm:text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  className="w-full group-hover:bg-primary/90 transition-colors text-sm sm:text-base"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Create {type.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Action Button */}
        <div className="text-center pt-6 sm:pt-8">
          <Button 
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
          >
            <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Quick Create Event
          </Button>
        </div>

        {/* Recent Events Preview */}
        <Card className="p-4 sm:p-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Recent Events</CardTitle>
            <CardDescription className="text-sm">
              Your recently created events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No recent events. Create your first event to get started!</p>
            </div>
          </CardContent>
        </Card>

        <CreateEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onEventCreated={handleEventCreated}
        />
      </div>
    </div>
  );
}
