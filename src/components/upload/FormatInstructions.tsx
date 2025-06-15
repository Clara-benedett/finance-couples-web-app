
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle } from "lucide-react";

const FormatInstructions = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Required Columns
          </CardTitle>
          <CardDescription>
            Your file must contain these columns (names can vary):
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li><strong>Date:</strong> Transaction date (various formats supported)</li>
            <li><strong>Amount:</strong> Transaction amount (positive numbers)</li>
            <li><strong>Description:</strong> Merchant or transaction description</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Supported Formats
          </CardTitle>
          <CardDescription>
            We support common column name variations:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li><strong>Date:</strong> Date, Data, Transaction Date</li>
            <li><strong>Amount:</strong> Amount, Valor, Value, Price, Debit</li>
            <li><strong>Description:</strong> Description, Descrição, Merchant</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormatInstructions;
