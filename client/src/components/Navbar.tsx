import { RootState } from "@/redux/store";
import { LayoutDashboard } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { NotificationsModal } from "./NotificationsModal";
import { UserMenu } from "./UserMenu";
import { Button } from "./ui/button";
import Image from "./ui/image";

export function Navbar() {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const navigate = useNavigate();
  const location = useLocation();
  const renderAuthButton = () => {
    if (location.pathname === '/login') {
      return (
        <Button 
          variant="blue"
          onClick={() => navigate('/signup')}
          className="text-sm px-3 sm:px-4"
          size="sm"
        >
          <span className="hidden sm:inline">Sign Up</span>
          <span className="sm:hidden">Up</span>
        </Button>
      );
    }
    
    if (location.pathname === '/register') {
      return (
        <Button 
          variant="ghost"
          onClick={() => navigate('/login')}
          className="text-sm px-3 sm:px-4"
          size="sm"
        >
          <span className="hidden sm:inline">Sign In</span>
          <span className="sm:hidden">In</span>
        </Button>
      );
    }

    return (
      <>
        <Button 
          variant="ghost"
          onClick={() => navigate('/login')}
          className="text-sm px-2 sm:px-4"
          size="sm"
        >
          <span className="hidden sm:inline">Sign In</span>
          <span className="sm:hidden">In</span>
        </Button>
        <Button 
          variant="blue"
          onClick={() => navigate('/signup')}
          className="text-sm px-2 sm:px-4"
          size="sm"
        >
          <span className="hidden sm:inline">Sign Up</span>
          <span className="sm:hidden">Up</span>
        </Button>
      </>
    );
  };
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="flex h-16 items-center px-4 lg:px-6 max-w-full">
        <Image 
          src="../../public/eventra.png" 
          alt="Eventra Logo" 
          onClick={() => navigate('/')} 
          className="h-16 sm:h-20 md:h-24 w-auto cursor-pointer" 
        />
        <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <>
              {location.pathname === '/' && (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="gap-2 hidden sm:flex"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              )}
              {location.pathname === '/' && (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="gap-2 sm:hidden"
                  size="sm"
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
              )}
              <NotificationsModal />
              <UserMenu 
                name={user?.name} 
                surname={user?.surname} 
                profileUrl={user?.profile_url} 
              />
            </>
          ) : renderAuthButton()}
        </div>
      </div>
    </div>
  );
}
