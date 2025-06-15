
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Settings, Bug, Calendar } from "lucide-react";

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
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Couply</h1>
          <div className="flex items-center gap-2 text-blue-100">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{currentMonth}</span>
            {isDebugMode && (
              <Badge variant="secondary" className="ml-2 text-xs">DEBUG MODE</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={toggleDebugMode}
            variant={isDebugMode ? "secondary" : "outline"}
            size="sm"
            className={isDebugMode ? "bg-yellow-500 text-yellow-900 hover:bg-yellow-400" : "bg-white text-blue-600 hover:bg-gray-100"}
          >
            <Bug className="w-4 h-4" />
          </Button>
          <Button 
            onClick={onSettingsClick}
            size="sm"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button 
            onClick={onUploadClick}
            size="sm"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            <Upload className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
