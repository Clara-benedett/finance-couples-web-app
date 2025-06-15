
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ManualEntryCardProps {
  onAddManualExpense: () => void;
}

const ManualEntryCard = ({ onAddManualExpense }: ManualEntryCardProps) => {
  return (
    <Card className="border-2 border-dashed border-purple-300 hover:border-purple-400 transition-colors">
      <CardContent className="p-8">
        <div className="text-center rounded-lg p-8">
          <Plus className="mx-auto h-12 w-12 text-purple-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Add Manual Expense
          </h3>
          <p className="text-gray-500 mb-4">
            Add cash, PIX, Venmo, or other manual expenses
          </p>
          <Button 
            onClick={onAddManualExpense}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualEntryCard;
