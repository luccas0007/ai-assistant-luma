
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface ConnectionTestProps {
  onTest: () => Promise<void>;
  isTesting: boolean;
  result: { success: boolean; message: string } | null;
}

export default function ConnectionTest({ onTest, isTesting, result }: ConnectionTestProps) {
  return (
    <div className="space-y-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onTest} 
        disabled={isTesting}
      >
        {isTesting ? 'Testing Connection...' : 'Test Connection'}
      </Button>
      
      {result && (
        <div className={`flex items-center gap-2 p-2 rounded text-sm ${
          result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          {result.message}
        </div>
      )}
    </div>
  );
}
