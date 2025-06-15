
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ManualExpenseForm from "./ManualExpenseForm";
import { Transaction } from "@/types/transaction";
import { transactionStore } from "@/store/transactionStore";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState } from "react";

type CategoryType = "person1" | "person2" | "shared" | "UNCLASSIFIED";

interface FormData {
  amount: string;
  description: string;
  date: Date;
  category: CategoryType;
  paymentMethod: string;
  paidBy: 'person1' | 'person2';
}

interface ManualExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ManualExpenseDialog = ({ open, onOpenChange }: ManualExpenseDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    try {
      const transaction: Transaction = {
        id: generateId(),
        date: format(formData.date, 'yyyy-MM-dd'),
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
        cardName: `Manual Entry (${formData.paymentMethod})`,
        paidBy: formData.paidBy,
        isClassified: formData.category !== 'UNCLASSIFIED',
        isManualEntry: true,
        paymentMethod: formData.paymentMethod,
        autoAppliedRule: false
      };

      transactionStore.addTransactions([transaction]);
      
      toast({
        title: "Expense added successfully",
        description: `${formData.description} - $${formData.amount}`,
      });

    } catch (error) {
      toast({
        title: "Error adding expense",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (formData: FormData) => {
    handleSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Manual Expense</DialogTitle>
          <DialogDescription>
            Add a cash, PIX, Venmo, or other non-card expense manually.
          </DialogDescription>
        </DialogHeader>
        
        <ManualExpenseForm
          onSubmit={handleFormSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ManualExpenseDialog;
