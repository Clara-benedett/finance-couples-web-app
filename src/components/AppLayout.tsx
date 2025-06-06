
import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      {/* Main Content */}
      <main className="pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
