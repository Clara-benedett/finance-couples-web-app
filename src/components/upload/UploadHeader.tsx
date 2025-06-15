
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface UploadHeaderProps {
  onEditCategories: () => void;
}

const UploadHeader = ({ onEditCategories }: UploadHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Expense Files</h1>
        <p className="text-gray-600">
          Upload CSV or Excel files, or add manual expenses
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

export default UploadHeader;
