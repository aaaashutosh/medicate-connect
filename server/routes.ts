import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./mongo-storage"; // Import the updated storage
import { insertUserSchema, insertAppointmentSchema, insertPrescriptionSchema, insertMessageSchema, insertContactMessageSchema } from "@shared/schema";
import { generateAIResponse } from "./gemini";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Server as IOServer } from "socket.io";
import { log } from "./vite";
import { User } from "@shared/schema";
import { Types } from "mongoose";

// Map to store online users and their associated socket IDs
const onlineUsers = new Map<string, Set<string>>();

export async function registerRoutes(app: Express): Promise<Server> {
    const server = createServer(app);
    
    // Socket.IO Setup
    const io = new IOServer(server, {
      cors: {
        origin: "*", // Allow all origins for development
        methods: ["GET", "POST"]
      }
    });

    // Configure multer for file uploads
    const upload = multer({
      dest: 'uploads/',
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        // Allow images, PDFs, and common document types
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xlsx|txt|mp3|mp4|mov|avi|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new Error('File type not supported. Allowed: images, documents, audio/video.'));
        }
      }
    });

    // Ensure uploads directory exists
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    
    // Serve uploaded static files
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

    // --- FILE UPLOAD ROUTES ---
    // File upload route for profile picture
    app.post("/api/upload/profile-picture", upload.single('profilePicture'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded." });
        }

        // Return the URL to the uploaded file
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ fileUrl });
      } catch (error) {
        res.status(500).json({ message: 'File upload failed.' });
      }
    });
    
    // File upload route for message content
    app.post("/api/upload/message-file", upload.single('file'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded." });
        }
        
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ 
          fileUrl, 
          fileName: req.file.originalname, 
          fileMimeType: req.file.mimetype 
        });
      } catch (error) {
        res.status(500).json({ message: 'File upload failed.' });
      }
    });


    // --- USER ROUTES ---
    app.post("/api/users", async (req, res) => {
      try {
        const userData = insertUserSchema.parse(req.body);
        const newUser = await storage.createUser(userData);
        res.status(201).json(newUser);
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ message: "Invalid user data.", errors: error.errors });
        } else {
          res.status(500).json({ message: "Failed to create user." });
        }
      }
    });

    app.get("/api/users/:id", async (req, res) => {
      try {
        const user = await storage.getUser(req.params.id);
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }
        res.json(user);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch user." });
      }
    });

    // --- DOCTOR ROUTES (FIXED/ADDED) ---
    app.get("/api/doctors", async (req, res) => {
        try {
            const specialty = req.query.specialty as string | undefined;

            let doctors;
            if (specialty && specialty !== 'all') {
                doctors = await storage.getDoctorsBySpecialty(specialty);
            } else {
                doctors = await storage.getDoctors();
            }

            res.json(doctors);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            res.status(500).json({ message: "Failed to fetch doctors data." });
        }
    });

    // --- PATIENT ROUTES (FOR DOCTOR'S VIEW) ---
    app.get("/api/patients/doctor/:doctorId", async (req, res) => {
      try {
        // NOTE: This assumes an assignment mechanism or fetches all patients as a placeholder.
        // A proper implementation would check appointments or a dedicated 'assignedTo' field.
        const patients = await storage.getPatientsByDoctor(req.params.doctorId);
        res.json(patients);
      } catch (error) {
        console.error("Error fetching doctor's patients:", error);
        res.status(500).json({ message: "Failed to fetch patient data." });
      }
    });


    // --- APPOINTMENT ROUTES ---
    app.post("/api/appointments", async (req, res) => {
      try {
        const appointmentData = insertAppointmentSchema.parse(req.body);
        const newAppointment = await storage.createAppointment(appointmentData);
        res.status(201).json(newAppointment);
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ message: "Invalid appointment data.", errors: error.errors });
        } else {
          res.status(500).json({ message: "Failed to create appointment." });
        }
      }
    });

    app.get("/api/appointments/patient/:patientId", async (req, res) => {
      try {
        const appointments = await storage.getAppointmentsByPatient(req.params.patientId);
        res.json(appointments);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch patient appointments." });
      }
    });

    app.get("/api/appointments/doctor/:doctorId", async (req, res) => {
      try {
        const appointments = await storage.getAppointmentsByDoctor(req.params.doctorId);
        res.json(appointments);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch doctor appointments." });
      }
    });

    app.put("/api/appointments/:id/status", async (req, res) => {
      try {
        const updatedAppointment = await storage.updateAppointmentStatus(req.params.id, req.body.status);
        if (!updatedAppointment) {
          return res.status(404).json({ message: "Appointment not found." });
        }
        res.json(updatedAppointment);
      } catch (error) {
        res.status(500).json({ message: "Failed to update appointment status." });
      }
    });

    app.put("/api/appointments/:id/payment", async (req, res) => {
      try {
        const { paymentStatus, paymentRef } = req.body;
        const updatedAppointment = await storage.updateAppointmentPaymentStatus(req.params.id, paymentStatus, paymentRef);
        if (!updatedAppointment) {
          return res.status(404).json({ message: "Appointment not found." });
        }
        res.json(updatedAppointment);
      } catch (error) {
        res.status(500).json({ message: "Failed to update payment status." });
      }
    });
    
    // --- CHAT/MESSAGE ROUTES ---
    app.post("/api/chats", async (req, res) => {
      try {
        const { userAId, userBId } = req.body;
        if (!userAId || !userBId) {
          return res.status(400).json({ message: "userAId and userBId are required." });
        }

        // Check for existing chat
        let chat = await storage.getChatByParticipants(userAId, userBId);
        
        if (!chat) {
            // Create chat if it doesn't exist
            chat = await storage.getChatByParticipants(userAId, userBId); // Call again in case of race condition, or just create
        }
        
        // Re-fetch with populated data and return
        const fullChat = await storage.getChatsForUser(userAId);
        const result = fullChat.find(c => c.id === chat?.id);

        if (!result) {
          return res.status(500).json({ message: "Failed to retrieve or create chat." });
        }

        res.status(201).json(result);
      } catch (error) {
        console.error("Error in POST /api/chats:", error);
        res.status(500).json({ message: "Failed to create chat." });
      }
    });

    app.get("/api/chats/:userId", async (req, res) => {
      try {
        const chats = await storage.getChatsForUser(req.params.userId);
        res.json(chats);
      } catch (error) {
        console.error("Error in GET /api/chats/:userId:", error);
        res.status(500).json({ message: "Failed to fetch chats." });
      }
    });

    app.get("/api/chats/:chatId/messages", async (req, res) => {
      try {
        const { page = '1', limit = '50' } = req.query;
        const messages = await storage.getMessagesByChatId(req.params.chatId, parseInt(page as string), parseInt(limit as string));
        res.json(messages);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch messages." });
      }
    });
    
    // --- GEMINI AI ROUTE ---
    app.post("/api/ai/diagnose", async (req, res) => {
        try {
            const { symptoms } = req.body;
            if (!symptoms) {
                return res.status(400).json({ message: "Symptoms are required." });
            }
            
            const response = await generateAIResponse(symptoms);
            res.json({ diagnosis: response });
        } catch (error) {
            res.status(500).json({ message: "AI diagnosis failed." });
        }
    });
    
    // --- SOCKET.IO CONNECTION HANDLING ---
    io.on("connection", (socket) => {
      const userId = socket.handshake.query.userId as string;
      if (userId) {
        // Add user to the online users map
        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId)?.add(socket.id);
        
        // Broadcast presence update to everyone
        io.emit('presence_update', { userId, isOnline: true });
        
        log(`User ${userId} connected. Total connections for user: ${onlineUsers.get(userId)?.size}`);
      }

      socket.on("disconnect", () => {
        if (userId) {
          const sockets = onlineUsers.get(userId);
          sockets?.delete(socket.id);

          if (sockets?.size === 0) {
            onlineUsers.delete(userId);
            // Broadcast presence update (offline)
            io.emit('presence_update', { userId, isOnline: false });
          }
          log(`User ${userId} disconnected. Remaining connections: ${sockets?.size || 0}`);
        }
      });
      
      // Handle incoming messages
      socket.on('message', async (messageData: { senderId: string, receiverId: string, chatId: string, content: string, messageType: 'text' | 'image' | 'voice' | 'file' | 'report', fileUrl?: string, fileMimeType?: string }) => {
        try {
          // 1. Persist the message
          const savedMessage = await storage.saveMessage(messageData);

          // 2. Broadcast to the chat room (or to both users' specific rooms/sockets)
          const message = savedMessage.toObject() as User;

          // Emit the message back to the sender (to update their UI with the final persisted ID/timestamp)
          io.to(socket.id).emit('message', message);
          
          // Emit to the receiver(s)
          const receiverSockets = onlineUsers.get(message.receiverId);
          if (receiverSockets) {
            for (const s of receiverSockets) {
              io.to(s).emit('message', message);
            }
          }
          
          // Force a chat list refresh for the receiver
          if (receiverSockets) {
             receiverSockets.forEach(s => io.to(s).emit('refresh_chats'));
          }

        } catch (err) {
          console.error('Socket message error', err);
          io.to(socket.id).emit('error', 'Failed to send message.');
        }
      });

      // Handle typing indicator
      socket.on('typing', ({ chatId, senderId, receiverId, isTyping }) => {
        const receiverSockets = onlineUsers.get(receiverId);
        if (receiverSockets) {
          for (const s of receiverSockets) {
            io.to(s).emit('typing', { chatId, senderId, isTyping });
          }
        }
      });
      
      // Handle message read status
      socket.on('mark_as_read', async ({ chatId, senderId, receiverId }) => {
        try {
          await storage.markMessagesAsRead(chatId, receiverId);
          
          // Notify the sender (the one whose messages were read)
          const senderSockets = onlineUsers.get(senderId);
          if (senderSockets) {
            for (const s of senderSockets) {
              io.to(s).emit('messages_read', { chatId, readerId: receiverId });
            }
          }
        } catch (err) {
          console.error('Mark as read error', err);
        }
      });

      // --- WebRTC signaling ---
      socket.on('call_offer', ({ to, offer, callId, from, callType }) => {
        const sockets = onlineUsers.get(to);
        if (!sockets) {
            io.to(socket.id).emit('call_failed', { message: 'Receiver is offline.' });
            return;
        }
        for (const s of sockets) {
          io.to(s).emit('call_offer', { from, offer, callId, callType });
        }
      });

      socket.on('call_answer', ({ to, answer, callId, from }) => {
        const sockets = onlineUsers.get(to);
        if (!sockets) return;
        for (const s of sockets) {
          io.to(s).emit('call_answer', { from, answer, callId });
        }
      });

      socket.on('ice_candidate', ({ to, candidate, from, callId }) => {
        const sockets = onlineUsers.get(to);
        if (!sockets) return;
        for (const s of sockets) {
          io.to(s).emit('ice_candidate', { from, candidate, callId });
        }
      });
      
      socket.on('call_end', ({ to, callId }) => {
        const sockets = onlineUsers.get(to);
        if (!sockets) return;
        for (const s of sockets) {
          io.to(s).emit('call_end', { callId });
        }
      });
      // ... more socket handlers
    });
    
    // --- PRESCRIPTION ROUTES ---
    app.post("/api/prescriptions", async (req, res) => {
      try {
        const prescriptionData = insertPrescriptionSchema.parse(req.body);
        const newPrescription = await storage.createPrescription(prescriptionData);
        res.status(201).json(newPrescription);
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ message: "Invalid prescription data.", errors: error.errors });
        } else {
          res.status(500).json({ message: "Failed to create prescription." });
        }
      }
    });

    app.get("/api/prescriptions/patient/:patientId", async (req, res) => {
      try {
        const prescriptions = await storage.getPrescriptionsByPatient(req.params.patientId);
        res.json(prescriptions);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch patient prescriptions." });
      }
    });

    app.get("/api/prescriptions/doctor/:doctorId", async (req, res) => {
      try {
        const prescriptions = await storage.getPrescriptionsByDoctor(req.params.doctorId);
        res.json(prescriptions);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch doctor prescriptions." });
      }
    });

    // --- NOTIFICATION ROUTES ---
    app.get("/api/notifications/user/:userId", async (req, res) => {
      try {
        const notifications = await storage.getNotificationsByUserId(req.params.userId);
        res.json(notifications);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch notifications." });
      }
    });

    app.put("/api/notifications/:id/read", async (req, res) => {
      try {
        const updatedNotification = await storage.markNotificationAsRead(req.params.id);
        if (!updatedNotification) {
          return res.status(404).json({ message: "Notification not found." });
        }
        res.json(updatedNotification);
      } catch (error) {
        res.status(500).json({ message: "Failed to update notification status." });
      }
    });
    
    // --- CONTACT MESSAGE ROUTE ---
    app.post("/api/contact", async (req, res) => {
      try {
        const messageData = insertContactMessageSchema.parse(req.body);
        const newContactMessage = await storage.createContactMessage(messageData);
        res.status(201).json(newContactMessage);
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ message: "Invalid contact message data.", errors: error.errors });
        } else {
          res.status(500).json({ message: "Failed to send contact message." });
        }
      }
    });


    return server;
}