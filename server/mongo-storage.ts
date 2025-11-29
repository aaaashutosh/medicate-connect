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
  type InsertContactMessage,
} from "@shared/schema";
import { User as UserModel, Appointment as AppointmentModel, Prescription as PrescriptionModel, Message as MessageModel, Notification as NotificationModel, ContactMessage as ContactMessageModel, Chat as ChatModel, IChat, IMessage } from "./models";
import { Schema } from "mongoose";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getDoctors(): Promise<User[]>;
  getDoctorsBySpecialty(specialty: string): Promise<User[]>;
  getPatientsByDoctor(doctorId: string): Promise<User[]>;

  // Appointments
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined>;
  updateAppointmentPaymentStatus(id: string, paymentStatus: string, paymentRef?: string): Promise<Appointment | undefined>;

  // Prescriptions
  getPrescription(id: string): Promise<Prescription | undefined>;
  getPrescriptionsByPatient(patientId: string): Promise<Prescription[]>;
  getPrescriptionsByDoctor(doctorId: string): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;

  // Messages/Chat
  getChatByParticipants(userAId: string, userBId: string): Promise<IChat | null>;
  saveMessage(messageData: { senderId: string, receiverId: string, chatId: string, content: string, messageType: 'text' | 'image' | 'voice' | 'file' | 'report', fileUrl?: string, fileMimeType?: string }): Promise<IMessage>;
  getMessagesByChatId(chatId: string, page: number, limit: number): Promise<IMessage[]>;
  markMessagesAsRead(chatId: string, receiverId: string): Promise<void>;
  getChatsForUser(userId: string): Promise<Array<{ id: string, participants: User[], lastMessage?: Message, unreadCount: number }>>;
  
  // Notifications
  getNotification(id: string): Promise<Notification | undefined>;
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  
  // Contact Messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
}

// Helper to map Mongoose User document to User interface (excluding sensitive data)
const mapToUser = (doc: any): User => ({
  id: doc._id.toString(),
  email: doc.email,
  role: doc.role as 'doctor' | 'patient' | 'admin',
  name: doc.name,
  phone: doc.phone,
  profilePicture: doc.profilePicture,
  specialty: doc.specialty,
  license: doc.license,
  experience: doc.experience,
  rating: doc.rating,
  isAvailable: doc.isAvailable,
});


export class MongoStorage implements IStorage {
    // --- User Methods ---
    async getUser(id: string): Promise<User | undefined> {
        const user = await UserModel.findById(id).lean();
        return user ? mapToUser(user) : undefined;
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        const user = await UserModel.findOne({ email }).lean();
        return user ? mapToUser(user) : undefined;
    }

    async createUser(user: InsertUser): Promise<User> {
        const newUser = new UserModel(user);
        const savedUser = await newUser.save();
        return mapToUser(savedUser);
    }

    async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
        const updatedUser = await UserModel.findByIdAndUpdate(id, updates, { new: true }).lean();
        return updatedUser ? mapToUser(updatedUser) : undefined;
    }

    async getDoctors(): Promise<User[]> {
        // Implementation: Fetch all users with role 'doctor'
        const doctors = await UserModel.find({ role: 'doctor' }).lean();
        return doctors.map(mapToUser);
    }

    async getDoctorsBySpecialty(specialty: string): Promise<User[]> {
        // Implementation: Fetch users with role 'doctor' and matching specialty
        const doctors = await UserModel.find({ role: 'doctor', specialty: specialty }).lean();
        return doctors.map(mapToUser);
    }

    async getPatientsByDoctor(doctorId: string): Promise<User[]> {
        // Placeholder/Stub implementation. You would typically fetch patients based on appointments
        // or a dedicated assignment field if one exists.
        // For a simple implementation, we can fetch all users with role 'patient'.
        const patients = await UserModel.find({ role: 'patient' }).lean();
        return patients.map(mapToUser);
    }

    async getAllUsers(): Promise<User[]> {
        const users = await UserModel.find({}).lean();
        return users.map(mapToUser);
    }

    async deleteUser(id: string): Promise<boolean> {
        const result = await UserModel.findByIdAndDelete(id);
        return !!result;
    }

    // --- Appointment Methods ---
    async getAppointment(id: string): Promise<Appointment | undefined> {
        const appointment = await AppointmentModel.findById(id).lean();
        return appointment ? appointment as Appointment : undefined;
    }

    async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
        const appointments = await AppointmentModel.find({ patientId }).lean();
        return appointments as Appointment[];
    }

    async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
        const appointments = await AppointmentModel.find({ doctorId }).lean();
        return appointments as Appointment[];
    }

    async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
        const newAppointment = new AppointmentModel(appointment);
        const savedAppointment = await newAppointment.save();
        return savedAppointment as Appointment;
    }

    async updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined> {
        const updatedAppointment = await AppointmentModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
        return updatedAppointment ? updatedAppointment as Appointment : undefined;
    }

    async updateAppointmentPaymentStatus(id: string, paymentStatus: string, paymentRef?: string): Promise<Appointment | undefined> {
        const updatedAppointment = await AppointmentModel.findByIdAndUpdate(id, { paymentStatus, paymentRef }, { new: true }).lean();
        return updatedAppointment ? updatedAppointment as Appointment : undefined;
    }

    // --- Prescription Methods ---
    async getPrescription(id: string): Promise<Prescription | undefined> {
        const prescription = await PrescriptionModel.findById(id).lean();
        return prescription ? prescription as Prescription : undefined;
    }

    async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
        const prescriptions = await PrescriptionModel.find({ patientId }).lean();
        return prescriptions as Prescription[];
    }

    async getPrescriptionsByDoctor(doctorId: string): Promise<Prescription[]> {
        const prescriptions = await PrescriptionModel.find({ doctorId }).lean();
        return prescriptions as Prescription[];
    }

    async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
        const newPrescription = new PrescriptionModel(prescription);
        const savedPrescription = await newPrescription.save();
        return savedPrescription as Prescription;
    }

    // --- Chat Methods ---
    async getChatByParticipants(userAId: string, userBId: string): Promise<IChat | null> {
        const sortedParticipants = [userAId, userBId].sort();
        const chat = await ChatModel.findOne({ participants: sortedParticipants });
        return chat;
    }

    async saveMessage(messageData: { senderId: string, receiverId: string, chatId: string, content: string, messageType: 'text' | 'image' | 'voice' | 'file' | 'report', fileUrl?: string, fileMimeType?: string }): Promise<IMessage> {
        const message = new MessageModel({
            chatId: messageData.chatId,
            senderId: messageData.senderId,
            receiverId: messageData.receiverId,
            content: messageData.content,
            messageType: messageData.messageType,
            fileUrl: messageData.fileUrl,
            fileMimeType: messageData.fileMimeType,
            read: false,
            delivered: false,
        });

        const savedMessage = await message.save();

        // Update chat's lastMessage and updatedAt
        await ChatModel.findByIdAndUpdate(messageData.chatId, {
            lastMessage: savedMessage._id,
            updatedAt: new Date()
        });

        // Add receiverId to the saved message object before returning
        return {
            ...savedMessage.toObject(),
            receiverId: messageData.receiverId,
        } as IMessage;
    }

    async getMessagesByChatId(chatId: string, page: number = 1, limit: number = 50): Promise<IMessage[]> {
        const skip = (page - 1) * limit;
        const messages = await MessageModel.find({ chatId })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .lean();
        
        return messages as IMessage[];
    }

    async markMessagesAsRead(chatId: string, receiverId: string): Promise<void> {
        // Mark all messages in the chat *received by* the receiverId as read
        await MessageModel.updateMany(
            { chatId: chatId, receiverId: receiverId, read: false },
            { $set: { read: true } }
        );
    }
    
    // Helper to calculate unread count (must be used in getChatsForUser)
    async getUnreadCount(chatId: string, userId: string): Promise<number> {
      return MessageModel.countDocuments({ chatId: chatId, receiverId: userId, read: false });
    }

    async getChatsForUser(userId: string): Promise<Array<{ id: string, participants: User[], lastMessage?: Message, unreadCount: number }>> {
        const chats = await ChatModel.find({ participants: userId })
            .populate('participants')
            .populate('lastMessage')
            .sort({ updatedAt: -1 })
            .lean();

        const result = await Promise.all(chats.map(async (chat: any) => {
            const unreadCount = await this.getUnreadCount(chat._id.toString(), userId);
            
            const participants = chat.participants.map(mapToUser);

            let lastMessage: Message | undefined;
            if (chat.lastMessage) {
              // Map lastMessage to the Message type
              lastMessage = {
                id: chat.lastMessage._id.toString(),
                senderId: chat.lastMessage.senderId.toString(),
                receiverId: chat.lastMessage.receiverId.toString(),
                chatId: chat.lastMessage.chatId.toString(),
                content: chat.lastMessage.content,
                messageType: chat.lastMessage.messageType,
                fileUrl: chat.lastMessage.fileUrl,
                fileMimeType: chat.lastMessage.fileMimeType,
                read: chat.lastMessage.read,
                delivered: chat.lastMessage.delivered,
                createdAt: chat.lastMessage.createdAt.toISOString(),
              };
            }

            return {
                id: chat._id.toString(),
                participants: participants,
                lastMessage: lastMessage,
                unreadCount: unreadCount,
            };
        }));
        
        return result;
    }

    // --- Notification Methods ---
    async getNotification(id: string): Promise<Notification | undefined> {
        const notification = await NotificationModel.findById(id).lean();
        return notification ? notification as Notification : undefined;
    }

    async getNotificationsByUserId(userId: string): Promise<Notification[]> {
        const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).lean();
        return notifications as Notification[];
    }

    async createNotification(notification: InsertNotification): Promise<Notification> {
        const newNotification = new NotificationModel(notification);
        const savedNotification = await newNotification.save();
        return savedNotification as Notification;
    }

    async markNotificationAsRead(id: string): Promise<Notification | undefined> {
        const updatedNotification = await NotificationModel.findByIdAndUpdate(id, { read: true }, { new: true }).lean();
        return updatedNotification ? updatedNotification as Notification : undefined;
    }

    // --- Contact Message Methods ---
    async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
        const newContactMessage = new ContactMessageModel(message);
        const savedContactMessage = await newContactMessage.save();
        return savedContactMessage as ContactMessage;
    }
}

export const storage = new MongoStorage();