
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Upload, Home, History, Tags } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/upload", icon: Upload, label: "Upload" },
    { path: "/categorize", icon: Tags, label: "Categorize" },
    { path: "/history", icon: History, label: "History" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold text-gray-900">Couply Finance</h1>
          
          <nav className="hidden md:flex space-x-4">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Button
                key={path}
                variant={location.pathname === path ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(path)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <span className="text-sm text-gray-600 hidden sm:block">
              {user.email}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
