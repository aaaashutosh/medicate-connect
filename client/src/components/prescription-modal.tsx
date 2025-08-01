import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  Download, 
  Bot, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  CheckCheck,
  Save
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { Prescription } from "@shared/schema";

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: "patient" | "doctor";
  patientId?: string;
}

export default function PrescriptionModal({ isOpen, onClose, userRole, patientId }: PrescriptionModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: patientId || "",
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: ""
  });

  // Fetch prescriptions based on user role
  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ["/api/prescriptions", userRole, user?.id],
    enabled: !!user && isOpen,
  });

  // Create prescription mutation (for doctors)
  const createPrescriptionMutation = useMutation({
    mutationFn: async (prescriptionData: any) => {
      const response = await apiRequest("POST", "/api/prescriptions", {
        ...prescriptionData,
        doctorId: user?.id,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions", "doctor", user?.id] });
      toast({
        title: "Prescription created",
        description: "Prescription has been sent to the patient.",
      });
      setPrescriptionForm({
        patientId: "",
        medication: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: ""
      });
    },
    onError: () => {
      toast({
        title: "Failed to create prescription",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update prescription status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/prescriptions/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions", userRole, user?.id] });
      toast({
        title: "Prescription updated",
        description: "Status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update prescription",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitPrescription = () => {
    if (!prescriptionForm.medication || !prescriptionForm.dosage || !prescriptionForm.frequency) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createPrescriptionMutation.mutate(prescriptionForm);
  };

  const handleRequestRefill = (prescriptionId: string) => {
    updateStatusMutation.mutate({ id: prescriptionId, status: "refill_due" });
  };

  const handleMarkCompleted = (prescriptionId: string) => {
    updateStatusMutation.mutate({ id: prescriptionId, status: "completed" });
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "refill_due":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Refill Due</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const DoctorView = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Prescription Form */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create New Prescription</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="patient">Patient ID</Label>
              <Input
                id="patient"
                placeholder="Enter patient ID..."
                value={prescriptionForm.patientId}
                onChange={(e) => setPrescriptionForm({...prescriptionForm, patientId: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="medication">Medication Name *</Label>
              <Input
                id="medication"
                placeholder="Search medication..."
                value={prescriptionForm.medication}
                onChange={(e) => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dosage">Dosage *</Label>
                <Input
                  id="dosage"
                  placeholder="e.g., 10mg"
                  value={prescriptionForm.dosage}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency *</Label>
                <Select value={prescriptionForm.frequency} onValueChange={(value) => setPrescriptionForm({...prescriptionForm, frequency: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Once daily">Once daily</SelectItem>
                    <SelectItem value="Twice daily">Twice daily</SelectItem>
                    <SelectItem value="Three times daily">Three times daily</SelectItem>
                    <SelectItem value="As needed">As needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                placeholder="e.g., 30 days"
                value={prescriptionForm.duration}
                onChange={(e) => setPrescriptionForm({...prescriptionForm, duration: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                rows={3}
                placeholder="Special instructions for the patient..."
                value={prescriptionForm.instructions}
                onChange={(e) => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
              />
            </div>
            
            <div className="flex space-x-4">
              <Button 
                onClick={handleSubmitPrescription}
                disabled={createPrescriptionMutation.isPending}
                className="flex-1 btn-primary"
              >
                {createPrescriptionMutation.isPending ? "Sending..." : "Send Prescription"}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => toast({ title: "Draft saved", description: "Prescription saved as draft." })}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
        
        {/* AI Suggestions */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Suggestions</h3>
          
          <Card className="bg-medicate-light dark:bg-medicate-dark">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Bot className="h-5 w-5 text-medicate-primary" />
                <span className="font-medium text-medicate-dark dark:text-medicate-secondary">Drug Interaction Check</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">No major interactions found with current medications.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="font-medium text-yellow-800 dark:text-yellow-300">Dosage Recommendation</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Consider starting with 5mg for elderly patients. Current selection: 10mg.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-300">Alternative Options</span>
              </div>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>• Generic equivalent available (80% cost reduction)</p>
                <p>• Similar efficacy: Amlodipine 5mg</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const PatientView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Prescriptions</h3>
        <Button 
          variant="outline"
          className="border-medicate-primary text-medicate-primary hover:bg-medicate-light dark:hover:bg-medicate-dark"
          onClick={() => toast({ title: "Download", description: "Downloading all prescriptions..." })}
        >
          <Download className="h-4 w-4 mr-2" />
          Download All
        </Button>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Loading prescriptions...</div>
        ) : prescriptions && Array.isArray(prescriptions) && prescriptions.length > 0 ? (
          prescriptions.map((prescription: Prescription) => {
            const startDate = prescription.startDate || new Date();
            const progress = prescription.endDate ? calculateProgress(startDate.toString(), prescription.endDate.toString()) : 0;
            const daysRemaining = prescription.endDate ? getDaysRemaining(prescription.endDate.toString()) : 0;
            
            return (
              <Card key={prescription.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {prescription.medication} {prescription.dosage}
                        </h4>
                        {getStatusBadge(prescription.status)}
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Prescribed by</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Dr. {prescription.doctorId.slice(0, 8)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Frequency</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{prescription.frequency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{prescription.duration}</p>
                        </div>
                      </div>
                      
                      {prescription.instructions && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Instructions</p>
                          <p className="text-gray-700 dark:text-gray-300">{prescription.instructions}</p>
                        </div>
                      )}
                      
                      {prescription.endDate && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{Math.round(progress)}% complete • {daysRemaining} days remaining</span>
                          </div>
                          <Progress value={progress} className="w-full" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {prescription.status === "active" && (
                        <>
                          <Button 
                            size="sm"
                            className="btn-primary"
                            onClick={() => handleRequestRefill(prescription.id)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Request Refill
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => toast({ title: "Download", description: "Downloading prescription PDF..." })}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download PDF
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                            onClick={() => handleMarkCompleted(prescription.id)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <CheckCheck className="h-4 w-4 mr-1" />
                            Mark Completed
                          </Button>
                        </>
                      )}
                      {prescription.status === "refill_due" && (
                        <Button 
                          size="sm"
                          className="btn-primary"
                          onClick={() => handleRequestRefill(prescription.id)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Request Refill
                        </Button>
                      )}
                      {prescription.status !== "active" && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => toast({ title: "Download", description: "Downloading prescription PDF..." })}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download PDF
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>No prescriptions found.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Prescription Management
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        <div className="mt-6">
          {userRole === "doctor" ? <DoctorView /> : <PatientView />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
