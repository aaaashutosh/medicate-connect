import { useState, useCallback } from "react";
import { useLocation } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Star, Phone, MessageCircle, Video, Search, MapPin, Award, Clock } from "lucide-react";
import AppointmentModal from "@/components/appointment-modal";
import ChatModal from "@/components/chat-modal";
import type { User } from "@shared/schema";

const specialties = [
  "all",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Orthopedic",
  "Neurologist",
  "Psychiatrist",
  "General Practitioner",
  "Surgeon",
  "Ophthalmologist",
  "Gynecologist",
  "Dentist",
  "Radiologist",
  "Endocrinologist",
  "Urologist",
  "Oncologist",
  "Pulmonologist",
  "Nephrologist",
  "Hematologist",
  "Rheumatologist",
  "Allergist",
  "Infectious Disease Specialist",
  "Emergency Medicine",
  "Family Medicine",
  "Internal Medicine",
  "Pathologist",
  "Anesthesiologist",
  "Sports Medicine",
  "Plastic Surgeon",
  "Obstetrician",
  "Cardiothoracic Surgeon",
  "Vascular Surgeon",
];

export default function DoctorsPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: doctors = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/doctors", selectedSpecialty],
    queryFn: async () => {
      const params = selectedSpecialty !== "all" ? `?specialty=${selectedSpecialty}` : "";
      const response = await fetch(`/api/doctors${params}`);
      if (!response.ok) throw new Error("Failed to fetch doctors");
      return response.json();
    },
  });

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doctor.specialty && doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  /**
   * REVOLUTION: Simplified action for in-app video/audio call initiation.
   * This should trigger navigation to the messages page with the doctor pre-selected,
   * and possibly a flag to initiate a call, similar to how the messages page is set up.
   * For now, it shows a toast, expecting the navigation logic to be implemented later.
   */
  const handleInitiateVideoCall = useCallback((doctor: User) => {
    // In a full implementation, this would navigate to the MessagesPage with doctor ID and a 'call' flag:
    // router.push(`/messages?doctor=${doctor.id}&action=video-call`); 
    
    toast({
      title: "Initiating Video Call...",
      description: `Attempting to start a video call with Dr. ${doctor.name}. You will be redirected to the chat window.`,
      variant: "default",
    });
  }, [toast]);

  const renderRating = (rating: number | undefined) => {
    if (typeof rating !== 'number') return null;
    const roundedRating = Math.round(rating);
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= roundedRating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
          ({rating.toFixed(1)}/5)
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Find Your Doctor
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Connect with qualified healthcare professionals
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search doctors by name or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus-visible:ring-purple-500"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="focus:ring-purple-500">
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty === "all" ? "All Specialties" : specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Doctors Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 flex-shrink-0">
                      <AvatarImage 
                        src={doctor.profilePicture} 
                        alt={doctor.name} 
                      />
                      <AvatarFallback className="bg-purple-600 text-white text-lg">
                        {doctor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg text-gray-900 dark:text-gray-100 truncate">
                        {doctor.name}
                      </CardTitle>
                      {doctor.specialty && (
                        <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 hover:bg-purple-200">
                          {doctor.specialty}
                        </Badge>
                      )}
                    </div>

                    {/* Online/Available Status */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        doctor.isAvailable ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className={`text-xs mt-1 ${
                        doctor.isAvailable ? 'text-green-600' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {doctor.isAvailable ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Rating */}
                  {renderRating(doctor.rating) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Patient Rating</span>
                      {renderRating(doctor.rating)}
                    </div>
                  )}

                  {/* Experience */}
                  {doctor.experience && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Award className="h-4 w-4 text-purple-500" />
                      <span>{doctor.experience} years experience</span>
                    </div>
                  )}

                  {/* License */}
                  {doctor.license && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span className="text-gray-600 dark:text-gray-400">License: {doctor.license}</span>
                    </div>
                  )}

                  {/* Action Buttons (REVOLUTIONIZED) */}
                  <div className="flex space-x-2 pt-4">
                    <AppointmentModal
                      doctor={doctor}
                      trigger={
                        <Button
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                          size="sm"
                        >
                          Book Appointment
                        </Button>
                      }
                    />
                    
                    {/* Chat Button (uses ChatModal) */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white dark:border-purple-500 dark:text-purple-500 dark:hover:bg-purple-600 dark:hover:text-white transition-colors flex items-center gap-1"
                      title="Open DM"
                      onClick={() => navigate(`/messages?doctor=${doctor.id}`)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>DM</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredDoctors.length === 0 && (
          <Card className="text-center py-12 dark:bg-gray-800">
            <CardContent>
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <MapPin className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No doctors found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search criteria or specialty filter.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}