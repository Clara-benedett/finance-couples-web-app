
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import CategoryButtons from "./CategoryButtons";
import PaymentMethodSelect from "./PaymentMethodSelect";
import { getCategoryNames } from "@/utils/categoryNames";

type CategoryType = "person1" | "person2" | "shared" | "UNCLASSIFIED";

interface FormData {
  amount: string;
  description: string;
  date: Date;
  category: CategoryType;
  paymentMethod: string;
  paidBy: 'person1' | 'person2';
}

interface ManualExpenseFormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ManualExpenseForm = ({ onSubmit, onCancel, isSubmitting = false }: ManualExpenseFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    description: '',
    date: new Date(),
    category: 'UNCLASSIFIED',
    paymentMethod: 'cash',
    paidBy: 'person1'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const categoryNames = getCategoryNames();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.description || formData.description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const clearForm = () => {
    setFormData({
      amount: '',
      description: '',
      date: new Date(),
      category: 'UNCLASSIFIED',
      paymentMethod: formData.paymentMethod, // Keep last used payment method
      paidBy: formData.paidBy // Keep last used payer
    });
    setErrors({});
  };

  const handleAddAnother = () => {
    onSubmit(formData);
    clearForm();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className={cn(errors.amount && "border-red-500")}
          autoFocus
        />
        {errors.amount && (
          <p className="text-sm text-red-600">{errors.amount}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          placeholder="e.g., Coffee with Lauren"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={cn(errors.description && "border-red-500")}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.date}
              onSelect={(date) => date && setFormData({ ...formData, date })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <PaymentMethodSelect
          value={formData.paymentMethod}
          onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
        />
      </div>

      {/* Paid By */}
      <div className="space-y-2">
        <Label>Paid By</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={formData.paidBy === 'person1' ? 'default' : 'outline'}
            onClick={() => setFormData({ ...formData, paidBy: 'person1' })}
            className="flex-1"
          >
            {categoryNames.person1}
          </Button>
          <Button
            type="button"
            variant={formData.paidBy === 'person2' ? 'default' : 'outline'}
            onClick={() => setFormData({ ...formData, paidBy: 'person2' })}
            className="flex-1"
          >
            {categoryNames.person2}
          </Button>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <CategoryButtons
          currentCategory={formData.category}
          onCategoryClick={(category) => setFormData({ ...formData, category })}
          isDisabled={isSubmitting}
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={handleAddAnother}
          disabled={isSubmitting}
          className="flex-1"
        >
          Add Another
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          Add Expense
        </Button>
      </div>
    </form>
  );
};

export default ManualExpenseForm;
