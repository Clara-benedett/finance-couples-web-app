
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardClassificationRule } from "@/utils/cardClassificationRules";
import SmartCardInput from "./SmartCardInput";

interface MergeCardsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: CardClassificationRule | null;
  mergeTarget: string;
  onMergeTargetChange: (target: string) => void;
  onMerge: () => void;
}

const MergeCardsDialog = ({
  open,
  onOpenChange,
  rule,
  mergeTarget,
  onMergeTargetChange,
  onMerge
}: MergeCardsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Merge Card Rules</DialogTitle>
          <DialogDescription>
            Merge "{rule?.card_name}" into another card. The rule for "{rule?.card_name}" will be deleted.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <SmartCardInput
            value={mergeTarget}
            onChange={onMergeTargetChange}
            placeholder="Select target card to merge into"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onMerge} disabled={!mergeTarget.trim()}>
            Merge Cards
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MergeCardsDialog;
