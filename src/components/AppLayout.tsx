
import { Outlet } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export function AppLayout() {
  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm">
          <SidebarTrigger className="mr-4 hover:bg-gray-100" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">CoupleFinance</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome back!</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
