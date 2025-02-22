import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function MedicalDisclaimer() {
  return (
    <Alert variant="warning" className="mt-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <p className="font-medium">Medical Disclaimer:</p>
        <p className="text-sm mt-1">
          The information provided by this application is for general informational 
          purposes only and is not intended as a substitute for professional medical 
          advice, diagnosis, or treatment. Always seek the advice of your physician 
          or other qualified health provider with any questions you may have regarding 
          a medical condition. Never disregard professional medical advice or delay 
          in seeking it because of something you have read on this application.
        </p>
        <p className="text-sm mt-2">
          While we strive to provide accurate health insights through AI analysis, 
          there is a possibility of errors. The recommendations provided should be 
          discussed with your healthcare provider before making any medical decisions.
        </p>
      </AlertDescription>
    </Alert>
  );
}
