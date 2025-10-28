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
import { User as UserModel, Appointment as AppointmentModel, Prescription as PrescriptionModel, Message as MessageModel, Notification as NotificationModel } from "./models";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getDoctors(): Promise<User[]>;
  getDoctorsBySpecialty(specialty: string): Promise<User[]>;

  // Appointments
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined>;
  updateAppointmentPaymentStatus(id: string, paymentStatus: string, paymentRef?: string): Promise<Appointment | undefined>;

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

  // Notifications
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;

  // Dashboard stats
  getDashboardStats(userId: string, role: string): Promise<any>;
}

export class MongoStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    if (!user) return undefined;

    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      role: user.role,
      name: user.name,
      phone: user.phone ?? null,
      profilePicture: user.profilePicture ?? null,
      specialty: user.specialty ?? null,
      license: user.license ?? null,
      experience: user.experience ?? null,
      rating: user.rating ?? null,
      isAvailable: user.isAvailable ?? null,
      createdAt: user.createdAt,
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    if (!user) return undefined;

    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      role: user.role,
      name: user.name,
      phone: user.phone,
      profilePicture: user.profilePicture,
      specialty: user.specialty,
      license: user.license,
      experience: user.experience,
      rating: user.rating,
      isAvailable: user.isAvailable,
      createdAt: user.createdAt,
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = new UserModel(insertUser);
    const savedUser = await user.save();

    return {
      id: savedUser._id.toString(),
      email: savedUser.email,
      password: savedUser.password,
      role: savedUser.role,
      name: savedUser.name,
      phone: savedUser.phone,
      profilePicture: savedUser.profilePicture,
      specialty: savedUser.specialty,
      license: savedUser.license,
      experience: savedUser.experience,
      rating: savedUser.rating,
      isAvailable: savedUser.isAvailable,
      createdAt: savedUser.createdAt,
    };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = await UserModel.findByIdAndUpdate(id, updates, { new: true });
    if (!user) return undefined;

    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      role: user.role,
      name: user.name,
      phone: user.phone,
      profilePicture: user.profilePicture,
      specialty: user.specialty,
      license: user.license,
      experience: user.experience,
      rating: user.rating,
      isAvailable: user.isAvailable,
      createdAt: user.createdAt,
    };
  }

  async getDoctors(): Promise<User[]> {
    const doctors = await UserModel.find({ role: 'doctor' });
    return doctors.map(doctor => ({
      id: doctor._id.toString(),
      email: doctor.email,
      password: doctor.password,
      role: doctor.role,
      name: doctor.name,
      phone: doctor.phone,
      profilePicture: doctor.profilePicture,
      specialty: doctor.specialty,
      license: doctor.license,
      experience: doctor.experience,
      rating: doctor.rating,
      isAvailable: doctor.isAvailable,
      createdAt: doctor.createdAt,
    }));
  }

  async getAllUsers(): Promise<User[]> {
    const users = await UserModel.find({});
    return users.map(user => ({
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      role: user.role,
      name: user.name,
      phone: user.phone,
      profilePicture: user.profilePicture,
      specialty: user.specialty,
      license: user.license,
      experience: user.experience,
      rating: user.rating,
      isAvailable: user.isAvailable,
      createdAt: user.createdAt,
    }));
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async getDoctorsBySpecialty(specialty: string): Promise<User[]> {
    const doctors = await UserModel.find({ role: 'doctor', specialty });
    return doctors.map(doctor => ({
      id: doctor._id.toString(),
      email: doctor.email,
      password: doctor.password,
      role: doctor.role,
      name: doctor.name,
      phone: doctor.phone,
      profilePicture: doctor.profilePicture,
      specialty: doctor.specialty,
      license: doctor.license,
      experience: doctor.experience,
      rating: doctor.rating,
      isAvailable: doctor.isAvailable,
      createdAt: doctor.createdAt,
    }));
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const appointment = await AppointmentModel.findById(id);
    if (!appointment) return undefined;

    return {
      id: appointment._id.toString(),
      patientId: appointment.patientId.toString(),
      doctorId: appointment.doctorId.toString(),
      date: appointment.date,
      duration: appointment.duration,
      reason: appointment.reason,
      status: appointment.status,
      notes: appointment.notes,
      paymentAmount: appointment.paymentAmount || 100000,
      paymentStatus: appointment.paymentStatus || "pending",
      paymentMethod: appointment.paymentMethod || "esewa",
      paymentRef: appointment.paymentRef || null,
      createdAt: appointment.createdAt,
    };
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    const appointments = await AppointmentModel.find({ patientId }).populate('doctorId');
    return appointments.map(appointment => ({
      id: appointment._id.toString(),
      patientId: appointment.patientId.toString(),
      doctorId: appointment.doctorId.toString(),
      date: appointment.date,
      duration: appointment.duration,
      reason: appointment.reason,
      status: appointment.status,
      notes: appointment.notes,
      paymentAmount: appointment.paymentAmount,
      paymentStatus: appointment.paymentStatus,
      paymentMethod: appointment.paymentMethod,
      paymentRef: appointment.paymentRef,
      createdAt: appointment.createdAt,
    }));
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    const appointments = await AppointmentModel.find({ doctorId }).populate('patientId');
    return appointments.map(appointment => ({
      id: appointment._id.toString(),
      patientId: appointment.patientId.toString(),
      doctorId: appointment.doctorId.toString(),
      date: appointment.date,
      duration: appointment.duration,
      reason: appointment.reason,
      status: appointment.status,
      notes: appointment.notes,
      paymentAmount: appointment.paymentAmount,
      paymentStatus: appointment.paymentStatus,
      paymentMethod: appointment.paymentMethod,
      paymentRef: appointment.paymentRef,
      createdAt: appointment.createdAt,
    }));
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const appointment = new AppointmentModel(insertAppointment);
    const savedAppointment = await appointment.save();

    return {
      id: savedAppointment._id.toString(),
      patientId: savedAppointment.patientId.toString(),
      doctorId: savedAppointment.doctorId.toString(),
      date: savedAppointment.date,
      duration: savedAppointment.duration,
      reason: savedAppointment.reason,
      status: savedAppointment.status,
      notes: savedAppointment.notes,
      paymentAmount: savedAppointment.paymentAmount,
      paymentStatus: savedAppointment.paymentStatus,
      paymentMethod: savedAppointment.paymentMethod,
      paymentRef: savedAppointment.paymentRef,
      createdAt: savedAppointment.createdAt,
    };
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined> {
    const appointment = await AppointmentModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!appointment) return undefined;

    return {
      id: appointment._id.toString(),
      patientId: appointment.patientId.toString(),
      doctorId: appointment.doctorId.toString(),
      date: appointment.date,
      duration: appointment.duration,
      reason: appointment.reason,
      status: appointment.status,
      notes: appointment.notes,
      paymentAmount: appointment.paymentAmount,
      paymentStatus: appointment.paymentStatus,
      paymentMethod: appointment.paymentMethod,
      paymentRef: appointment.paymentRef,
      createdAt: appointment.createdAt,
    };
  }

  async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    const prescriptions = await PrescriptionModel.find({ patientId }).populate('doctorId');
    return prescriptions.map(prescription => ({
      id: prescription._id.toString(),
      patientId: prescription.patientId.toString(),
      doctorId: prescription.doctorId.toString(),
      appointmentId: prescription.appointmentId?.toString(),
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      instructions: prescription.instructions,
      status: prescription.status,
      startDate: prescription.startDate,
      endDate: prescription.endDate,
      createdAt: prescription.createdAt,
    }));
  }

  async getPrescriptionsByDoctor(doctorId: string): Promise<Prescription[]> {
    const prescriptions = await PrescriptionModel.find({ doctorId }).populate('patientId');
    return prescriptions.map(prescription => ({
      id: prescription._id.toString(),
      patientId: prescription.patientId.toString(),
      doctorId: prescription.doctorId.toString(),
      appointmentId: prescription.appointmentId?.toString(),
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      instructions: prescription.instructions,
      status: prescription.status,
      startDate: prescription.startDate,
      endDate: prescription.endDate,
      createdAt: prescription.createdAt,
    }));
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const prescription = new PrescriptionModel(insertPrescription);
    const savedPrescription = await prescription.save();

    return {
      id: savedPrescription._id.toString(),
      patientId: savedPrescription.patientId.toString(),
      doctorId: savedPrescription.doctorId.toString(),
      appointmentId: savedPrescription.appointmentId?.toString(),
      medication: savedPrescription.medication,
      dosage: savedPrescription.dosage,
      frequency: savedPrescription.frequency,
      duration: savedPrescription.duration,
      instructions: savedPrescription.instructions,
      status: savedPrescription.status,
      startDate: savedPrescription.startDate,
      endDate: savedPrescription.endDate,
      createdAt: savedPrescription.createdAt,
    };
  }

  async updatePrescriptionStatus(id: string, status: string): Promise<Prescription | undefined> {
    const prescription = await PrescriptionModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!prescription) return undefined;

    return {
      id: prescription._id.toString(),
      patientId: prescription.patientId.toString(),
      doctorId: prescription.doctorId.toString(),
      appointmentId: prescription.appointmentId?.toString(),
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      instructions: prescription.instructions,
      status: prescription.status,
      startDate: prescription.startDate,
      endDate: prescription.endDate,
      createdAt: prescription.createdAt,
    };
  }

  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    const messages = await MessageModel.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ]
    }).sort({ createdAt: 1 });

    return messages.map(message => ({
      id: message._id.toString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      content: message.content,
      messageType: message.messageType,
      read: message.read,
      timestamp: message.timestamp,
      createdAt: message.createdAt,
    }));
  }

  async getConversationsForUser(userId: string): Promise<Array<{user: User, lastMessage: Message, unreadCount: number}>> {
    // Get all messages where user is sender or receiver
    const messages = await MessageModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).populate('senderId').populate('receiverId').sort({ createdAt: -1 });

    const conversationMap = new Map<string, {user: User, lastMessage: Message, unreadCount: number}>();

    for (const message of messages) {
      const otherUserId = message.senderId.toString() === userId ? message.receiverId.toString() : message.senderId.toString();
      if (conversationMap.has(otherUserId)) continue;

      const otherUser = message.senderId.toString() === userId ? message.receiverId : message.senderId;
      const unreadCount = await MessageModel.countDocuments({
        senderId: otherUserId,
        receiverId: userId,
        read: false
      });

      conversationMap.set(otherUserId, {
        user: {
          id: otherUser._id.toString(),
          email: otherUser.email,
          password: otherUser.password,
          role: otherUser.role,
          name: otherUser.name,
          phone: otherUser.phone,
          profilePicture: otherUser.profilePicture,
          specialty: otherUser.specialty,
          license: otherUser.license,
          experience: otherUser.experience,
          rating: otherUser.rating,
          isAvailable: otherUser.isAvailable,
          createdAt: otherUser.createdAt,
        },
        lastMessage: {
          id: message._id.toString(),
          senderId: message.senderId.toString(),
          receiverId: message.receiverId.toString(),
          content: message.content,
          messageType: message.messageType,
          read: message.read,
          timestamp: message.timestamp,
          createdAt: message.createdAt,
        },
        unreadCount
      });
    }

    return Array.from(conversationMap.values());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message = new MessageModel(insertMessage);
    const savedMessage = await message.save();

    return {
      id: savedMessage._id.toString(),
      senderId: savedMessage.senderId.toString(),
      receiverId: savedMessage.receiverId.toString(),
      content: savedMessage.content,
      messageType: savedMessage.messageType,
      read: savedMessage.read,
      timestamp: savedMessage.timestamp,
      createdAt: savedMessage.createdAt,
    };
  }

  async markMessageAsRead(id: string): Promise<Message | undefined> {
    const message = await MessageModel.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!message) return undefined;

    return {
      id: message._id.toString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      content: message.content,
      messageType: message.messageType,
      read: message.read,
      timestamp: message.timestamp,
      createdAt: message.createdAt,
    };
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 });
    return notifications.map(notification => ({
      id: notification._id.toString(),
      userId: notification.userId.toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    }));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notification = new NotificationModel(insertNotification);
    const savedNotification = await notification.save();

    return {
      id: savedNotification._id.toString(),
      userId: savedNotification.userId.toString(),
      title: savedNotification.title,
      message: savedNotification.message,
      type: savedNotification.type,
      isRead: savedNotification.isRead,
      createdAt: savedNotification.createdAt,
    };
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const notification = await NotificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!notification) return undefined;

    return {
      id: notification._id.toString(),
      userId: notification.userId.toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }

  async updateAppointmentPaymentStatus(id: string, paymentStatus: string, paymentRef?: string): Promise<Appointment | undefined> {
    const updateData: any = { paymentStatus };
    if (paymentRef) {
      updateData.paymentRef = paymentRef;
    }
    const appointment = await AppointmentModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!appointment) return undefined;

    return {
      id: appointment._id.toString(),
      patientId: appointment.patientId.toString(),
      doctorId: appointment.doctorId.toString(),
      date: appointment.date,
      duration: appointment.duration,
      reason: appointment.reason,
      status: appointment.status,
      notes: appointment.notes,
      paymentAmount: appointment.paymentAmount,
      paymentStatus: appointment.paymentStatus,
      paymentMethod: appointment.paymentMethod,
      paymentRef: appointment.paymentRef,
      createdAt: appointment.createdAt,
    };
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

export const mongoStorage = new MongoStorage();
