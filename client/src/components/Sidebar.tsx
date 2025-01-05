import { Calendar, PlusCircle, Settings, Users } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onPageChange?: (page: string) => void;
}

export function Sidebar({ className, onPageChange }: SidebarProps) {
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
    <div className={cn("pb-12 min-h-screen w-60 border-r", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Button variant="blue" className="w-full" size="lg">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  activePage === item.label && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleMenuClick(item.label)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 