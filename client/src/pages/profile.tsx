import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { User, Star, Phone, Mail, Calendar, Award } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    profilePicture: user?.profilePicture || "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<typeof formData>) => {
      if (!user) throw new Error("No user found");
      return apiRequest(`/api/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For demo purposes, we'll use a placeholder URL
      // In a real app, you'd upload to a file storage service
      const mockUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&size=200&background=8B5CF6&color=fff`;
      setFormData(prev => ({ ...prev, profilePicture: mockUrl }));
      updateProfileMutation.mutate({ profilePicture: mockUrl });
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
          ({rating}/5)
        </span>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medicate-light to-medicate-primary flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage 
                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=200&background=8B5CF6&color=fff`} 
                    alt={user.name} 
                  />
                  <AvatarFallback className="text-2xl bg-medicate-light text-white">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {user.name}
                  </h1>
                  <Badge variant={user.role === "doctor" ? "default" : "secondary"} className="capitalize">
                    {user.role}
                  </Badge>
                  
                  {user.role === "doctor" && user.rating && (
                    <div className="flex justify-center">
                      {renderRating(user.rating)}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-medicate-primary" />
                  <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                </div>
                
                {user.phone && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="h-4 w-4 text-medicate-primary" />
                    <span className="text-gray-600 dark:text-gray-400">{user.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="h-4 w-4 text-medicate-primary" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {user.role === "doctor" && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    {user.specialty && (
                      <div className="flex items-center space-x-3 text-sm">
                        <Award className="h-4 w-4 text-medicate-primary" />
                        <span className="text-gray-600 dark:text-gray-400">{user.specialty}</span>
                      </div>
                    )}
                    
                    {user.license && (
                      <div className="flex items-center space-x-3 text-sm">
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                          License: {user.license}
                        </span>
                      </div>
                    )}
                    
                    {user.experience && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {user.experience} years of experience
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profilePicture">Profile Picture</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <Avatar className="h-16 w-16">
                        <AvatarImage 
                          src={formData.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=200&background=8B5CF6&color=fff`} 
                          alt="Profile" 
                        />
                        <AvatarFallback className="bg-medicate-light text-white">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Input
                          id="profilePicture"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="max-w-xs"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Upload a new profile picture
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  className="w-full bg-medicate-primary hover:bg-medicate-dark"
                >
                  {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}