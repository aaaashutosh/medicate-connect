import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Video, 
  X, 
  Send, 
  Paperclip, 
  Mic, 
  Heart,
  Stethoscope,
  CheckCheck
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { Message } from "@shared/schema";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  status: "online" | "offline" | "busy";
  doctorId?: string;
}

export default function ChatModal({ isOpen, onClose, doctorName, status, doctorId }: ChatModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages between current user and doctor
  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/messages", user?.id, doctorId],
    enabled: !!user && !!doctorId && isOpen,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { content: string; receiverId: string; messageType?: string }) => {
      const response = await apiRequest("POST", "/api/messages", {
        senderId: user?.id,
        receiverId: messageData.receiverId,
        content: messageData.content,
        messageType: messageData.messageType || "text",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", user?.id, doctorId] });
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() || !doctorId || !user) return;
    
    sendMessageMutation.mutate({
      content: message.trim(),
      receiverId: doctorId,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (message) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-400";
      case "busy": return "bg-yellow-400";
      default: return "bg-gray-400";
    }
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px] p-0 flex flex-col">
        {/* Chat Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-medicate-primary rounded-full flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{doctorName}</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} animate-pulse`}></div>
                <span className="text-sm text-green-600 dark:text-green-400 capitalize">{status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => toast({ title: "Voice call feature", description: "Coming soon!" })}
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => toast({ title: "Video call feature", description: "Coming soon!" })}
            >
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center text-gray-500 dark:text-gray-400">Loading messages...</div>
            ) : messages && messages.length > 0 ? (
              messages.map((msg: Message) => (
                <div key={msg.id} className={`flex items-start space-x-3 ${msg.senderId === user?.id ? 'justify-end' : ''}`}>
                  {msg.senderId !== user?.id && (
                    <div className="w-8 h-8 bg-medicate-primary rounded-full flex items-center justify-center">
                      <Stethoscope className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-xs lg:max-w-md ${msg.senderId === user?.id ? 'order-first' : ''}`}>
                    <div className={`rounded-lg p-3 ${
                      msg.senderId === user?.id 
                        ? 'bg-medicate-primary text-white' 
                        : 'bg-white dark:bg-gray-800 shadow-sm'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-xs ${
                          msg.senderId === user?.id 
                            ? 'text-medicate-light' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatTime(msg.createdAt || new Date())}
                        </p>
                        {msg.senderId === user?.id && (
                          <div className="flex items-center space-x-1">
                            <CheckCheck className={`h-3 w-3 ${msg.isRead ? 'text-medicate-light' : 'text-medicate-light/60'}`} />
                            <span className="text-xs text-medicate-light">
                              {msg.isRead ? 'Read' : 'Delivered'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {msg.senderId === user?.id && (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <Heart className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-medicate-primary rounded-full flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Chat Input */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => toast({ title: "File attachment", description: "Feature coming soon!" })}
            >
              <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => toast({ title: "Voice message", description: "Feature coming soon!" })}
            >
              <Mic className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Button>
            <Input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={sendMessageMutation.isPending}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="btn-primary"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
