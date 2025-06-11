import { Calendar, PlusCircle, Settings, Users } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onPageChange?: (page: string) => void;
  onCreateEvent?: () => void;
}

export function Sidebar({ className, onPageChange, onCreateEvent }: SidebarProps) {
  const [activePage, setActivePage] = useState("Events")

  const menuItems = [
    { icon: Calendar, label: "Events", id: "events" },
    { icon: Users, label: "Attendees", id: "attendees" },
    { icon: Settings, label: "Settings", id: "settings" },
  ]

  const handleMenuClick = (label: string) => {
    setActivePage(label)
    onPageChange?.(label.toLowerCase())
  }

  return (
    <div className={cn("pb-12 min-h-screen w-48 sm:w-60 border-r bg-background", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 sm:px-4 py-2">
          <Button 
            variant="blue" 
            className="w-full text-sm sm:text-base" 
            size="lg"
            onClick={onCreateEvent}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Create Event</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
        <div className="px-2 sm:px-3 py-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sm sm:text-base",
                  activePage === item.label && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleMenuClick(item.label)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}