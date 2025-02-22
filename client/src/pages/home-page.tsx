import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserProfile from "@/components/profile/UserProfile";
import SymptomChecker from "@/components/symptoms/SymptomChecker";
import RiskAssessment from "@/components/risk/RiskAssessment";
import Resources from "@/components/education/Resources";
import Monitoring from "@/components/lifestyle/Monitoring";
import { LogOut, Heart } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">CareLens</h1>
          </div>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="w-full justify-start border-b pb-px overflow-x-auto">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="symptoms">Symptom Checker</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="resources">Educational Resources</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <UserProfile />
          </TabsContent>

          <TabsContent value="symptoms" className="mt-6">
            <SymptomChecker />
          </TabsContent>

          <TabsContent value="risk" className="mt-6">
            <RiskAssessment />
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Resources />
          </TabsContent>

          <TabsContent value="lifestyle" className="mt-6">
            <Monitoring />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}