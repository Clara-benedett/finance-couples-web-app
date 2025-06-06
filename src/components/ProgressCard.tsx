
import { Card, CardContent } from "@/components/ui/card";

interface ProgressCardProps {
  categorizedCount: number;
  totalCount: number;
}

const ProgressCard = ({ categorizedCount, totalCount }: ProgressCardProps) => {
  const progressPercentage = totalCount > 0 ? Math.round((categorizedCount / totalCount) * 100) : 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Categorization Progress</h3>
            <p className="text-gray-500">
              {categorizedCount} of {totalCount} transactions categorized
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{progressPercentage}%</div>
            <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
