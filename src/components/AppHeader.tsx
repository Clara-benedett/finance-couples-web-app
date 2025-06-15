
import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, Menu, X, Home, CreditCard, BarChart3, History, Settings } from "lucide-react";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Upload", url: "/upload", icon: Upload },
  { title: "Categorize", url: "/categorize", icon: CreditCard },
  { title: "History", url: "/history", icon: History },
  { title: "Settings", url: "/settings", icon: Settings },
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
    const baseClasses = "nav-item nav-item-hover flex items-center gap-2";
    if (isActive(path)) {
      return `${baseClasses} nav-item-active`;
    }
    return baseClasses;
  };

  return (
    <header className="bg-dark-accent-900 border-b border-dark-accent-800 shadow-elevated sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Enhanced with modern styling */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group transition-all duration-200 hover:scale-105"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-fintech-blue-500 to-fintech-purple-500 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-card transition-all duration-200">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-white leading-none">Couply</h1>
              <span className="text-xs text-gray-400 leading-none">Finance Manager</span>
            </div>
          </div>

          {/* Desktop Navigation - Modern dark theme */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  end={item.url === "/"}
                  className={getNavLinkClasses(item.url)}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Action Buttons - Enhanced styling */}
          <div className="hidden lg:flex items-center space-x-3">
            <Button 
              onClick={() => navigate("/upload")}
              size="sm"
              className="bg-fintech-blue-600 hover:bg-fintech-blue-700 text-white shadow-soft hover:shadow-card transition-all duration-200 font-medium"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Expenses
            </Button>
          </div>

          {/* Mobile Menu Button - Enhanced */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu - Enhanced */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-dark-accent-800 py-4 animate-fade-in">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    end={item.url === "/"}
                    className={`${getNavLinkClasses(item.url)} justify-start`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
              
              <div className="pt-4 border-t border-dark-accent-800 mt-4">
                <Button 
                  onClick={() => {
                    navigate("/upload");
                    setIsMobileMenuOpen(false);
                  }}
                  size="sm"
                  className="w-full bg-fintech-blue-600 hover:bg-fintech-blue-700 text-white justify-start font-medium"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Expenses
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
