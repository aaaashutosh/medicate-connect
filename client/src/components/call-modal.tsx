import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { webRTCService } from "@/lib/webrtc";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerName: string;
  receiverName: string;
  callerId: string;
  receiverId: string;
  callType: "audio" | "video";
  onCallEnd: () => void;
}

export default function CallModal({
  isOpen,
  onClose,
  callerName,
  receiverName,
  callerId,
  receiverId,
  callType,
  onCallEnd
}: CallModalProps) {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<"connecting" | "ringing" | "active" | "ended">("connecting");
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize WebRTC
  useEffect(() => {
    if (isOpen) {
      initiateCall();
    }
    
    return () => {
      endCall();
    };
  }, [isOpen]);
  
  // Handle call timer
  useEffect(() => {
    if (callStatus === "active") {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callStatus]);
  
  const initiateCall = async () => {
    try {
      const result = await webRTCService.initiateCall(callerId, receiverId, callType);
      
      if (result.success && result.localStream) {
        if (localVideoRef.current && callType === "video") {
          localVideoRef.current.srcObject = result.localStream;
        }
        
        setCallStatus("ringing");
        
        // Simulate call connection after 2 seconds
        setTimeout(() => {
          setCallStatus("active");
        }, 2000);
      } else {
        throw new Error(result.error || "Failed to initiate call");
      }
    } catch (error: any) {
      console.error("Error initiating call:", error);
      toast({
        title: "Call Error",
        description: error.message || "Could not initiate call. Please try again.",
        variant: "destructive"
      });
      onClose();
    }
  };
  
  const toggleMute = () => {
    const isNowMuted = webRTCService.toggleMute();
    setIsMuted(isNowMuted);
  };
  
  const toggleVideo = () => {
    const isNowVideoOff = webRTCService.toggleVideo();
    setIsVideoOff(isNowVideoOff);
  };
  
  const endCall = () => {
    setCallStatus("ended");
    webRTCService.endCall();

    // Immediately call onCallEnd and close without delay
    onCallEnd();
    onClose();
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && endCall()}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 bg-gray-900 border-0">
        {/* Call Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white text-lg font-semibold">
                {callType === "video" ? "Video Call" : "Audio Call"}
              </h3>
              <p className="text-gray-300 text-sm">
                {callStatus === "connecting" && "Connecting..."}
                {callStatus === "ringing" && `Calling ${receiverName}...`}
                {callStatus === "active" && `${receiverName} · ${formatTime(callDuration)}`}
                {callStatus === "ended" && "Call ended"}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={endCall}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Video Area */}
        <div className="relative w-full h-full">
          {/* Remote Video */}
          {callType === "video" ? (
            <div className="w-full h-full bg-black">
              {callStatus === "active" ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="bg-gray-800 border-2 border-gray-700 rounded-lg w-full h-full flex items-center justify-center">
                    <User className="h-24 w-24 text-gray-500" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-white text-xl font-semibold">{receiverName}</p>
                    <p className="text-gray-400 mt-2">
                      {callStatus === "connecting" && "Connecting..."}
                      {callStatus === "ringing" && "Ringing..."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Audio call background
            <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="h-16 w-16 text-white" />
                </div>
                <h2 className="text-white text-2xl font-bold">{receiverName}</h2>
                <p className="text-gray-300 mt-2">
                  {callStatus === "connecting" && "Connecting..."}
                  {callStatus === "ringing" && "Ringing..."}
                  {callStatus === "active" && formatTime(callDuration)}
                  {callStatus === "ended" && "Call ended"}
                </p>
              </div>
            </div>
          )}
          
          {/* Local Video (Picture-in-Picture) */}
          {callType === "video" && callStatus === "active" && (
            <div className="absolute bottom-24 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-white/30">
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                {isVideoOff ? (
                  <div className="bg-gray-700 w-full h-full flex items-center justify-center">
                    <VideoOff className="h-8 w-8 text-gray-500" />
                  </div>
                ) : (
                  <div className="bg-gray-700 w-full h-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-500" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Call Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <div className="flex items-center justify-center space-x-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full ${isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"} text-white`}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            
            {callType === "video" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full ${isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"} text-white`}
              >
                {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white"
            >
              <PhoneOff className="h-7 w-7" />
            </Button>
          </div>
          
          {callStatus === "ended" && (
            <div className="text-center mt-4">
              <p className="text-white font-medium">Call ended</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}