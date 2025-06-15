
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, CreditCard } from "lucide-react";
import CardRulesManager from "@/components/CardRulesManager";
import { getCategoryNames } from "@/utils/categoryNames";

const Settings = () => {
  const categoryNames = getCategoryNames();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          Settings
        </h1>
        <p className="text-gray-600">
          Manage your expense tracking preferences and card classification rules
        </p>
      </div>

      {/* Current Categories Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Categories</CardTitle>
          <CardDescription>
            The expense categories you're currently using
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900">{categoryNames.person1}</h4>
              <p className="text-sm text-blue-700">Individual expenses</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900">{categoryNames.person2}</h4>
              <p className="text-sm text-green-700">Individual expenses</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900">{categoryNames.shared}</h4>
              <p className="text-sm text-purple-700">Shared expenses</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Rules Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Card Classification Rules
          </CardTitle>
          <CardDescription>
            Manage automatic categorization rules for your cards and accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CardRulesManager />
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
