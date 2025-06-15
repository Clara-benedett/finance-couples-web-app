
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CardClassificationRule } from "@/utils/cardClassificationRules";

interface DeleteCardRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: CardClassificationRule | null;
  onDelete: () => void;
}

const DeleteCardRuleDialog = ({
  open,
  onOpenChange,
  rule,
  onDelete
}: DeleteCardRuleDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Card Rule</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the rule for "{rule?.cardName}"? 
            This action cannot be undone and future transactions from this card will not be automatically classified.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
            Delete Rule
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCardRuleDialog;
