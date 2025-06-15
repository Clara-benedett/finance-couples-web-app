
import { Card, CardContent } from "@/components/ui/card";
import { User, Share } from "lucide-react";
import { CategoryNames } from "@/utils/categoryNames";

interface CategoryDisplayProps {
  categoryNames: CategoryNames;
}

const CategoryDisplay = ({ categoryNames }: CategoryDisplayProps) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-blue-900">Categories:</span>
          <div className="flex items-center gap-4 text-sm text-blue-700">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {categoryNames.person1}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {categoryNames.person2}
            </span>
            <span className="flex items-center gap-1">
              <Share className="w-3 h-3" />
              {categoryNames.shared}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryDisplay;
