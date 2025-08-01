import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  FileText, 
  AlertTriangle, 
  Video, 
  Upload, 
  Heart, 
  Stethoscope,
  Pill,
  Bell,
  Star,
  CalendarDays,
  TrendingUp
} from "lucide-react";
import ChatModal from "@/components/chat-modal";
import PrescriptionModal from "@/components/prescription-modal";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [userRole, setUserRole] = useState<"patient" | "doctor">("patient");
  const [showChat, setShowChat] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/login");
    } else {
      setUserRole(user.role);
    }
  }, [user, setLocation]);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats", user?.id, "role", userRole],
    enabled: !!user,
  });

  // Fetch appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments", userRole, user?.id],
    enabled: !!user,
  });

  // Fetch notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/notifications", user?.id],
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  const PatientDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card className="card-hover">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-medicate-light dark:bg-medicate-dark rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-medicate-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back, {user.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">Patient ID: {user.id.slice(0, 8)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {statsLoading ? "..." : (stats as any)?.upcomingAppointments || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <Pill className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {statsLoading ? "..." : (stats as any)?.activePrescriptions || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Prescriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-medicate-light dark:bg-medicate-dark rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-medicate-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {statsLoading ? "..." : (stats as any)?.healthReports || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Health Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {statsLoading ? "..." : (stats as any)?.alerts || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Health Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Appointments & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  className="btn-primary p-4 h-auto justify-start text-left"
                  onClick={() => setShowChat(true)}
                >
                  <Video className="h-5 w-5 mr-3" />
                  Book Consultation
                </Button>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto justify-start text-left border-2 border-medicate-primary text-medicate-primary hover:bg-medicate-light dark:hover:bg-medicate-dark"
                >
                  <Upload className="h-5 w-5 mr-3" />
                  Upload Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Appointments */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Appointments</h3>
              <div className="space-y-4">
                {appointmentsLoading ? (
                  <p className="text-gray-500 dark:text-gray-400">Loading appointments...</p>
                ) : appointments && Array.isArray(appointments) && appointments.length > 0 ? (
                  appointments.slice(0, 3).map((appointment: any) => (
                    <div key={appointment.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="w-12 h-12 bg-medicate-primary rounded-full flex items-center justify-center">
                        <Stethoscope className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Dr. Sarah Johnson</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.reason}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(appointment.date).toLocaleDateString()} at {new Date(appointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      <Badge variant={appointment.status === "completed" ? "default" : "secondary"}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No appointments found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Notifications</h3>
              <div className="space-y-3">
                {notificationsLoading ? (
                  <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
                ) : notifications && notifications.length > 0 ? (
                  notifications.slice(0, 3).map((notification: any) => (
                    <div key={notification.id} className="flex items-start space-x-3 p-3 bg-medicate-light dark:bg-medicate-dark rounded-lg">
                      <Bell className="h-4 w-4 text-medicate-primary mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{notification.message}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Health Tips */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">AI Health Tips</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-medicate-light to-purple-50 dark:from-medicate-dark dark:to-purple-900 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Hydration Reminder</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Based on your activity, drink 2 more glasses of water today.</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Exercise Goal</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">You're 500 steps away from your daily goal. Keep going!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const DoctorDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card className="card-hover">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-medicate-light dark:bg-medicate-dark rounded-full flex items-center justify-center">
              <Stethoscope className="h-8 w-8 text-medicate-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{user.specialty}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">License: {user.license}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {statsLoading ? "..." : stats?.todayAppointments || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today's Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {statsLoading ? "..." : stats?.totalPatients || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-medicate-light dark:bg-medicate-dark rounded-xl flex items-center justify-center">
                <Pill className="h-6 w-6 text-medicate-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {statsLoading ? "..." : stats?.prescriptionsThisWeek || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Prescriptions This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {statsLoading ? "..." : stats?.rating || "N/A"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Patient Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Today's Schedule & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Today's Schedule</h3>
                <Button variant="ghost" className="text-medicate-primary">View All</Button>
              </div>
              <div className="space-y-4">
                {appointmentsLoading ? (
                  <p className="text-gray-500 dark:text-gray-400">Loading schedule...</p>
                ) : appointments && appointments.length > 0 ? (
                  appointments.slice(0, 3).map((appointment: any) => (
                    <div key={appointment.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {new Date(appointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{appointment.duration} min</p>
                      </div>
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <Heart className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Patient #{appointment.patientId.slice(0, 8)}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.reason}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="btn-primary"
                          onClick={() => setShowChat(true)}
                        >
                          Start
                        </Button>
                        <Button size="sm" variant="outline">
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No appointments scheduled for today</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Button 
                  className="btn-primary p-4 h-auto justify-start text-left"
                  onClick={() => setShowPrescription(true)}
                >
                  <Pill className="h-5 w-5 mr-3" />
                  New Pill
                </Button>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto justify-start text-left border-2 border-medicate-primary text-medicate-primary hover:bg-medicate-light dark:hover:bg-medicate-dark"
                >
                  <FileText className="h-5 w-5 mr-3" />
                  Patient Records
                </Button>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto justify-start text-left border-2 border-medicate-primary text-medicate-primary hover:bg-medicate-light dark:hover:bg-medicate-dark"
                >
                  <TrendingUp className="h-5 w-5 mr-3" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Urgent Notifications */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Urgent Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Critical Lab Results</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Patient requires immediate attention</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">30 minutes ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Prescriptions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Prescriptions</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Patient #12345</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Lisinopril 10mg - Daily</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">2 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Header */}
      <div className="py-8 bg-white dark:bg-card border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Role:</span>
              <Select value={userRole} onValueChange={(value) => setUserRole(value as "patient" | "doctor")}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {userRole === "patient" ? <PatientDashboard /> : <DoctorDashboard />}
        </div>
      </div>

      {/* Modals */}
      <ChatModal 
        isOpen={showChat} 
        onClose={() => setShowChat(false)}
        doctorName="Dr. Sarah Johnson"
        status="online"
      />
      <PrescriptionModal 
        isOpen={showPrescription} 
        onClose={() => setShowPrescription(false)}
        userRole={userRole}
      />
    </div>
  );
}
