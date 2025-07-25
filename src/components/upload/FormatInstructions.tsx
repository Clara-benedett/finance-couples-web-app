
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const FormatInstructions = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          File Format Requirements
        </CardTitle>
        <CardDescription>
          Your CSV, Excel, or PDF file must contain these columns (column names can vary):
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-2">Required Columns</h4>
            <ul className="space-y-1 text-sm">
              <li><strong>Date:</strong> Transaction date (various formats supported)</li>
              <li><strong>Amount:</strong> Transaction amount (positive numbers)</li>
              <li><strong>Description:</strong> Merchant or transaction description</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-2">Supported Column Names</h4>
            <ul className="space-y-1 text-sm">
              <li><strong>Date:</strong> Date, Data, Transaction Date</li>
              <li><strong>Amount:</strong> Amount, Valor, Value, Price, Debit</li>
              <li><strong>Description:</strong> Description, Descrição, Merchant</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormatInstructions;
