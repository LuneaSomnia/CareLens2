import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type RiskAssessment = {
  riskFactors: Array<{
    condition: string;
    risk: number;
    factors: string[];
    recommendations: string[];
  }>;
  overallHealth: {
    score: number;
    summary: string;
  };
};

export default function RiskAssessment() {
  const { user } = useAuth();

  const assessRisks = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/risks/assess", {});
      return res.json() as Promise<RiskAssessment>;
    }
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Health Risk Assessment</span>
            <Button
              onClick={() => assessRisks.mutate()}
              disabled={assessRisks.isPending}
            >
              {assessRisks.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Update Assessment"
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assessRisks.data && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Overall Health Score</h3>
                <Progress value={assessRisks.data.overallHealth.score} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {assessRisks.data.overallHealth.summary}
                </p>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {assessRisks.data.riskFactors.map((risk) => (
                    <Card key={risk.condition}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">{risk.condition}</h4>
                          <div className="flex items-center">
                            <Progress
                              value={risk.risk}
                              className="w-24 h-2 mr-2"
                              indicatorClassName={
                                risk.risk > 70 ? "bg-destructive" :
                                risk.risk > 40 ? "bg-orange-500" :
                                "bg-green-500"
                              }
                            />
                            <span className="text-sm">
                              {risk.risk}% risk
                            </span>
                          </div>
                        </div>

                        {risk.risk > 70 && (
                          <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              High risk detected. Please consult a healthcare provider.
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Contributing Factors:</h5>
                          <ul className="list-disc pl-5 text-sm space-y-1">
                            {risk.factors.map((factor, i) => (
                              <li key={i}>{factor}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-4 space-y-2">
                          <h5 className="text-sm font-medium">Recommendations:</h5>
                          <ul className="list-disc pl-5 text-sm space-y-1">
                            {risk.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
