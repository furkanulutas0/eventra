import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Calendar, Clock, Globe, Search, Users2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Home() {
  const [eventId, setEventId] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Users2,
      title: "Group Scheduling",
      description: "Easily coordinate meetings with multiple participants"
    },
    {
      icon: Clock,
      title: "Flexible Time Slots",
      description: "Set custom time slots that work for everyone"
    },
    {
      icon: Globe,
      title: "Accessible Anywhere",
      description: "Share and access your events from any device"
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId.trim()) {
      toast.error("Please enter an event ID");
      return;
    }
    navigate(`/event/share/${eventId.trim()}`);
  };

  return (
    <div className="bg-background overflow-hidden">
      <div className="relative min-h-screen">
        {/* Background Layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Background Shapes */}
          <div className="absolute right-0 top-0 w-[45%] h-[400px] bg-gradient-to-bl from-blue-200/40 to-blue-300/40 rounded-bl-[100px] backdrop-blur-3xl" />
          <div className="absolute right-[15%] top-[20%] w-[25%] h-[250px] bg-gradient-to-bl from-blue-300/30 to-purple-200/30 rounded-[50px] backdrop-blur-3xl transform rotate-12" />
          
          <div className="absolute left-[10%] bottom-[10%] w-[30%] h-[250px] bg-gradient-to-tr from-blue-200/40 to-purple-200/40 rounded-tr-[80px] backdrop-blur-3xl" />
          <div className="absolute left-[5%] bottom-[20%] w-[20%] h-[180px] bg-gradient-to-br from-purple-200/30 to-blue-300/30 rounded-[40px] backdrop-blur-3xl transform -rotate-12" />

          {/* Decorative Elements */}
          <div className="absolute right-[35%] top-[30%] w-8 h-8 bg-blue-400/20 rounded-full backdrop-blur-sm animate-pulse" />
          <div className="absolute left-[25%] top-[40%] w-12 h-12 bg-purple-400/20 rounded-full backdrop-blur-sm animate-pulse delay-300" />
          <div className="absolute right-[20%] bottom-[25%] w-10 h-10 bg-blue-300/20 rounded-full backdrop-blur-sm animate-pulse delay-700" />

          {/* Additional Decorative Dots */}
          <div className="absolute top-[15%] left-[10%] w-2 h-2 bg-blue-400/40 rounded-full" />
          <div className="absolute top-[45%] right-[15%] w-2 h-2 bg-purple-400/40 rounded-full" />
          <div className="absolute bottom-[25%] left-[30%] w-2 h-2 bg-blue-400/40 rounded-full" />
          <div className="absolute top-[65%] right-[25%] w-2 h-2 bg-purple-400/40 rounded-full" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10">
          <div className="container mx-auto px-4 pt-20 md:pt-32 pb-20">
            <div className="max-w-4xl mx-auto">
              <div className={`space-y-8 md:space-y-12 text-center transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                {/* Hero Section */}
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-6xl font-bold text-[#1a3b66] dark:text-white leading-tight">
                    Easy scheduling <br className="hidden md:block" />
                    <span className="text-blue-500">ahead</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                    Join who want to easily book meetings with the scheduling tool.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-8 max-w-md mx-auto">
                  <Button 
                    size="lg" 
                    className="w-full bg-blue-600 hover:bg-blue-700 group transition-all duration-300"
                    asChild
                  >
                    <Link to="/signup">
                      <Calendar className="mr-2 h-5 w-5" />
                      Sign up with Email
                      <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </Button>

                  {/* Search Event Section */}
                  <div className="space-y-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    <p className="text-sm text-muted-foreground">
                      Or join an event with ID
                    </p>
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter event ID"
                        value={eventId}
                        onChange={(e) => setEventId(e.target.value)}
                        className="flex-1 h-12 text-lg"
                      />
                      <Button 
                        type="submit" 
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Search className="h-5 w-5" />
                      </Button>
                    </form>
                  </div>
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                  {features.map((feature, index) => (
                    <div
                      key={feature.title}
                      className={`p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-1 ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}
                      style={{
                        transitionDelay: `${index * 100}ms`
                      }}
                    >
                      <feature.icon className="h-8 w-8 text-blue-500 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
