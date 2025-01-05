import { LogOut, Moon, Sun, User } from "lucide-react"
import { useDispatch } from "react-redux"
import { signOutSuccess } from "../redux/user/userSlice"
import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"
import Image from "./ui/image"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

interface UserMenuProps {
  profileUrl?: string
  name?: string
  surname?: string
}

export function UserMenu({ profileUrl, name, surname }: UserMenuProps) {
  const dispatch = useDispatch()
  const { theme, setTheme } = useTheme()

  const handleSignOut = () => {
    dispatch(signOutSuccess())
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
          <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
            {profileUrl ? (
              <Image 
                src={encodeURI(profileUrl)} 
                alt="User Profile" 
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 m-2" />
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="mx-3 justify-start">{name} {surname}</div>
        <div className={name ? "mx-3 my-1 py-[1px] w-full bg-slate-300" : "hidden"}></div>
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <div className="flex items-center">
              <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              Theme
            </div>
            <span className="text-xs text-muted-foreground">
              {theme === "light" ? "Light" : "Dark"}
            </span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {/* Navigate to profile */}}
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-100"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
} 