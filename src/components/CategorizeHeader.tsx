
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface CategorizeHeaderProps {
  onEditCategories: () => void;
}

const CategorizeHeader = ({ onEditCategories }: CategorizeHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categorize Expenses</h1>
        <p className="text-gray-600">
          Review and categorize your expenses using your custom categories
        </p>
      </div>
      <Button
        variant="outline"
        onClick={onEditCategories}
        className="flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Edit Categories
      </Button>
    </div>
  );
};

export default CategorizeHeader;
