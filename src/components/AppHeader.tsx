
import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, Settings, Menu, X } from "lucide-react";

const navigationItems = [
  { title: "Dashboard", url: "/" },
  { title: "Upload", url: "/upload" },
  { title: "Categorize", url: "/categorize" },
  { title: "History", url: "/history" },
];

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const getNavLinkClasses = (path: string) => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200";
    if (isActive(path)) {
      return `${baseClasses} bg-blue-100 text-blue-700 border-b-2 border-blue-600`;
    }
    return `${baseClasses} text-gray-600 hover:text-gray-900 hover:bg-gray-100`;
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Couply</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === "/"}
                className={getNavLinkClasses(item.url)}
              >
                {item.title}
              </NavLink>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button 
              onClick={() => navigate("/upload")}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Expenses
            </Button>
            <Button 
              onClick={() => {
                // This will trigger the settings in Dashboard component
                if (location.pathname === "/") {
                  const settingsEvent = new CustomEvent('openSettings');
                  window.dispatchEvent(settingsEvent);
                } else {
                  navigate("/?settings=true");
                }
              }}
              variant="outline"
              size="sm"
              className="border-gray-300 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Split Settings
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  end={item.url === "/"}
                  className={getNavLinkClasses(item.url)}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.title}
                </NavLink>
              ))}
              
              <div className="pt-4 border-t border-gray-200 mt-4">
                <div className="flex flex-col space-y-2">
                  <Button 
                    onClick={() => {
                      navigate("/upload");
                      setIsMobileMenuOpen(false);
                    }}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white justify-start"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Expenses
                  </Button>
                  <Button 
                    onClick={() => {
                      if (location.pathname === "/") {
                        const settingsEvent = new CustomEvent('openSettings');
                        window.dispatchEvent(settingsEvent);
                      } else {
                        navigate("/?settings=true");
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:bg-gray-50 justify-start"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Split Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
