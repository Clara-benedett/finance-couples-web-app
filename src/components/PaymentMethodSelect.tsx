
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentMethodSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const PaymentMethodSelect = ({ value, onValueChange }: PaymentMethodSelectProps) => {
  const paymentMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'debit', label: 'Debit' },
    { value: 'other', label: 'Other' },
    { value: 'pix', label: 'PIX' },
    { value: 'venmo', label: 'Venmo' },
    { value: 'zelle', label: 'Zelle' }
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select payment method" />
      </SelectTrigger>
      <SelectContent>
        {paymentMethods.map((method) => (
          <SelectItem key={method.value} value={method.value}>
            {method.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PaymentMethodSelect;
