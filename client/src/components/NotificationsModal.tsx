import { Bell } from "lucide-react"
import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

export function NotificationsModal() {
  const notifications = [
    {
      id: 1,
      title: "New Event Invitation",
      message: "You've been invited to Team Meeting",
      time: "2 hours ago"
    },
    {
      id: 2,
      title: "Event Reminder",
      message: "Product Launch starts in 1 hour",
      time: "1 hour ago"
    }
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex flex-col">
          <div className="flex items-center border-b px-4 py-2">
            <h4 className="font-semibold">Notifications</h4>
          </div>
          <div className="max-h-[300px] overflow-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex flex-col space-y-1 border-b p-4 last:border-0 hover:bg-muted/50 cursor-pointer"
              >
                <h4 className="font-medium">{notification.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
                <span className="text-xs text-muted-foreground">
                  {notification.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 