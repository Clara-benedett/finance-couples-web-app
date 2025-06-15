
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Settings, Bug, Calendar, TrendingUp } from "lucide-react";

interface DashboardHeaderProps {
  currentMonth: string;
  isDebugMode: boolean;
  toggleDebugMode: () => void;
  onUploadClick: () => void;
  onSettingsClick: () => void;
}

const DashboardHeader = ({ 
  currentMonth, 
  isDebugMode, 
  toggleDebugMode, 
  onUploadClick, 
  onSettingsClick 
}: DashboardHeaderProps) => {
  return (
    <div className="card-elevated bg-gradient-to-r from-dark-accent-900 to-dark-accent-800 p-8 text-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-fintech-blue-500/10 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-fintech-blue-500 to-fintech-purple-500 rounded-xl flex items-center justify-center shadow-card">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1 tracking-tight">Financial Dashboard</h1>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">{currentMonth}</span>
                  </div>
                  {isDebugMode && (
                    <Badge variant="secondary" className="bg-fintech-orange-500 text-white border-0 text-xs font-medium">
                      DEBUG MODE
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={toggleDebugMode}
              variant={isDebugMode ? "secondary" : "outline"}
              size="sm"
              className={
                isDebugMode 
                  ? "bg-fintech-orange-500 text-white hover:bg-fintech-orange-600 border-0 shadow-soft" 
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
              }
            >
              <Bug className="w-4 h-4" />
            </Button>
            
            <Button 
              onClick={onSettingsClick}
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button 
              onClick={onUploadClick}
              size="sm"
              className="bg-fintech-blue-600 text-white hover:bg-fintech-blue-700 shadow-card hover:shadow-elevated transition-all duration-200 hover:scale-105 font-medium"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
