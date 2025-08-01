import { 
  type User, 
  type InsertUser, 
  type Appointment, 
  type InsertAppointment,
  type Prescription,
  type InsertPrescription,
  type Message,
  type InsertMessage,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Appointments
  getAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined>;
  
  // Prescriptions
  getPrescriptionsByPatient(patientId: string): Promise<Prescription[]>;
  getPrescriptionsByDoctor(doctorId: string): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescriptionStatus(id: string, status: string): Promise<Prescription | undefined>;
  
  // Messages
  getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<Message | undefined>;
  
  // Notifications
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  
  // Dashboard stats
  getDashboardStats(userId: string, role: string): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private appointments: Map<string, Appointment>;
  private prescriptions: Map<string, Prescription>;
  private messages: Map<string, Message>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.users = new Map();
    this.appointments = new Map();
    this.prescriptions = new Map();
    this.messages = new Map();
    this.notifications = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample patient
    const patient = this.createUserSync({
      email: "patient@medicate.com",
      password: "password123",
      role: "patient" as const,
      name: "John Doe",
      phone: "+1-234-567-8900",
    });

    // Sample doctor
    const doctor = this.createUserSync({
      email: "doctor@medicate.com",
      password: "password123",
      role: "doctor" as const,
      name: "Dr. Sarah Johnson",
      phone: "+1-234-567-8901",
      specialty: "Cardiologist",
      license: "MD-98765",
    });

    // Sample appointment
    const appointment = this.createAppointmentSync({
      patientId: patient.id,
      doctorId: doctor.id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 30,
      reason: "Annual Checkup",
      status: "scheduled" as const,
    });

    // Sample prescription
    this.createPrescriptionSync({
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentId: appointment.id,
      medication: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      duration: "30 days",
      instructions: "Take with food. Monitor blood pressure weekly.",
      status: "active" as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Sample notification
    this.createNotificationSync({
      userId: patient.id,
      title: "Prescription Refill Reminder",
      message: "Your blood pressure medication needs refill",
      type: "prescription" as const,
    });
  }

  private createUserSync(insertUser: InsertUser): User {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      specialty: insertUser.specialty || null,
      license: insertUser.license || null,
      phone: insertUser.phone || null,
    };
    this.users.set(id, user);
    return user;
  }

  private createAppointmentSync(insertAppointment: InsertAppointment): Appointment {
    const id = randomUUID();
    const appointment: Appointment = { 
      ...insertAppointment,
      duration: insertAppointment.duration || 30,
      status: insertAppointment.status || "scheduled" as const,
      id, 
      createdAt: new Date(),
      notes: insertAppointment.notes || null,
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  private createPrescriptionSync(insertPrescription: InsertPrescription): Prescription {
    const id = randomUUID();
    const prescription: Prescription = { 
      ...insertPrescription,
      status: insertPrescription.status || "active" as const,
      id, 
      createdAt: new Date(),
      appointmentId: insertPrescription.appointmentId || null,
      instructions: insertPrescription.instructions || null,
      endDate: insertPrescription.endDate || null,
    };
    this.prescriptions.set(id, prescription);
    return prescription;
  }

  private createNotificationSync(insertNotification: InsertNotification): Notification {
    const id = randomUUID();
    const notification: Notification = { 
      ...insertNotification,
      isRead: insertNotification.isRead || false,
      id, 
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return this.createUserSync(insertUser);
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.patientId === patientId
    );
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.doctorId === doctorId
    );
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    return this.createAppointmentSync(insertAppointment);
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (appointment) {
      appointment.status = status as any;
      this.appointments.set(id, appointment);
    }
    return appointment;
  }

  async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values()).filter(
      prescription => prescription.patientId === patientId
    );
  }

  async getPrescriptionsByDoctor(doctorId: string): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values()).filter(
      prescription => prescription.doctorId === doctorId
    );
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    return this.createPrescriptionSync(insertPrescription);
  }

  async updatePrescriptionStatus(id: string, status: string): Promise<Prescription | undefined> {
    const prescription = this.prescriptions.get(id);
    if (prescription) {
      prescription.status = status as any;
      this.prescriptions.set(id, prescription);
    }
    return prescription;
  }

  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      message => 
        (message.senderId === userId1 && message.receiverId === userId2) ||
        (message.senderId === userId2 && message.receiverId === userId1)
    ).sort((a, b) => (a.createdAt || new Date()).getTime() - (b.createdAt || new Date()).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage,
      messageType: insertMessage.messageType || "text" as const,
      isRead: insertMessage.isRead || false,
      id, 
      createdAt: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: string): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (message) {
      message.isRead = true;
      this.messages.set(id, message);
    }
    return message;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      notification => notification.userId === userId
    ).sort((a, b) => (b.createdAt || new Date()).getTime() - (a.createdAt || new Date()).getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    return this.createNotificationSync(insertNotification);
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
    return notification;
  }

  async getDashboardStats(userId: string, role: string): Promise<any> {
    if (role === "patient") {
      const appointments = await this.getAppointmentsByPatient(userId);
      const prescriptions = await this.getPrescriptionsByPatient(userId);
      const notifications = await this.getNotificationsByUser(userId);
      
      return {
        upcomingAppointments: appointments.filter(a => a.status === "scheduled").length,
        activePrescriptions: prescriptions.filter(p => p.status === "active").length,
        healthReports: 7, // Mock data
        alerts: notifications.filter(n => !n.isRead).length,
      };
    } else {
      const appointments = await this.getAppointmentsByDoctor(userId);
      const prescriptions = await this.getPrescriptionsByDoctor(userId);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return {
        todayAppointments: appointments.filter(a => 
          a.date >= today && a.date < tomorrow
        ).length,
        totalPatients: new Set(appointments.map(a => a.patientId)).size,
        prescriptionsThisWeek: prescriptions.filter(p => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return p.createdAt >= weekAgo;
        }).length,
        rating: 4.9, // Mock data
      };
    }
  }
}

export const storage = new MemStorage();
