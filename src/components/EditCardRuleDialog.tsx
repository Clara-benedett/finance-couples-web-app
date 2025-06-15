
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Share, Info } from "lucide-react";
import { getCategoryNames } from "@/utils/categoryNames";

interface EditCardRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardName: string;
  onCardNameChange: (name: string) => void;
  classification: 'person1' | 'person2' | 'shared';
  onClassificationChange: (classification: 'person1' | 'person2' | 'shared') => void;
  onUpdate: () => void;
}

const EditCardRuleDialog = ({
  open,
  onOpenChange,
  cardName,
  onCardNameChange,
  classification,
  onClassificationChange,
  onUpdate
}: EditCardRuleDialogProps) => {
  const categoryNames = getCategoryNames();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Card Rule</DialogTitle>
          <DialogDescription>
            Update the card name and classification rule.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Informational Alert */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Important:</p>
              <p>Changing this rule will only affect new transactions. Previously categorized transactions will remain unchanged to protect your existing work.</p>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-card-name">Card Name</Label>
            <Input
              id="edit-card-name"
              value={cardName}
              onChange={(e) => onCardNameChange(e.target.value)}
              placeholder="Enter card or account name"
            />
          </div>

          <div className="space-y-3">
            <Label>Automatically classify as:</Label>
            <RadioGroup
              value={classification}
              onValueChange={onClassificationChange}
              className="grid grid-cols-1 gap-3"
            >
              <Label htmlFor="edit-person1" className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-blue-50 cursor-pointer">
                <RadioGroupItem value="person1" id="edit-person1" />
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-normal text-blue-600">{categoryNames.person1}</span>
              </Label>
              <Label htmlFor="edit-person2" className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-green-50 cursor-pointer">
                <RadioGroupItem value="person2" id="edit-person2" />
                <User className="w-4 h-4 text-green-600" />
                <span className="font-normal text-green-600">{categoryNames.person2}</span>
              </Label>
              <Label htmlFor="edit-shared" className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer">
                <RadioGroupItem value="shared" id="edit-shared" />
                <Share className="w-4 h-4 text-purple-600" />
                <span className="font-normal text-purple-600">{categoryNames.shared}</span>
              </Label>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onUpdate} disabled={!cardName.trim()}>
            Update Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCardRuleDialog;
