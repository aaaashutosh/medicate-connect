import { useState } from "react";
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
import type { User } from "@shared/schema";

const specialties = [
  "all",
  "Cardiologist",
  "Dermatologist", 
  "Pediatrician",
  "Orthopedic",
  "Neurologist",
  "Psychiatrist",
  "Gynecologist",
  "Oncologist",
];

export default function DoctorsPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ["/api/doctors", selectedSpecialty],
    queryFn: async () => {
      const params = selectedSpecialty !== "all" ? `?specialty=${selectedSpecialty}` : "";
      const response = await fetch(`/api/doctors${params}`);
      if (!response.ok) throw new Error("Failed to fetch doctors");
      return response.json() as Promise<User[]>;
    },
  });

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doctor.specialty && doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBookAppointment = (doctor: User) => {
    toast({
      title: "Appointment Booking",
      description: `Booking appointment with ${doctor.name}. This feature will be available soon.`,
    });
  };

  const handleMessage = (doctor: User) => {
    toast({
      title: "Message Doctor",
      description: `Opening chat with ${doctor.name}. This feature will be available soon.`,
    });
  };

  const handleCall = (doctor: User) => {
    if (doctor.phone) {
      window.open(`tel:${doctor.phone}`, '_blank');
    } else {
      toast({
        title: "Call Unavailable",
        description: "Phone number not available for this doctor.",
        variant: "destructive",
      });
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
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
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
              <Card key={i} className="animate-pulse">
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
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage 
                        src={doctor.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&size=200&background=8B5CF6&color=fff`} 
                        alt={doctor.name} 
                      />
                      <AvatarFallback className="bg-medicate-light text-white text-lg">
                        {doctor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                        {doctor.name}
                      </CardTitle>
                      {doctor.specialty && (
                        <Badge variant="secondary" className="mt-1">
                          {doctor.specialty}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-col items-end">
                      <div className={`w-3 h-3 rounded-full ${
                        doctor.isAvailable ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {doctor.isAvailable ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Rating */}
                  {doctor.rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Rating</span>
                      {renderRating(doctor.rating)}
                    </div>
                  )}

                  {/* Experience */}
                  {doctor.experience && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{doctor.experience} years experience</span>
                    </div>
                  )}

                  {/* License */}
                  {doctor.license && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Award className="h-4 w-4 text-medicate-primary" />
                      <span className="text-gray-600 dark:text-gray-400">License: {doctor.license}</span>
                    </div>
                  )}

                  {/* Contact Info */}
                  {doctor.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4" />
                      <span>{doctor.phone}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4">
                    <Button
                      onClick={() => handleBookAppointment(doctor)}
                      className="flex-1 bg-medicate-primary hover:bg-medicate-dark text-white"
                      size="sm"
                    >
                      Book Appointment
                    </Button>
                    
                    <Button
                      onClick={() => handleMessage(doctor)}
                      variant="outline"
                      size="sm"
                      className="border-medicate-primary text-medicate-primary hover:bg-medicate-primary hover:text-white"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    
                    {doctor.phone && (
                      <Button
                        onClick={() => handleCall(doctor)}
                        variant="outline"
                        size="sm"
                        className="border-medicate-primary text-medicate-primary hover:bg-medicate-primary hover:text-white"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredDoctors.length === 0 && (
          <Card className="text-center py-12">
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