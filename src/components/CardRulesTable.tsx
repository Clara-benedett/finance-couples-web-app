
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Merge, User, Share } from "lucide-react";
import { CardClassificationRule } from "@/utils/cardClassificationRules";
import { getCategoryNames } from "@/utils/categoryNames";

interface CardRulesTableProps {
  rules: CardClassificationRule[];
  onEdit: (rule: CardClassificationRule) => void;
  onDelete: (rule: CardClassificationRule) => void;
  onMerge: (rule: CardClassificationRule) => void;
}

const CardRulesTable = ({ rules, onEdit, onDelete, onMerge }: CardRulesTableProps) => {
  const categoryNames = getCategoryNames();

  const getCategoryDisplay = (classification: string) => {
    switch (classification) {
      case 'person1': return categoryNames.person1;
      case 'person2': return categoryNames.person2;
      case 'shared': return categoryNames.shared;
      default: return classification;
    }
  };

  const getCategoryIcon = (classification: string) => {
    switch (classification) {
      case 'person1': return <User className="w-4 h-4 text-blue-600" />;
      case 'person2': return <User className="w-4 h-4 text-green-600" />;
      case 'shared': return <Share className="w-4 h-4 text-purple-600" />;
      default: return null;
    }
  };

  if (rules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No card rules configured yet.</p>
        <p className="text-sm">Add your first rule to automatically classify transactions.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Card Name</TableHead>
            <TableHead>Auto-Classification</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule) => (
            <TableRow key={rule.cardName}>
              <TableCell className="font-medium">{rule.cardName}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getCategoryIcon(rule.classification)}
                  {getCategoryDisplay(rule.classification)}
                </div>
              </TableCell>
              <TableCell className="text-gray-500">
                {new Date(rule.lastUsed).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(rule)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMerge(rule)}
                  >
                    <Merge className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(rule)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CardRulesTable;
