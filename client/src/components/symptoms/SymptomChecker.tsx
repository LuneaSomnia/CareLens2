import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Loader2, AlertTriangle, Plus, X, Trash2 } from "lucide-react";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";
import { useToast } from "@/hooks/use-toast";

type SymptomAnalysis = {
  conditions: Array<{
    name: string;
    confidence: number;
    severity: "low" | "medium" | "high";
  }>;
  recommendations: string[];
  emergencyWarning?: string;
};

export default function SymptomChecker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState("");
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false);

  // Get the user's previous symptom logs
  const { data: previousSymptoms, refetch: refetchSymptoms } = useQuery({
    queryKey: ["/api/symptoms", user?.id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/symptoms?userId=${user?.id}`);
      return res.json();
    },
    enabled: !!user?.id
  });

  const analyzeSymptoms = useMutation({
    mutationFn: async (symptoms: string[]) => {
      try {
        const res = await apiRequest("POST", "/api/symptoms/analyze", { 
          symptoms,
          userProfile: {
            age: user ? Math.floor((new Date().getTime() - new Date(user.dateOfBirth).getTime()) / 31536000000) : undefined,
            gender: user?.gender,
            medicalHistory: user?.medicalHistory,
            familyHistory: user?.familyHistory,
            lifestyle: user?.lifestyle
          }
        });

        const analysis = await res.json();

        if (analysis.error) {
          throw new Error(analysis.error);
        }

        // Save the analysis to health logs
        await apiRequest("POST", "/api/health-logs", {
          userId: user?.id,
          type: "symptom",
          data: {
            symptoms,
            analysis
          },
          createdAt: new Date().toISOString()
        });

        return analysis as SymptomAnalysis;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to analyze symptoms";
        toast({
          title: "Analysis Failed",
          description: message,
          variant: "destructive"
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms"] });
    }
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/symptoms?userId=${user?.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms"] });
      toast({
        title: "History Cleared",
        description: "Your symptom history has been cleared successfully."
      });
      setShowClearHistoryDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clear symptom history. Please try again.",
        variant: "destructive"
      });
    }
  });

  const addSymptom = () => {
    if (currentSymptom.trim() && !symptoms.includes(currentSymptom.trim())) {
      setSymptoms([...symptoms, currentSymptom.trim()]);
      setCurrentSymptom("");
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  const clearCurrentSymptoms = () => {
    setSymptoms([]);
    toast({
      title: "Symptoms Cleared",
      description: "Current symptoms have been cleared. Your history remains intact."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Symptom Checker</span>
            <div className="flex gap-2">
              {symptoms.length > 0 && (
                <Button 
                  variant="outline"
                  onClick={clearCurrentSymptoms}
                >
                  Clear Current
                </Button>
              )}
              {previousSymptoms?.length > 0 && (
                <Button 
                  variant="destructive"
                  onClick={() => setShowClearHistoryDialog(true)}
                >
                  Clear History
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                placeholder="Enter a symptom"
                onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
              />
              <Button onClick={addSymptom} disabled={!currentSymptom.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom) => (
                <Badge key={symptom} variant="secondary" className="flex items-center gap-1">
                  {symptom}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeSymptom(symptom)}
                  />
                </Badge>
              ))}
            </div>

            <Button
              className="w-full"
              onClick={() => analyzeSymptoms.mutate(symptoms)}
              disabled={symptoms.length === 0 || analyzeSymptoms.isPending}
            >
              {analyzeSymptoms.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Symptoms"
              )}
            </Button>
          </div>

          {analyzeSymptoms.data && (
            <div className="mt-6 space-y-4">
              {analyzeSymptoms.data.emergencyWarning && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Emergency Warning</AlertTitle>
                  <AlertDescription>
                    {analyzeSymptoms.data.emergencyWarning}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Potential Conditions</h3>
                <div className="grid gap-2">
                  {analyzeSymptoms.data.conditions.map((condition) => (
                    <div
                      key={condition.name}
                      className="p-4 border rounded-lg flex justify-between items-center"
                    >
                      <span>{condition.name}</span>
                      <Badge variant={
                        condition.severity === "high" ? "destructive" :
                        condition.severity === "medium" ? "default" : "secondary"
                      }>
                        {Math.round(condition.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Recommendations</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {analyzeSymptoms.data.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              <MedicalDisclaimer />
            </div>
          )}

          {previousSymptoms && previousSymptoms.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-lg font-semibold">Previous Symptom Checks</h3>
              <div className="space-y-2">
                {previousSymptoms.map((log: any, i: number) => (
                  <div key={i} className="p-4 border rounded-lg space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {log.data.symptoms.map((symptom: string, j: number) => (
                        <Badge key={j} variant="outline">{symptom}</Badge>
                      ))}
                    </div>
                    {log.data.analysis && (
                      <div className="mt-2">
                        <p className="font-medium">Analysis Results:</p>
                        <div className="text-sm text-muted-foreground mt-1">
                          {log.data.analysis.conditions.map((condition: any) => (
                            <p key={condition.name}>
                              {condition.name} - {Math.round(condition.confidence * 100)}% confidence
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showClearHistoryDialog} onOpenChange={setShowClearHistoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Symptom History</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete your entire symptom check history. This data is used to track your health patterns over time and removing it may affect future analyses. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clearHistory.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {clearHistory.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Clear History"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}