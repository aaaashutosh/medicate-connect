import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { insertUserSchema, insertAppointmentSchema, insertPrescriptionSchema, insertMessageSchema } from "@shared/schema";
import { generateAIResponse } from "./gemini";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const upload = multer({
    dest: 'uploads/',
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    }
  });

  // Ensure uploads directory exists
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

  // File upload route
  app.post("/api/upload/profile-picture", upload.single('profilePicture'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "File upload failed" });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User profile update route
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Don't allow password updates via this route
      if (updates.password) {
        delete updates.password;
      }
      
      const user = await storage.updateUser(id, updates);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Doctors directory routes
  app.get("/api/doctors", async (req, res) => {
    try {
      const { specialty } = req.query;

      let doctors;
      if (specialty && specialty !== "all") {
        doctors = await storage.getDoctorsBySpecialty(specialty as string);
      } else {
        doctors = await storage.getDoctors();
      }

      // Remove passwords from response
      const doctorsWithoutPasswords = doctors.map(({ password: _, ...doctor }) => doctor);
      res.json(doctorsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      // TODO: Add admin authentication middleware
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password: _, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/doctors", async (req, res) => {
    try {
      // TODO: Add admin authentication middleware
      const doctorData = insertUserSchema.parse(req.body);
      const doctor = await storage.createUser(doctorData);
      const { password: _, ...doctorWithoutPassword } = doctor;
      res.status(201).json(doctorWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/doctors/:id", async (req, res) => {
    try {
      // TODO: Add admin authentication middleware
      const { id } = req.params;
      const updates = req.body;

      // Don't allow password updates via this route
      if (updates.password) {
        delete updates.password;
      }

      const doctor = await storage.updateUser(id, updates);

      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      const { password: _, ...doctorWithoutPassword } = doctor;
      res.json(doctorWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/doctors/:id", async (req, res) => {
    try {
      // TODO: Add admin authentication middleware
      const { id } = req.params;
      const success = await storage.deleteUser(id);

      if (!success) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      res.json({ message: "Doctor deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.query;
      
      if (!role || (role !== "patient" && role !== "doctor")) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const stats = await storage.getDashboardStats(userId, role as string);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Appointment routes
  app.get("/api/appointments/patient/:patientId", async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByPatient(req.params.patientId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/appointments/doctor/:doctorId", async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByDoctor(req.params.doctorId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Payment routes
  app.post("/api/payments/initiate", async (req, res) => {
    try {
      const { appointmentId } = req.body;

      if (!appointmentId) {
        return res.status(400).json({ message: "Appointment ID is required" });
      }

      // Get appointment details
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Check if payment is already completed
      if (appointment.paymentStatus === "paid") {
        return res.status(400).json({ message: "Payment already completed" });
      }

      // eSewa test configuration
      const merchantCode = "EPAYTEST";
      const amount = appointment.paymentAmount || 100000; // Default to 1000 NPR in paisa
      const taxAmount = 0;
      const serviceCharge = 0;
      const deliveryCharge = 0;
      const totalAmount = amount + taxAmount + serviceCharge + deliveryCharge;
      const productServiceCharge = 0;
      const productDeliveryCharge = 0;
      const successUrl = `${req.protocol}://${req.get('host')}/api/payments/verify?status=success&appointmentId=${appointmentId}`;
      const failureUrl = `${req.protocol}://${req.get('host')}/api/payments/verify?status=failure&appointmentId=${appointmentId}`;
      const signedFieldNames = "total_amount,transaction_uuid,product_code";
      const secret = "8gBm/:&EnhH.1/q"; // eSewa test secret

      // Generate transaction UUID
      const transactionUuid = `txn_${appointmentId}_${Date.now()}`;

      // Create signature
      const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${merchantCode}`;
      const crypto = await import('crypto');
      const signature = crypto.createHmac('sha256', secret).update(message).digest('base64');

      // eSewa payment URL
      const paymentUrl = `https://rc-epay.esewa.com.np/api/epay/main/v2/form`;

      res.json({
        paymentUrl,
        formData: {
          amount: totalAmount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          transaction_uuid: transactionUuid,
          product_code: merchantCode,
          product_service_charge: productServiceCharge,
          product_delivery_charge: productDeliveryCharge,
          success_url: successUrl,
          failure_url: failureUrl,
          signed_field_names: signedFieldNames,
          signature
        }
      });
    } catch (error) {
      console.error("Payment initiation error:", error);
      res.status(500).json({ message: "Payment initiation failed" });
    }
  });

  app.get("/api/payments/verify", async (req, res) => {
    try {
      const { status, appointmentId, total_amount, transaction_uuid, product_code, signed_field_names, signature } = req.query;

      if (!appointmentId) {
        return res.redirect(`${req.protocol}://${req.get('host')}/?payment_error=no_appointment_id`);
      }

      const appointment = await storage.getAppointment(appointmentId as string);
      if (!appointment) {
        return res.redirect(`${req.protocol}://${req.get('host')}/?payment_error=appointment_not_found`);
      }

      if (status === "success") {
        // Verify signature for security
        const secret = "8gBm/:&EnhH.1/q";
        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        const crypto = await import('crypto');
        const expectedSignature = crypto.createHmac('sha256', secret).update(message).digest('base64');

        if (signature !== expectedSignature) {
          console.error("Signature verification failed");
          await storage.updateAppointmentPaymentStatus(appointmentId as string, "failed", transaction_uuid as string);
          return res.redirect(`${req.protocol}://${req.get('host')}/?payment_error=signature_failed`);
        }

        // Update appointment payment status
        await storage.updateAppointmentPaymentStatus(appointmentId as string, "paid", transaction_uuid as string);

        // Redirect to success page
        res.redirect(`${req.protocol}://${req.get('host')}/?payment_success=true&appointment_id=${appointmentId}`);
      } else {
        // Payment failed
        await storage.updateAppointmentPaymentStatus(appointmentId as string, "failed", transaction_uuid as string || "");

        // Redirect to failure page
        res.redirect(`${req.protocol}://${req.get('host')}/?payment_error=payment_failed&appointment_id=${appointmentId}`);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ message: "Payment verification failed" });
    }
  });

  // Prescription routes
  app.get("/api/prescriptions/patient/:patientId", async (req, res) => {
    try {
      const prescriptions = await storage.getPrescriptionsByPatient(req.params.patientId);
      res.json(prescriptions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/prescriptions/doctor/:doctorId", async (req, res) => {
    try {
      const prescriptions = await storage.getPrescriptionsByDoctor(req.params.doctorId);
      res.json(prescriptions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/prescriptions", async (req, res) => {
    try {
      const prescriptionData = insertPrescriptionSchema.parse(req.body);
      const prescription = await storage.createPrescription(prescriptionData);
      res.status(201).json(prescription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/prescriptions/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const prescription = await storage.updatePrescriptionStatus(req.params.id, status);
      
      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      
      res.json(prescription);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Message routes
  app.get("/api/messages/:userId1/:userId2", async (req, res) => {
    try {
      const messages = await storage.getMessagesBetweenUsers(req.params.userId1, req.params.userId2);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/conversations/:userId", async (req, res) => {
    try {
      const conversations = await storage.getConversationsForUser(req.params.userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    try {
      const message = await storage.markMessageAsRead(req.params.id);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notification routes
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.params.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Chat route
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const response = await generateAIResponse(message);
      res.json({ response });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ message: "AI service temporarily unavailable" });
    }
  });

  // WebRTC Signaling Routes for Audio/Video Calls
  app.post("/api/call/initiate", async (req, res) => {
    try {
      const { callerId, receiverId, callType } = req.body;
      
      // Verify both users exist
      const caller = await storage.getUser(callerId);
      const receiver = await storage.getUser(receiverId);
      
      if (!caller || !receiver) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // In a real implementation, you would use a WebSocket or similar
      // to notify the receiver about the incoming call
      // For now, we'll just return success
      res.json({
        success: true,
        callId: `call_${Date.now()}`,
        caller,
        receiver,
        callType
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/call/offer", async (req, res) => {
    try {
      const { callId, offer, senderId, receiverId } = req.body;
      
      // In a real implementation, you would use a WebSocket or similar
      // to send the offer to the receiver
      // For now, we'll just return success
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/call/answer", async (req, res) => {
    try {
      const { callId, answer, senderId, receiverId } = req.body;
      
      // In a real implementation, you would use a WebSocket or similar
      // to send the answer to the caller
      // For now, we'll just return success
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/call/ice-candidate", async (req, res) => {
    try {
      const { callId, candidate, senderId, receiverId } = req.body;
      
      // In a real implementation, you would use a WebSocket or similar
      // to send the ICE candidate to the other peer
      // For now, we'll just return success
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/call/end", async (req, res) => {
    try {
      const { callId, userId } = req.body;
      
      // In a real implementation, you would use a WebSocket or similar
      // to notify the other participant that the call has ended
      // For now, we'll just return success
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
