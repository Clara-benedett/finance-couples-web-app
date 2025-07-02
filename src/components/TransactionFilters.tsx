
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import CategoryButtons from "./CategoryButtons";

type CategoryType = "person1" | "person2" | "shared" | "UNCLASSIFIED";

interface TransactionFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTransactions: Set<string>;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkCategoryClick: (category: CategoryType) => void;
  onBulkDelete?: (ids: string[]) => void;
}

const TransactionFilters = ({
  searchTerm,
  setSearchTerm,
  selectedTransactions,
  onSelectAll,
  onClearSelection,
  onBulkCategoryClick,
  onBulkDelete
}: TransactionFiltersProps) => {
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Search bar */}
          <div className="w-96">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onSelectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={onClearSelection}>
                  Clear Selection
                </Button>
              </div>
              <span className="text-sm text-gray-500">
                {selectedTransactions.size} selected
              </span>
            </div>
          </div>

          {/* Bulk Action Buttons */}
          {selectedTransactions.size > 0 && (
            <div className="flex gap-3 flex-wrap items-center">
              <span className="text-sm text-gray-600 mr-2">Categorize selected as:</span>
              <CategoryButtons
                currentCategory="UNCLASSIFIED"
                onCategoryClick={onBulkCategoryClick}
                isForBulk={true}
              />
              {onBulkDelete && (
                <>
                  <span className="text-sm text-gray-600 mx-2">or</span>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => onBulkDelete(Array.from(selectedTransactions))}
                  >
                    Delete Selected
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionFilters;
