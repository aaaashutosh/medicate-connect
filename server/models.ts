import mongoose, { Schema, Document } from 'mongoose';

// User interface and schema
export interface IUser extends Document {
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'admin';
  name: string;
  phone?: string;
  profilePicture?: string;
  specialty?: string;
  license?: string;
  experience?: number;
  rating?: number;
  isAvailable?: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['patient', 'doctor', 'admin'] },
  name: { type: String, required: true },
  phone: { type: String },
  profilePicture: { type: String },
  specialty: { type: String },
  license: { type: String },
  experience: { type: Number },
  rating: { type: Number, default: 5 },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Appointment interface and schema
export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  duration: number;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  paymentAmount?: number;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  paymentRef?: string;
  createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true, default: 30 },
  reason: { type: String, required: true },
  status: { type: String, required: true, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  notes: { type: String },
  paymentAmount: { type: Number, default: 100000 },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentMethod: { type: String, default: 'esewa' },
  paymentRef: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Prescription interface and schema
export interface IPrescription extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  status: 'active' | 'completed' | 'refill_due';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

const PrescriptionSchema = new Schema<IPrescription>({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  medication: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String },
  status: { type: String, required: true, enum: ['active', 'completed', 'refill_due'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Message interface and schema
export interface IMessage extends Document {
  chatId?: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId?: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'voice' | 'file' | 'report';
  read: boolean;
  timestamp: string;
  createdAt: Date;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMime?: string;
}

const MessageSchema = new Schema<IMessage>({
  chatId: { type: Schema.Types.ObjectId, ref: 'Chat' },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  messageType: { type: String, required: true, enum: ['text', 'image', 'voice', 'file', 'report'], default: 'text' },
  read: { type: Boolean, required: true, default: false },
  timestamp: { type: String, default: () => new Date().toISOString() },
  createdAt: { type: Date, default: Date.now },
  fileUrl: { type: String },
  fileName: { type: String },
  fileSize: { type: Number },
  fileMime: { type: String },
});

// Chat schema to group messages between two participants (or group later)
export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[]; // two participants (doctor & patient)
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: mongoose.Types.ObjectId;
}

const ChatSchema = new Schema<IChat>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Notification interface and schema
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'appointment' | 'prescription' | 'general';
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true, enum: ['appointment', 'prescription', 'general'] },
  isRead: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Contact Message interface and schema
export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, required: true, enum: ['unread', 'read', 'replied'], default: 'unread' },
  createdAt: { type: Date, default: Date.now },
});

// Create models
export const User = mongoose.model<IUser>('User', UserSchema);
export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
export const Prescription = mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
