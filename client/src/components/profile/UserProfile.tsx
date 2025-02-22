import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userProfileSchema, type UserProfile } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Plus, X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function UserProfile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [currentMedicalHistory, setCurrentMedicalHistory] = useState("");
  const [currentFamilyHistory, setCurrentFamilyHistory] = useState("");
  const [currentDiet, setCurrentDiet] = useState("");
  const [currentEmergencyContact, setCurrentEmergencyContact] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
  });

  const form = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: profile || {
      fullName: "",
      dateOfBirth: new Date().toISOString().split('T')[0],
      gender: "",
      email: "",
      phone: "",
      address: "",
      bloodType: "",
      medicalHistory: [],
      familyHistory: [],
      lifestyle: {
        smoking: false,
        alcohol: false,
        diet: [],
        exercise: {
          type: "",
          frequency: "",
          duration: ""
        }
      },
      emergencyContacts: [],
      organDonor: false,
      dataSharing: false
    }
  });

  const updateProfile = useMutation({
    mutationFn: async (data: UserProfile) => {
      const res = await apiRequest("POST", "/api/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your health profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const addMedicalHistory = () => {
    if (!currentMedicalHistory.trim()) return;
    const current = form.getValues("medicalHistory");
    form.setValue("medicalHistory", [...current, currentMedicalHistory.trim()]);
    setCurrentMedicalHistory("");
  };

  const addFamilyHistory = () => {
    if (!currentFamilyHistory.trim()) return;
    const current = form.getValues("familyHistory");
    form.setValue("familyHistory", [...current, currentFamilyHistory.trim()]);
    setCurrentFamilyHistory("");
  };

  const addDiet = () => {
    if (!currentDiet.trim()) return;
    const current = form.getValues("lifestyle.diet");
    form.setValue("lifestyle.diet", [...current, currentDiet.trim()]);
    setCurrentDiet("");
  };

  const addEmergencyContact = () => {
    if (!currentEmergencyContact.name || !currentEmergencyContact.email || !currentEmergencyContact.phone) return;
    const current = form.getValues("emergencyContacts");
    form.setValue("emergencyContacts", [...current, { ...currentEmergencyContact }]);
    setCurrentEmergencyContact({ name: "", email: "", phone: "" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Health Profile</span>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => updateProfile.mutate(data))}
                  className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Basic Information</h3>

                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select 
                          disabled={!isEditing} 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Health Background */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Health Background</h3>

                  <FormField
                    control={form.control}
                    name="bloodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Type</FormLabel>
                        <Select 
                          disabled={!isEditing} 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Medical History</FormLabel>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Input
                          value={currentMedicalHistory}
                          onChange={(e) => setCurrentMedicalHistory(e.target.value)}
                          placeholder="Add medical condition"
                        />
                        <Button type="button" onClick={addMedicalHistory}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {form.watch("medicalHistory").map((condition, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {condition}
                          {isEditing && (
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => {
                                const current = form.getValues("medicalHistory");
                                form.setValue(
                                  "medicalHistory",
                                  current.filter((_, i) => i !== index)
                                );
                              }}
                            />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Family History</FormLabel>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Input
                          value={currentFamilyHistory}
                          onChange={(e) => setCurrentFamilyHistory(e.target.value)}
                          placeholder="Add family condition"
                        />
                        <Button type="button" onClick={addFamilyHistory}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {form.watch("familyHistory").map((condition, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {condition}
                          {isEditing && (
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => {
                                const current = form.getValues("familyHistory");
                                form.setValue(
                                  "familyHistory",
                                  current.filter((_, i) => i !== index)
                                );
                              }}
                            />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lifestyle Information */}
                <div className="space-y-4 col-span-2">
                  <h3 className="font-semibold">Lifestyle Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="lifestyle.smoking"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Smoking</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              disabled={!isEditing}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lifestyle.alcohol"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Alcohol Consumption</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              disabled={!isEditing}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Dietary Preferences</FormLabel>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Input
                          value={currentDiet}
                          onChange={(e) => setCurrentDiet(e.target.value)}
                          placeholder="Add dietary preference"
                        />
                        <Button type="button" onClick={addDiet}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {form.watch("lifestyle.diet").map((diet, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {diet}
                          {isEditing && (
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => {
                                const current = form.getValues("lifestyle.diet");
                                form.setValue(
                                  "lifestyle.diet",
                                  current.filter((_, i) => i !== index)
                                );
                              }}
                            />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="lifestyle.exercise.type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exercise Type</FormLabel>
                          <Select 
                            disabled={!isEditing} 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cardio">Cardio</SelectItem>
                              <SelectItem value="strength">Strength Training</SelectItem>
                              <SelectItem value="yoga">Yoga</SelectItem>
                              <SelectItem value="sports">Sports</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lifestyle.exercise.frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exercise Frequency</FormLabel>
                          <Select 
                            disabled={!isEditing} 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">2-3 times a week</SelectItem>
                              <SelectItem value="occasionally">Occasionally</SelectItem>
                              <SelectItem value="rarely">Rarely</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lifestyle.exercise.duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exercise Duration</FormLabel>
                          <Select 
                            disabled={!isEditing} 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="15min">15 minutes</SelectItem>
                              <SelectItem value="30min">30 minutes</SelectItem>
                              <SelectItem value="45min">45 minutes</SelectItem>
                              <SelectItem value="60min">60+ minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Emergency Information */}
                <div className="space-y-4 col-span-2">
                  <h3 className="font-semibold">Emergency Information</h3>

                  <div className="space-y-4">
                    <FormLabel>Emergency Contacts</FormLabel>
                    {isEditing && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input
                          value={currentEmergencyContact.name}
                          onChange={(e) => setCurrentEmergencyContact(prev => ({
                            ...prev,
                            name: e.target.value
                          }))}
                          placeholder="Contact name"
                        />
                        <Input
                          type="email"
                          value={currentEmergencyContact.email}
                          onChange={(e) => setCurrentEmergencyContact(prev => ({
                            ...prev,
                            email: e.target.value
                          }))}
                          placeholder="Contact email"
                        />
                        <div className="flex gap-2">
                          <Input
                            value={currentEmergencyContact.phone}
                            onChange={(e) => setCurrentEmergencyContact(prev => ({
                              ...prev,
                              phone: e.target.value
                            }))}
                            placeholder="Contact phone"
                          />
                          <Button type="button" onClick={addEmergencyContact}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      {form.watch("emergencyContacts").map((contact, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">{contact.email}</p>
                            <p className="text-sm text-muted-foreground">{contact.phone}</p>
                          </div>
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const current = form.getValues("emergencyContacts");
                                form.setValue(
                                  "emergencyContacts",
                                  current.filter((_, i) => i !== index)
                                );
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="organDonor"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Organ Donor Status</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            disabled={!isEditing}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Privacy and Security */}
                <div className="space-y-4 col-span-2">
                  <h3 className="font-semibold">Privacy and Security</h3>

                  <FormField
                    control={form.control}
                    name="dataSharing"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Data Sharing Preferences</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            disabled={!isEditing}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-4">
                  <Button
                    type="submit"
                    disabled={updateProfile.isPending}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}