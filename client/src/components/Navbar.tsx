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
        >
          Sign Up
        </Button>
      );
    }
    
    if (location.pathname === '/register') {
      return (
        <Button 
          variant="ghost"
          onClick={() => navigate('/login')}
        >
          Sign In
        </Button>
      );
    }

    return (
      <>
        <Button 
          variant="ghost"
          onClick={() => navigate('/login')}
        >
          Sign In
        </Button>
        <Button 
          variant="blue"
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </Button>
      </>
    );
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="flex h-16 items-center px-4 max-w-full">
        <Image 
          src="eventra.png" 
          alt="Eventra Logo" 
          onClick={() => navigate('/')} 
          className="h-24 w-auto cursor-pointer" 
        />
        <div className="ml-auto flex items-center space-x-4">
          {user ? (
            <>
              {location.pathname === '/' && (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
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
