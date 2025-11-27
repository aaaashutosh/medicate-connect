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
  type InsertNotification,
  type ContactMessage,
  type InsertContactMessage
} from "@shared/schema";
import { mongoStorage } from "./mongo-storage";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserWithPassword(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getDoctors(): Promise<User[]>;
  getDoctorsBySpecialty(specialty: string): Promise<User[]>;

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
  getConversationsForUser(userId: string): Promise<Array<{user: User, lastMessage: Message, unreadCount: number}>>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<Message | undefined>;

  // Chats
  createChat(participants: string[]): Promise<{ id: string, participants: string[], lastMessage?: string }>;
  getChatsForUser(userId: string): Promise<Array<{ id: string, participants: User[], lastMessage?: Message }>>;

  // Notifications
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;

  // Dashboard stats
  getDashboardStats(userId: string, role: string): Promise<any>;

  // Contact Messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  updateContactMessageStatus(id: string, status: string): Promise<ContactMessage | undefined>;
}

// Use MongoDB storage instead of in-memory storage
export const storage = mongoStorage;
