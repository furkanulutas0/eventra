import { CalendarIcon, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

interface EventCardProps {
  title: string
  date: string
  description: string
  location?: string
}

export function EventCard({ title, date, description, location }: EventCardProps) {
  return (
    <Card className="hover:shadow-md dark:hover:shadow-gray-800 transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          <div className="flex items-center text-muted-foreground">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="text-sm">{date}</span>
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          {location && (
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              {location}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 