
import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-light-gray-50">
      <AppHeader />
      
      {/* Main Content - Enhanced with modern spacing and responsive design */}
      <main className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
