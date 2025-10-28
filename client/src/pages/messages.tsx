import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Send, Phone, Video, MoreVertical, Search } from "lucide-react";
import CallModal from "@/components/call-modal";
import type { User, Message } from "@shared/schema";

interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<User | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = await fetch(`/api/conversations/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json() as Promise<Conversation[]>;
    },
    enabled: !!user,
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages", user?.id, selectedConversation?.id],
    queryFn: async () => {
      if (!user || !selectedConversation) return [];
      const response = await fetch(`/api/messages/${user.id}/${selectedConversation.id}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json() as Promise<Message[]>;
    },
    enabled: !!user && !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !selectedConversation) throw new Error("No user or conversation selected");

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedConversation.id,
          content,
          messageType: "text",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", user?.id, selectedConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", user?.id] });
    },
    onError: (error) => {
      console.error("Send message error:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessageMutation.mutate(messageInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCall = (targetUser: User) => {
    if (!user) return;
    setCallType("audio");
    setIsCallModalOpen(true);
  };

  const handleVideoCall = (targetUser: User) => {
    if (!user) return;
    setCallType("video");
    setIsCallModalOpen(true);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMessageTime = (date: Date | string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Please log in to view your messages.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
          {/* Conversations Sidebar */}
          <Card className="col-span-12 lg:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Messages</span>
                <Badge variant="secondary">{conversations.length}</Badge>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                {conversationsLoading ? (
                  <div className="p-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <div className="divide-y">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.user.id}
                        onClick={() => setSelectedConversation(conversation.user)}
                        className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          selectedConversation?.id === conversation.user.id ? 'bg-medicate-light/10' : ''
                        }`}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={conversation.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.user.name)}&size=200&background=8B5CF6&color=fff`}
                            alt={conversation.user.name} 
                          />
                          <AvatarFallback className="bg-medicate-light text-white">
                            {conversation.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {conversation.user.name}
                            </p>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatMessageTime(conversation.lastMessage.createdAt || new Date())}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {conversation.lastMessage.content}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-medicate-primary text-white text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          
                          {conversation.user.role === "doctor" && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {conversation.user.specialty || "Doctor"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <p>No conversations yet</p>
                    <p className="text-sm mt-1">Start a conversation with a doctor</p>
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-gray-400">Suggested doctors to chat with:</p>
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedConversation({ id: 'doctor1', name: 'Sushila Devi Singh', role: 'doctor' as const, specialty: 'Cardiologist', email: 'sushila.devi.singh@medicateconnect.com', password: '12345', phone: '+977 9876543210', experience: 8, license: 'MD123456', rating: 5, isAvailable: true, profilePicture: null, createdAt: null })}
                          className="justify-start"
                        >
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className="bg-medicate-light text-white text-xs">SD</AvatarFallback>
                          </Avatar>
                          Sushila Devi Singh - Cardiologist
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedConversation({ id: 'doctor2', name: 'Upendra Devkota', role: 'doctor' as const, specialty: 'Dermatologist', email: 'upendra.devkota@medicateconnect.com', password: '12345', phone: '+977 9876543211', experience: 10, license: 'MD123457', rating: 5, isAvailable: true, profilePicture: null, createdAt: null })}
                          className="justify-start"
                        >
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className="bg-medicate-light text-white text-xs">UD</AvatarFallback>
                          </Avatar>
                          Upendra Devkota - Dermatologist
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedConversation({ id: 'doctor3', name: 'Sanjay Rathi', role: 'doctor' as const, specialty: 'Pediatrician', email: 'sanjay.rathi@medicateconnect.com', password: '12345', phone: '+977 9876543212', experience: 12, license: 'MD123458', rating: 5, isAvailable: true, profilePicture: null, createdAt: null })}
                          className="justify-start"
                        >
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className="bg-medicate-light text-white text-xs">SR</AvatarFallback>
                          </Avatar>
                          Sanjay Rathi - Pediatrician
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="col-span-12 lg:col-span-8">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={selectedConversation.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.name)}&size=200&background=8B5CF6&color=fff`}
                          alt={selectedConversation.name} 
                        />
                        <AvatarFallback className="bg-medicate-light text-white">
                          {selectedConversation.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {selectedConversation.name}
                        </h3>
                        {selectedConversation.role === "doctor" && selectedConversation.specialty && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedConversation.specialty}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCall(selectedConversation)}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVideoCall(selectedConversation)}
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="p-0 flex flex-col h-full">
                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`flex animate-pulse ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                              i % 2 === 0 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.senderId === user.id ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.senderId === user.id
                                  ? "bg-medicate-primary text-white"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.senderId === user.id
                                  ? "text-medicate-light/70"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}>
                                {formatMessageTime(message.createdAt || new Date())}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {sendMessageMutation.isPending && (
                          <div className="flex justify-end">
                            <div className="bg-medicate-primary/70 text-white px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
                              <p className="text-sm">{messageInput}</p>
                              <p className="text-xs mt-1 text-medicate-light/70">Sending...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <p>No messages yet</p>
                        <p className="text-sm mt-1">Start a conversation</p>
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={sendMessageMutation.isPending}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sendMessageMutation.isPending}
                        className="bg-medicate-primary hover:bg-medicate-dark"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm mt-1">Choose a conversation from the sidebar to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
    
    <CallModal
      isOpen={isCallModalOpen}
      onClose={() => setIsCallModalOpen(false)}
      callerName={user?.name || "You"}
      receiverName={selectedConversation?.name || "Doctor"}
      callerId={user?.id || ""}
      receiverId={selectedConversation?.id || ""}
      callType={callType}
      onCallEnd={() => {
        toast({
          title: "Call ended",
          description: `Your ${callType} call with ${selectedConversation?.name} has ended`,
        });
      }}
    />
    </>
  );
}