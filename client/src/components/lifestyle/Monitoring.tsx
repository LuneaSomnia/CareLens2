import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Utensils, Heart, Moon } from "lucide-react";

type LifestyleLog = {
  date: string;
  diet: {
    meals: string[];
    calories: number;
    water: number;
  };
  activity: {
    steps: number;
    exercise: {
      type: string;
      duration: number;
    }[];
  };
  sleep: {
    hours: number;
    quality: number;
  };
  stress: number;
};

const defaultLifestyleLog: LifestyleLog = {
  date: new Date().toISOString().split('T')[0],
  diet: {
    meals: [],
    calories: 0,
    water: 0
  },
  activity: {
    steps: 0,
    exercise: []
  },
  sleep: {
    hours: 0,
    quality: 0
  },
  stress: 0
};

export default function Monitoring() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMeal, setCurrentMeal] = useState("");

  const { data: lifestyleLog, isLoading } = useQuery<LifestyleLog>({
    queryKey: ["/api/lifestyle", selectedDate],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/lifestyle?date=${selectedDate}`);
      const data = await response.json();
      return data || defaultLifestyleLog;
    }
  });

  const logLifestyle = useMutation({
    mutationFn: async (data: Partial<LifestyleLog>) => {
      const res = await apiRequest("POST", "/api/lifestyle", {
        ...data,
        date: selectedDate
      });
      return res.json();
    }
  });

  const addMeal = () => {
    if (!currentMeal.trim() || !lifestyleLog) return;

    logLifestyle.mutate({
      diet: {
        ...lifestyleLog.diet,
        meals: [...lifestyleLog.diet.meals, currentMeal.trim()]
      }
    });

    setCurrentMeal("");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!lifestyleLog) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-auto"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Diet Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={currentMeal}
                  onChange={(e) => setCurrentMeal(e.target.value)}
                  placeholder="Add food item..."
                />
                <Button onClick={addMeal}>Add</Button>
              </div>

              <div className="space-y-2">
                {lifestyleLog.diet.meals.map((meal, i) => (
                  <Badge key={i} variant="secondary">{meal}</Badge>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Water Intake</span>
                  <span>{lifestyleLog.diet.water}L / 2.5L</span>
                </div>
                <Progress value={(lifestyleLog.diet.water / 2.5) * 100} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Activity Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Daily Steps</span>
                <span className="text-2xl font-bold">
                  {lifestyleLog.activity.steps.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Exercise Log</h4>
                {lifestyleLog.activity.exercise.map((exercise, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{exercise.type}</span>
                    <span>{exercise.duration} mins</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Sleep & Stress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sleep Duration</span>
                  <span>{lifestyleLog.sleep.hours} hours</span>
                </div>
                <Progress value={(lifestyleLog.sleep.hours / 9) * 100} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sleep Quality</span>
                  <span>{lifestyleLog.sleep.quality}/10</span>
                </div>
                <Progress value={lifestyleLog.sleep.quality * 10} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Stress Level</span>
                  <span>{lifestyleLog.stress}/10</span>
                </div>
                <Progress value={lifestyleLog.stress * 10} className={lifestyleLog.stress > 7 ? "bg-destructive" : ""} />
              </div>

              {lifestyleLog.stress > 7 && (
                <Alert>
                  <AlertDescription>
                    Your stress levels are high. Consider taking a break or trying some relaxation techniques.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}