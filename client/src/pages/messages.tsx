import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  Paperclip,
  X,
  Image as ImageIcon,
  File as FileIcon,
  Smile,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  VideoOff,
  VideoIcon,
  MessageSquare,
  User as UserIcon,
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  Paperclip as PaperclipIcon,
  Zap,
} from "lucide-react";
import axios from "axios";
import { io, Socket } from "socket.io-client";

// --- Types (Ensure these are correctly mapped from your @shared/schema) ---
interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  name: string;
  profilePicture?: string;
  specialty?: string;
  isAvailable?: boolean;
    isOnline?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  chatId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'report';
  fileUrl?: string;
  fileMimeType?: string;
  read: boolean;
  delivered: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  participants: User[]; // Should contain only 2 users
  lastMessage?: Message;
  unreadCount?: number;
}
// --- END Types ---

// --- MOCK/HELPER COMPONENTS ---
// Note: CallScreen and PopupCallWindow components remain as defined in the provided snippet.
// For brevity, they are omitted here but must be included in the final file.

interface CallComponentProps {
  selectedConversation: User;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  callType: "audio" | "video";
  isMuted: boolean;
  isVideoEnabled: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const CallScreen: React.FC<CallComponentProps> = ({ selectedConversation, localVideoRef, remoteVideoRef, callType, isMuted, isVideoEnabled, onToggleMute, onToggleVideo, onEndCall, onMinimize }) => {
    const isVideoCall = callType === "video";
    return (
      <div className="fixed inset-0 z-[100] bg-gray-900 text-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
          <h2 className="text-3xl font-bold mb-2">{selectedConversation.name}</h2>
          <p className="text-lg text-gray-400 mb-8">In {isVideoCall ? "Video" : "Audio"} Call...</p>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl mb-4">
            {isVideoCall && (
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            )}
            {(!isVideoCall || !isVideoEnabled) && (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <Avatar className="w-32 h-32">
                                    <AvatarImage src={selectedConversation.profilePicture ?? undefined} alt={selectedConversation.name} />
                  <AvatarFallback>{selectedConversation.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
              </div>
            )}
            {isVideoCall && (
              <video ref={localVideoRef} autoPlay playsInline muted className="absolute top-4 right-4 w-40 h-28 object-cover border-2 border-white rounded-lg shadow-lg" />
            )}
          </div>
          <div className="flex gap-4 p-4 bg-gray-800/50 rounded-full">
            <Button size="icon" className="h-12 w-12 rounded-full bg-gray-600 hover:bg-gray-700 text-white" onClick={onToggleMute} title={isMuted ? "Unmute" : "Mute"}>
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
            {isVideoCall && (
              <Button size="icon" className="h-12 w-12 rounded-full bg-gray-600 hover:bg-gray-700 text-white" onClick={onToggleVideo} title={isVideoEnabled ? "Stop Video" : "Start Video"}>
                {isVideoEnabled ? <VideoOff className="h-6 w-6" /> : <VideoIcon className="h-6 w-6" />}
              </Button>
            )}
            <Button size="icon" className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700 text-white" onClick={onEndCall} title="Hang up">
              <Phone className="h-6 w-6 transform rotate-135" />
            </Button>
            {onMinimize && (
              <Button size="icon" className="h-12 w-12 rounded-full bg-gray-600 hover:bg-gray-700 text-white" onClick={onMinimize} title="Minimize">
                <Minimize className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

interface PopupCallWindowProps extends Pick<CallComponentProps, 'selectedConversation' | 'callType' | 'onEndCall' | 'onMaximize'> {}

const PopupCallWindow: React.FC<PopupCallWindowProps> = ({ selectedConversation, callType, onEndCall, onMaximize }) => {
  return (
    <div className="fixed right-4 bottom-4 z-50 bg-white dark:bg-gray-900 border rounded-xl p-3 shadow-2xl w-72 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={selectedConversation.profilePicture ?? undefined} alt={selectedConversation.name} />
            <AvatarFallback className="bg-purple-600 text-white text-xs">{selectedConversation.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[100px]">{selectedConversation.name}</div>
            <div className="text-xs text-gray-500">{callType === "video" ? "Video" : "Audio"} Call</div>
          </div>
        </div>
        <div className="flex gap-1">
          {onMaximize && (
            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={onMaximize} title="Maximize">
              <Maximize className="h-4 w-4" />
            </Button>
          )}
          <Button size="icon" className="h-8 w-8 rounded-full bg-red-500 text-white hover:bg-red-600" onClick={onEndCall} title="Hang up">
            <Phone className="h-4 w-4 transform rotate-135" />
          </Button>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 mt-1">
        Tap to go back to full screen
      </div>
    </div>
  );
}

const CATEGORIES = [
    { icon: "😀", key: "smileys", emojis: ["😀","😃","😄","😁","😆","😂","🤣","😊","🙂","🙃","😉","😍","🥰","😘","😗","😋","😛","😜","🤪","🤨","🤔","😐","😑","😶","🙄","😏","🥱","😴","😪","😥","😢","😭","🤩","🤗"] },
    { icon: "🐻", key: "animals", emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐤","🐣","🦄","🐴","🦋","🦝","🦁"] },
    { icon: "🍔", key: "food", emojis: ["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍒","🍑","🥭","🍍","🥥","🍅","🍆","🥑","🥕","🌽","🥬","🍕","🍔","🍟","🍣"] },
    { icon: "⚽", key: "activities", emojis: ["⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱","🏓","🏸","🥊","🥋","🎮","🎲","🎯","🧩","🎨","🎸","🎧","🎤"] },
    { icon: "❤️", key: "symbols", emojis: ["❤️","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","✨","⭐","🌟","🔥","💯","🔔","🔒","🔓","➕","➖","✅","❌"] },
];
// --- END MOCK/HELPER COMPONENTS ---

const formatMessageTime = (date: Date | string | null | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString([], { month: "short", day: "numeric" });
    return d.toLocaleDateString();
};

const getMessageStatusIcon = (message: Message, isPending: boolean, isSender: boolean) => {
    if (isPending) return <Loader2 className="h-3 w-3 animate-spin text-gray-500" />;
    if (isSender) {
      if (message.read) return <CheckCheck className="h-3 w-3 text-blue-500" />;
      return <Check className="h-3 w-3 text-gray-500" />;
    }
    return null;
}

const getMessageType = (mimeType?: string) => {
  if (!mimeType) return 'file';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.includes('pdf') || mimeType.includes('document')) return 'report';
  return 'file';
};


export default function MessagesPage(): JSX.Element {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [socket, setSocket] = useState<Socket | null>(null);
    const [location, navigate] = useLocation();
    const [selectedConversation, setSelectedConversation] = useState<User | null>(null);
    const [currentChat, setCurrentChat] = useState<Conversation | null>(null);
    const [messageInput, setMessageInput] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<{ file: File, progress: number, id: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState<'conversations' | 'contacts'>('conversations');
    const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});
    const typingTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const [isEmojiOpen, setIsEmojiOpen] = useState(false);
    const [emojiTab, setEmojiTab] = useState(0); 
    const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
    const emojiPickerRef = useRef<HTMLDivElement | null>(null);
    const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
    const [pendingMessages, setPendingMessages] = useState<Record<string, Message>>({});
    const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});
    
    // Ref to track the last total message count to prevent unnecessary scrolling
    const previousMessageCountRef = useRef(0);
    
    // WebRTC States and Refs
    const [isInCall, setIsInCall] = useState(false);
    const [isPopupCall, setIsPopupCall] = useState(false);
    const [callType, setCallType] = useState<"audio" | "video">("audio");
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    // --- Data Fetching Hooks ---

    // 1. Fetch Conversations (Chats)
    const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
        queryKey: ["/api/chats", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const res = await axios.get(`/api/chats/${user.id}`);
            return res.data;
        },
        enabled: !!user,
    });

    // 2. Fetch Doctors (for Patient's Contacts tab)
    const { data: doctors = [], isLoading: doctorsLoading } = useQuery<User[]>({
        queryKey: ["/api/doctors"],
        queryFn: async () => {
            const res = await axios.get("/api/doctors");
            return res.data;
        },
        enabled: !!user && user.role === 'patient',
    });

    // 3. Fetch Assigned Patients (for Doctor's Contacts tab)
    const { data: patients = [], isLoading: patientsLoading } = useQuery<User[]>({
        queryKey: ["/api/patients/doctor", user?.id],
        queryFn: async () => {
            if (!user || user.role !== 'doctor') return [];
            const res = await axios.get(`/api/patients/doctor/${user.id}`);
            return res.data;
        },
        enabled: !!user && user.role === 'doctor',
    });

    // 4. Fetch Messages for Selected Chat
    const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useQuery<Message[]>({
        queryKey: ["/api/chats/messages", currentChat?.id],
        queryFn: async () => {
            if (!currentChat) return [];
            const res = await axios.get(`/api/chats/${currentChat.id}/messages`);
            return res.data;
        },
        enabled: !!currentChat,
    });
    
    // --- Mutations ---

    // Mutation to create a new chat/get existing one when selecting a contact
    const createChatMutation = useMutation({
        mutationFn: async (targetUserId: string) => {
            if (!user) throw new Error("User not authenticated");
            const res = await axios.post("/api/chats", {
                userAId: user.id,
                userBId: targetUserId,
            });
            return res.data as Conversation;
        },
        onSuccess: (newChat) => {
            setCurrentChat(newChat);
            // Optionally refetch conversations to show the new chat in the list
            queryClient.invalidateQueries({ queryKey: ["/api/chats", user?.id] });
        },
    });

    // NOTE: sendTextMessageMutation has been removed as it was redundant and caused stuck loading states.
    // The message sending is now handled purely by Socket.IO and the pendingMessages state.

    // --- Core Logic & Handlers ---

    // Combine fetched messages with pending ones, sorted by timestamp
    const allMessages = useMemo(() => {
        const combined = [...messages, ...Object.values(pendingMessages)];
        // Sort by creation date (newest last)
        combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return combined;
    }, [messages, pendingMessages]);

    // Determine the list of contacts based on user role and current view
    const allContacts: User[] = useMemo(() => {
        if (!user) return [];
        if (view === 'conversations') {
            // Extract the other participant from the conversations list
            return conversations.map(chat => {
                const otherUser = chat.participants.find(p => p.id !== user.id);
                // Attach online status from presenceMap
                return otherUser ? { ...otherUser, isOnline: presenceMap[otherUser.id] || false } : null;
            }).filter((u): u is User & { isOnline: boolean } => !!u) as User[];
        }
        
        // Contacts view (all available doctors or assigned patients)
        const contactList = user.role === 'patient' ? doctors : patients;
        return contactList.map(u => ({ ...u, isOnline: presenceMap[u.id] || false }));

    }, [user, view, conversations, doctors, patients, presenceMap]);

    const filteredSidebarList = useMemo(() => {
        return allContacts.filter(u => 
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (u.specialty && u.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [allContacts, searchTerm]);

    // Handle selecting a conversation/contact
    const handleSelectConversation = useCallback(async (targetUser: User) => {
        if (!user) return;
        setSelectedConversation(targetUser);
        setView('conversations');
        
        // 1. Find existing chat
        const existingChat = conversations.find(c => c.participants.some(p => p.id === targetUser.id));
        
        if (existingChat) {
            setCurrentChat(existingChat);
        } else {
            // 2. Create new chat/Get existing via API
            createChatMutation.mutate(targetUser.id);
        }
        
        // Automatically mark messages as read when opening a chat
        if (currentChat?.id) {
            // Use socket to notify other user instantly, then refetch history
            socket?.emit('mark_as_read', { chatId: currentChat.id, senderId: targetUser.id, receiverId: user.id });
        }
        
    }, [user, conversations, createChatMutation, socket, currentChat?.id]);

    // Respect governor: parse query string for doctor to pre-select a conversation
    useEffect(() => {
        if (!user) return;
        try {
            const q = location.split('?')[1];
            if (!q) return;
            const params = new URLSearchParams(q);
            const doctorId = params.get('doctor');
            if (!doctorId) return;

            // Find an already-fetched user
            const contactCandidate = conversations
                .map(c => c.participants.find(p => p.id === doctorId))
                .find(Boolean) as User | undefined;

            (async () => {
                if (contactCandidate) {
                    handleSelectConversation(contactCandidate);
                } else {
                    // Fetch the user from API
                    try {
                        const res = await axios.get(`/api/users/${doctorId}`);
                        if (res.status === 200 && res.data) {
                            const fetchedUser = res.data as User;
                            handleSelectConversation(fetchedUser);
                        }
                    } catch (err) {
                        console.warn('Failed to fetch doctor for messages redirect', err);
                    }
                }
                // Optional: clear query param after navigation
                navigate('/messages', true);
            })();
        } catch (e) {
            console.warn('parse query for messages select', e);
        }
    }, [location, user, conversations, handleSelectConversation, navigate]);

    // Message input change handler (for typing indicator)
    const handleMessageInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessageInput(e.target.value);

        if (user && selectedConversation && socket) {
            const chatId = currentChat?.id || selectedConversation.id; // Use chat ID if available

            // Clear existing timeout if any
            if (typingTimeoutsRef.current[chatId]) {
                clearTimeout(typingTimeoutsRef.current[chatId]);
            }

            // Emit 'typing' start
            if (e.target.value.length > 0) {
                socket.emit('typing', { chatId, senderId: user.id, receiverId: selectedConversation.id, isTyping: true });
            }

            // Set a timeout to emit 'typing' stop
            typingTimeoutsRef.current[chatId] = setTimeout(() => {
                socket.emit('typing', { chatId, senderId: user.id, receiverId: selectedConversation.id, isTyping: false });
                delete typingTimeoutsRef.current[chatId];
            }, 3000);
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        // Insert emoji at cursor position if possible
        const el = messageInputRef.current;
        if (!el) {
            setMessageInput(prev => prev + emoji);
        } else {
            try {
                const start = el.selectionStart ?? messageInput.length;
                const end = el.selectionEnd ?? start;
                const newValue = messageInput.slice(0, start) + emoji + messageInput.slice(end);
                setMessageInput(newValue);

                // Wait a tick, then restore cursor position
                setTimeout(() => {
                    el.focus();
                    const caret = start + emoji.length;
                    el.selectionStart = el.selectionEnd = caret;
                }, 0);
            } catch (e) {
                setMessageInput(prev => prev + emoji);
            }
        }

        // Close the emoji picker
        setIsEmojiOpen(false);

        // Emit typing true and then false to maintain typing presence
        if (user && selectedConversation && socket) {
            const chatId = currentChat?.id || selectedConversation.id;
            try { socket.emit('typing', { chatId, senderId: user.id, receiverId: selectedConversation.id, isTyping: true }); } catch (e) {}
            setTimeout(() => { try { socket.emit('typing', { chatId, senderId: user.id, receiverId: selectedConversation.id, isTyping: false }); } catch (e) {} }, 1500);
        }
    };

    // Close picker on outside click
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            const target = e.target as Node;
            if (isEmojiOpen) {
                if (emojiPickerRef.current && emojiPickerRef.current.contains(target)) return;
                if (emojiButtonRef.current && emojiButtonRef.current.contains(target)) return;
                setIsEmojiOpen(false);
            }
        }
        if (isEmojiOpen) document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [isEmojiOpen]);
    
    // Send message handler (for both text and files)
    const handleSend = useCallback(async () => {
        // Fix: Removed sendTextMessageMutation.isPending check
        if (!user || !selectedConversation || (!messageInput.trim() && selectedFiles.length === 0)) return; 

        // Ensure chat exists before sending the message
        let finalChat = currentChat;
        if (!finalChat) {
            toast({ title: "Starting chat...", description: "Please wait while we initialize the conversation." });
            finalChat = await createChatMutation.mutateAsync(selectedConversation.id);
        }
        
        // 1. Send Text Message
        if (messageInput.trim()) {
            const tempId = `temp-${Date.now()}`;
            const textMessage: Message = {
                id: tempId,
                senderId: user.id,
                receiverId: selectedConversation.id,
                chatId: finalChat.id,
                content: messageInput.trim(),
                messageType: 'text',
                read: false,
                delivered: false,
                createdAt: new Date().toISOString(),
            };
            
            // Add to pending state for instant UI update
            setPendingMessages(prev => ({ ...prev, [tempId]: textMessage }));
            setMessageInput("");

            // Emit to Socket.IO for real-time delivery and backend persistence
            socket?.emit('message', textMessage);
            
            // Clear typing indicator
            socket?.emit('typing', { chatId: finalChat.id, senderId: user.id, receiverId: selectedConversation.id, isTyping: false });
        }
        
        // 2. Handle File Uploads
        if (selectedFiles.length > 0) {
            for (const fileItem of selectedFiles) {
                const formData = new FormData();
                formData.append('file', fileItem.file);

                try {
                    // Upload file via REST API
                    const uploadResponse = await axios.post("/api/upload/message-file", formData, {
                        onUploadProgress: (progressEvent) => {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                            setSelectedFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress: percentCompleted } : f));
                        },
                    });
                    const fileInfo = uploadResponse.data;

                    // Notify receiver via WebSocket with the file URL
                    const fileMessage: Message = {
                        id: `temp-${Date.now()}`,
                        senderId: user.id,
                        receiverId: selectedConversation.id,
                        chatId: finalChat.id,
                        content: fileInfo.fileName,
                        messageType: getMessageType(fileInfo.fileMimeType),
                        fileUrl: fileInfo.fileUrl,
                        fileMimeType: fileInfo.fileMimeType,
                        read: false,
                        delivered: false,
                        createdAt: new Date().toISOString(),
                    };
                    
                    socket?.emit('message', fileMessage);
                } catch (error) {
                    toast({ title: "File upload failed", description: `Could not send file: ${fileItem.file.name}`, variant: 'destructive' });
                }
            }
            setSelectedFiles([]); // Clear files after attempt
        }
    // Fix: Removed sendTextMessageMutation from dependency list
    }, [user, selectedConversation, messageInput, selectedFiles, currentChat, socket, toast, createChatMutation, queryClient]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // --- WebRTC Logic (Signal Handling) ---

    // Call End Handler
    const endCall = useCallback((notify: boolean = true) => {
      try {
        pcRef.current?.close();
        pcRef.current = null;
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((t) => t.stop());
          localStreamRef.current = null;
        }
        if (remoteStreamRef.current) {
          remoteStreamRef.current.getTracks().forEach((t) => t.stop());
          remoteStreamRef.current = null;
        }
        setIsInCall(false);
        setIsPopupCall(false);
        setIsMuted(false);
        setIsVideoEnabled(true);
        if (notify) socket?.emit('call_end', { to: selectedConversation?.id, callId: "current_call_id" });
      } catch (err) {
        console.warn("endCall", err);
      }
    }, [selectedConversation, socket]);

    // Setup RTCPeerConnection and Call offer logic (simplified)
    const prepareCall = useCallback(async (isInitialCall: boolean, targetUser: User, type: "audio" | "video", incomingOffer?: any) => {
        if (!user) return;

        // 1. Get media
        const constraints = {
            audio: true,
            video: type === "video" ? { width: 1280, height: 720 } : false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        
        // 2. Setup Peer Connection
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // Basic STUN server
        });
        pcRef.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.emit('ice_candidate', { 
                    to: targetUser.id, 
                    candidate: event.candidate, 
                    from: user.id, 
                    callId: 'current_call_id' 
                });
            }
        };

        // Handle remote tracks
        pc.ontrack = (event) => {
            remoteStreamRef.current = event.streams[0];
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        };

        if (isInitialCall) {
            // Caller: Create and send offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket?.emit('call_offer', { 
                to: targetUser.id, 
                offer: pc.localDescription, 
                callId: 'current_call_id', 
                from: user.id, 
                callType: type 
            });
            setIsInCall(true);
            setCallType(type);
        } else if (incomingOffer) {
            // Callee: Receive offer, create and send answer
            await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket?.emit('call_answer', { 
                to: incomingOffer.from, // Send answer back to the caller
                answer: pc.localDescription, 
                callId: 'current_call_id', 
                from: user.id 
            });
            setIsInCall(true);
            setCallType(type);
        }
    }, [user, socket]);

    // --- Socket.IO Connection and Listeners ---
    useEffect(() => {
        if (!user) return;

        // Connect to Socket.IO server, passing user ID for room/presence tracking
        const newSocket = io( 
            import.meta.env.VITE_API_URL || "http://localhost:5000", { 
            query: { userId: user.id }, 
            transports: ['websocket'],
            // ... other options
        });

        setSocket(newSocket);

        // --- Socket Listeners ---
        newSocket.on('connect', () => {
            console.log("Socket connected:", newSocket.id);
        });

        // 1. Message Received
        newSocket.on('message', (message: Message) => {
            console.log("New message received:", message);

            // If the message was a pending one sent by *this* user, remove it from pending.
            if (message.senderId === user.id && message.id.startsWith("temp-")) {
                setPendingMessages(prev => {
                    const newPending = { ...prev };
                    // Find and delete the temporary message by its temporary ID
                    const tempKey = Object.keys(newPending).find(key => newPending[key].content === message.content && newPending[key].createdAt === message.createdAt);
                    if (tempKey) {
                         delete newPending[tempKey]; 
                    }
                    return newPending;
                });
                
                // Refetch messages to get the persisted message from the server/DB
                queryClient.invalidateQueries({ queryKey: ["/api/chats/messages", message.chatId] });
            } else if (message.receiverId === user.id) {
                // If the message is for this user (receiver)
                // Refetch messages and conversations
                queryClient.invalidateQueries({ queryKey: ["/api/chats/messages", message.chatId] });
                queryClient.invalidateQueries({ queryKey: ["/api/chats", user.id] });
            }
        });

        // 2. Typing Indicator
        newSocket.on('typing', ({ chatId, senderId, isTyping }) => {
            setTypingMap(prev => ({ ...prev, [senderId]: isTyping }));
            
            // Clear the typing indicator after a delay if the user stops typing
            if (isTyping) {
                if (typingTimeoutsRef.current[senderId]) {
                    clearTimeout(typingTimeoutsRef.current[senderId]);
                }
                typingTimeoutsRef.current[senderId] = setTimeout(() => {
                    setTypingMap(prev => ({ ...prev, [senderId]: false }));
                    delete typingTimeoutsRef.current[senderId];
                }, 4000); // 4 seconds debounce for received typing state
            }
        });

        // 3. Presence Update
        newSocket.on('presence_update', ({ userId, isOnline }) => {
            setPresenceMap(prev => ({ ...prev, [userId]: isOnline }));
            queryClient.invalidateQueries({ queryKey: ["/api/chats", user.id] });
        });
        
        // 4. Remote messages marked as read
        newSocket.on('messages_read', ({ chatId, readerId }) => {
             // Invalidate the message query for the chat to update read status immediately
             queryClient.invalidateQueries({ queryKey: ["/api/chats/messages", chatId] });
             queryClient.invalidateQueries({ queryKey: ["/api/chats", user.id] });
        });
        
        newSocket.on('refresh_chats', () => {
            queryClient.invalidateQueries({ queryKey: ["/api/chats", user.id] });
        });

        // --- WebRTC Call Signaling Listeners ---

        // Incoming Call Offer
        newSocket.on('call_offer', async ({ from, offer, callType }) => {
            // Fetch caller details to display name
            const res = await axios.get(`/api/users/${from}`);
            const caller = res.data as User;
            setSelectedConversation(caller);
            
            // For now, auto-answer if no other call is active
            if (!isInCall) {
                prepareCall(false, caller, callType, { ...offer, from });
                toast({ title: `${caller.name} is calling`, description: `${callType} call incoming...` });
            }
        });

        // Incoming Call Answer
        newSocket.on('call_answer', async ({ answer }) => {
            if (pcRef.current) {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                toast({ title: "Call connected", description: "The other party has joined the call." });
            }
        });

        // Incoming ICE Candidate
        newSocket.on('ice_candidate', async ({ candidate }) => {
            try {
                if (pcRef.current && candidate) {
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch (e) {
                console.error('Error adding received ICE candidate', e);
            }
        });

        // Call End
        newSocket.on('call_end', () => {
            endCall(false);
            toast({ title: "Call ended", description: "The other party has disconnected." });
        });

        return () => {
            // Clean up socket on unmount
            newSocket.disconnect();
            // Clear all typing timeouts
            Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
        };
    }, [user, currentChat, selectedConversation, queryClient, toast, prepareCall, endCall, isInCall]);

    // Auto-Scroll on new messages (FIXED)
    useEffect(() => {
        const currentTotalMessages = allMessages.length;
        
        // Only scroll if the number of messages has actually increased
        if (currentTotalMessages > previousMessageCountRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: 'end' });
        }
        
        // Update the count for the next render
        previousMessageCountRef.current = currentTotalMessages;
        
    }, [allMessages]); 

    // Handle initial chat selection when conversations or contacts load
    useEffect(() => {
        if (!selectedConversation && filteredSidebarList.length > 0) {
            // Optionally select the first conversation or contact automatically
            // handleSelectConversation(filteredSidebarList[0]);
        }
    }, [filteredSidebarList, selectedConversation]);


    const getRenderedMessageContent = (message: Message) => {
        switch (message.messageType) {
            case 'image':
                return (
                    <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                        <img src={message.fileUrl} alt={message.content} className="max-w-xs max-h-64 object-cover rounded-lg" />
                    </a>
                );
            case 'file':
            case 'report':
                return (
                    <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <PaperclipIcon className="h-5 w-5 flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                            <p className="font-medium text-sm truncate">{message.content}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{message.messageType === 'report' ? 'Medical Report' : 'File'}</p>
                        </div>
                    </a>
                );
            case 'text':
            default:
                return <p>{message.content}</p>;
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const filesToAdd = Array.from(event.target.files).map(file => ({
                file,
                progress: 0,
                id: `${Date.now()}-${file.name}`,
            }));
            setSelectedFiles(prev => [...prev, ...filesToAdd]);
        }
    };

    const removeSelectedFile = (id: string) => {
        setSelectedFiles(prev => prev.filter(f => f.id !== id));
    };


    if (!user) {
        return <div className="p-8 text-center text-lg">Please log in to access the messaging system.</div>;
    }

    // --- Main Component Render ---
    return (
        <>
            {/* Full-screen Call Component */}
            {isInCall && !isPopupCall && selectedConversation && (
                <CallScreen
                    selectedConversation={selectedConversation}
                    localVideoRef={localVideoRef as React.RefObject<HTMLVideoElement>}
                    remoteVideoRef={remoteVideoRef as React.RefObject<HTMLVideoElement>}
                    callType={callType}
                    isMuted={isMuted}
                    isVideoEnabled={isVideoEnabled}
                    onToggleMute={() => setIsMuted(m => !m)}
                    onToggleVideo={() => setIsVideoEnabled(v => !v)}
                    onEndCall={() => endCall(true)}
                    onMinimize={() => setIsPopupCall(true)}
                />
            )}

            {/* Main Messaging UI */}
            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50 dark:bg-gray-900">
                {/* --- Sidebar (Conversations / Contacts) --- */}
                <div className="w-full sm:w-80 border-r dark:border-gray-700 flex flex-col flex-shrink-0 bg-white dark:bg-gray-800">
                    <div className="p-4 border-b dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h2>
                            <Button size="icon" variant="ghost">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search conversations or contacts..."
                                className="pl-10 focus-visible:ring-purple-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex space-x-2 mt-4">
                            <Button
                                variant={view === 'conversations' ? 'default' : 'outline'}
                                onClick={() => setView('conversations')}
                                className={view === 'conversations' ? 'bg-purple-600 hover:bg-purple-700' : 'text-gray-700 dark:text-gray-300'}
                            >
                                <MessageSquare className="h-4 w-4 mr-2" /> Chats
                            </Button>
                            <Button
                                variant={view === 'contacts' ? 'default' : 'outline'}
                                onClick={() => setView('contacts')}
                                className={view === 'contacts' ? 'bg-purple-600 hover:bg-purple-700' : 'text-gray-700 dark:text-gray-300'}
                            >
                                <UserIcon className="h-4 w-4 mr-2" /> Contacts
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        { (view === 'conversations' && conversationsLoading) || (view === 'contacts' && (doctorsLoading || patientsLoading)) ? (
                            <div className="p-4 text-center text-gray-500">
                                <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
                                Loading {view === 'conversations' ? 'chats' : 'contacts'}...
                            </div>
                        ) : filteredSidebarList.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                <Search className="h-6 w-6 mx-auto mb-2" />
                                No {view === 'conversations' ? 'Chats' : 'Contacts'} Found.
                            </div>
                        ) : (
                            filteredSidebarList.map((targetUser) => {
                                // Find corresponding chat for the conversation view
                                const chat = conversations.find(c => c.participants.some(p => p.id === targetUser.id));
                                const lastMessage = chat?.lastMessage;
                                const unreadCount = chat?.unreadCount || 0; // Assuming unreadCount is calculated elsewhere or in the backend fetch
                                const isSenderOfLastMessage = lastMessage?.senderId === user.id;

                                return (
                                    <div
                                        key={targetUser.id}
                                        className={`flex items-center p-4 cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors ${selectedConversation?.id === targetUser.id ? 'bg-purple-100 dark:bg-purple-900/50 border-l-4 border-purple-600' : ''}`}
                                        onClick={() => handleSelectConversation(targetUser)}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={targetUser.profilePicture ?? undefined} alt={targetUser.name} />
                                                <AvatarFallback className="bg-purple-600 text-white">{targetUser.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                            </Avatar>
                                            {targetUser.isOnline && (
                                                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                                            )}
                                        </div>
                                        <div className="ml-3 flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">{targetUser.name}</p>
                                                {view === 'conversations' && lastMessage && (
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        {formatMessageTime(lastMessage.createdAt)}
                                                        {isSenderOfLastMessage && getMessageStatusIcon(lastMessage, false, true)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className={`text-sm ${unreadCount > 0 ? "text-gray-900 font-semibold dark:text-white" : "text-gray-500"} truncate pr-2`}>
                                                    {targetUser.specialty && user.role === 'patient' && view === 'contacts' ? targetUser.specialty : (
                                                        view === 'conversations' && lastMessage ? (
                                                            `${isSenderOfLastMessage ? 'You: ' : ''}${lastMessage.messageType === 'text' ? lastMessage.content : `[${lastMessage.messageType}]`}`
                                                        ) : (
                                                            targetUser.role === 'doctor' ? `Dr. ${targetUser.specialty}` : 'Patient'
                                                        )
                                                    )}
                                                </p>
                                                {unreadCount > 0 && (
                                                    <Badge className="bg-purple-600 hover:bg-purple-700 text-white rounded-full h-5 px-2 flex-shrink-0">{unreadCount}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </ScrollArea>
                </div>

                {/* --- Chat Panel --- */}
                <div className="flex-1 flex flex-col">
                    <Card className="flex-1 flex flex-col rounded-none border-none shadow-none">
                        {!selectedConversation ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-8">
                                <Zap className="h-12 w-12 mb-4 text-purple-600" />
                                <h1 className="text-xl font-semibold">Select a Chat or Contact to Begin</h1>
                                <p className="text-sm text-center mt-2">
                                    Choose a conversation from the left sidebar to view message history, or find a doctor in the Contacts tab to start a new chat.
                                </p>
                            </div>
                        ) : (
                            <>
                                <CardHeader className="flex flex-row items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
                                    <div className="flex items-center">
                                        <Button size="icon" variant="ghost" className="sm:hidden mr-2" onClick={() => setSelectedConversation(null)}>
                                            <ArrowLeft className="h-5 w-5" />
                                        </Button>
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={selectedConversation.profilePicture ?? undefined} alt={selectedConversation.name} />
                                            <AvatarFallback className="bg-purple-600 text-white">{selectedConversation.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                        </Avatar>
                                        <div className="ml-3">
                                            <CardTitle className="text-lg text-gray-900 dark:text-white">{selectedConversation.name}</CardTitle>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {selectedConversation.role === 'doctor' ? selectedConversation.specialty : selectedConversation.role}
                                                {selectedConversation.isOnline && <span className="ml-2 text-green-500">• Online</span>}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Call Buttons */}
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" className="h-10 w-10 text-purple-600 hover:bg-purple-100 dark:hover:bg-gray-700" title="Audio Call" onClick={() => prepareCall(true, selectedConversation, 'audio')}>
                                            <Phone className="h-5 w-5" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-10 w-10 text-purple-600 hover:bg-purple-100 dark:hover:bg-gray-700" title="Video Call" onClick={() => prepareCall(true, selectedConversation, 'video')}>
                                            <Video className="h-5 w-5" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-10 w-10">
                                            <MoreVertical className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardHeader>

                                {/* Message Window */}
                                <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900">
                                    {messagesLoading && (
                                        <div className="text-center text-gray-500">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </div>
                                    )}
                                    {allMessages.length === 0 && !messagesLoading ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                            <MessageSquare className="h-8 w-8 mb-2" />
                                            <p className="font-medium">Start a conversation</p>
                                            <p className="text-sm mt-1">Send a message to {selectedConversation.name} to begin your chat.</p>
                                        </div>
                                    ) : (
                                        allMessages.map((message) => {
                                            const isSender = message.senderId === user.id;
                                            const isPending = message.id.startsWith("temp-");
                                            // Determine the user's details for the avatar
                                            const messageUser = isSender ? user : selectedConversation;
                                            return (
                                                <div key={message.id} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                                                    <div className={`flex items-end max-w-xs md:max-w-md ${isSender ? "flex-row-reverse" : "flex-row"}`}>
                                                        <Avatar className="h-8 w-8 flex-shrink-0">
                                                            <AvatarImage src={messageUser?.profilePicture ?? undefined} alt={messageUser?.name} />
                                                            <AvatarFallback className="bg-gray-300 text-gray-700 text-sm">{messageUser?.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                                        </Avatar>
                                                        <div className={`p-3 rounded-xl max-w-full break-words ${isSender ? "bg-purple-600 text-white rounded-tr-none mr-2" : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none ml-2"}`}>
                                                            {getRenderedMessageContent(message)}
                                                            <div className={`text-xs mt-1 flex items-center justify-end ${isSender ? "text-gray-200" : "text-gray-500 dark:text-gray-400"}`}>
                                                                {formatMessageTime(message.createdAt)}
                                                                {getMessageStatusIcon(message, isPending, isSender)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    {/* Typing Indicator */}
                                    {typingMap[selectedConversation.id] && (
                                        <div className="flex justify-start">
                                            <div className="flex items-end max-w-xs md:max-w-md flex-row">
                                                <Avatar className="h-8 w-8 flex-shrink-0">
                                                    <AvatarImage src={selectedConversation.profilePicture ?? undefined} alt={selectedConversation.name} />
                                                    <AvatarFallback className="bg-gray-300 text-gray-700 text-sm">{selectedConversation.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                                </Avatar>
                                                <div className="p-3 rounded-xl max-w-full ml-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none">
                                                    <span className="text-sm">
                                                        <span className="animate-pulse">...</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </CardContent>

                                {/* Input Panel */}
                                <CardContent className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                                    {/* File Previews */}
                                    {selectedFiles.length > 0 && (
                                        <div className="flex space-x-2 mb-3 overflow-x-auto p-1">
                                            {selectedFiles.map(item => (
                                                <div key={item.id} className="relative p-2 bg-white dark:bg-gray-800 rounded-lg flex items-center gap-2 shadow-sm border">
                                                    {item.file.type.startsWith('image/') ? (
                                                        <img src={URL.createObjectURL(item.file)} alt="Preview" className="h-10 w-10 object-cover rounded-md" />
                                                    ) : (
                                                        <FileIcon className="h-6 w-6 text-purple-600 flex-shrink-0" />
                                                    )}
                                                    <span className="text-sm max-w-[100px] truncate">{item.file.name}</span>
                                                    <Button size="icon" variant="ghost" className="h-5 w-5 absolute top-0 right-0 p-0 bg-red-500/80 hover:bg-red-600 text-white rounded-full -mt-2 -mr-2" onClick={() => removeSelectedFile(item.id)}>
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                    {/* Progress Bar (omitted for brevity, but could be added here) */}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Input & Action Buttons */}
                                    <div className="flex items-end space-x-2">
                                        {/* File Attach */}
                                        <Button size="icon" variant="ghost" className="h-10 w-10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0" title="Attach File" onClick={() => fileInputRef.current?.click()}>
                                            <Paperclip className="h-5 w-5" />
                                        </Button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            multiple
                                            accept="image/*, application/pdf, .doc, .docx"
                                            aria-label="Attach files"
                                            title="Attach files"
                                        />

                                                                             <Button
                                                                                 size="icon"
                                                                             variant="ghost"
                                                                             className="h-10 w-10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                                                                             title="Emoji"
                                                                             ref={emojiButtonRef}
                                                                             onClick={() => setIsEmojiOpen(prev => !prev)}
                                                                                     >
                                       <Smile className="h-5 w-5" />
                                       </Button>

                                        {/* Textarea Input */}
                                        <div className="relative flex-1 min-w-0">
                                            <Textarea
                                                ref={messageInputRef}
                                                value={messageInput}
                                                onChange={handleMessageInputChange}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Type a message..."
                                                rows={1}
                                                className="resize-none min-h-[40px] max-h-[100px] p-2 pr-12 focus-visible:ring-purple-500"
                                            />
                                            {/* Emoji Picker (positioned directly above the Textarea) */}
                                            {isEmojiOpen && (
                                                <div ref={emojiPickerRef} role="dialog" aria-label="Emoji picker" className="absolute left-0 bottom-full mb-2 w-full max-w-2xl md:max-w-md z-50">
                                                    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                                                        {/* Categories */}
                                                        <div className="flex items-center gap-1 px-2 py-1 border-b dark:border-gray-700 overflow-x-auto">
                                                            {CATEGORIES.map((c, idx) => (
                                                                <button key={c.key} title={c.key} className={`p-2 rounded-md ${emojiTab === idx ? 'bg-purple-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`} onClick={() => setEmojiTab(idx)}>
                                                                    <span className="text-lg leading-none">{c.icon}</span>
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* Emoji Grid */}
                                                        <div className="p-2 max-h-48 overflow-y-auto">
                                                            <div className="grid grid-cols-8 gap-2">
                                                                {CATEGORIES[emojiTab].emojis.map((emoji) => (
                                                                    <button
                                                                        key={emoji}
                                                                        type="button"
                                                                        onClick={() => handleEmojiSelect(emoji)}
                                                                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-xl flex items-center justify-center"
                                                                    >
                                                                        {emoji}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Send Button (FIXED) */}
                                            <Button 
                                                size="icon" 
                                                className="absolute right-2 bottom-2 h-8 w-8 bg-purple-600 hover:bg-purple-700 text-white" 
                                                onClick={handleSend} 
                                                // Fix: Removed sendTextMessageMutation.isPending check
                                                disabled={(messageInput.trim() === "" && selectedFiles.length === 0)}
                                            >
                                                {/* Fix: Removed loading icon for mutation */}
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </>
                        )}
                    </Card>
                </div>
            </div>
            
            {/* --- Popup Call Window Rendering --- */}
            {isInCall && isPopupCall && selectedConversation && (
                <PopupCallWindow
                    selectedConversation={selectedConversation}
                    callType={callType}
                    onEndCall={() => endCall(true)}
                    onMaximize={() => setIsPopupCall(false)}
                />
            )}
        </>
    );
}