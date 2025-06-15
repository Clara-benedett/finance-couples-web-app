
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ManualExpenseFABProps {
  onClick: () => void;
  show: boolean;
}

const ManualExpenseFAB = ({ onClick, show }: ManualExpenseFABProps) => {
  if (!show) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Add manual expense</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ManualExpenseFAB;
