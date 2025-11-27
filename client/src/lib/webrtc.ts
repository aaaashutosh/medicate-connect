// Types for WebRTC signaling
export interface CallOffer {
  offer: RTCSessionDescriptionInit;
  callerId: string;
  receiverId: string;
  callType: "audio" | "video";
}

export interface CallAnswer {
  answer: RTCSessionDescriptionInit;
  callerId: string;
  receiverId: string;
}

export interface IceCandidate {
  candidate: RTCIceCandidateInit;
  senderId: string;
  receiverId: string;
}

export interface CallInitiation {
  callerId: string;
  receiverId: string;
  callType: "audio" | "video";
}

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  
  // Configuration for STUN/TURN servers
  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };
  
  // Callbacks for UI updates
  private onIncomingCallCallback: ((data: CallInitiation) => void) | null = null;
  private onCallAcceptedCallback: (() => void) | null = null;
  private onCallEndedCallback: (() => void) | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  
  // Set callback for incoming calls
  public onIncomingCall(callback: (data: CallInitiation) => void) {
    this.onIncomingCallCallback = callback;
  }
  
  // Set callback for call acceptance
  public onCallAccepted(callback: () => void) {
    this.onCallAcceptedCallback = callback;
  }
  
  // Set callback for call end
  public onCallEnded(callback: () => void) {
    this.onCallEndedCallback = callback;
  }
  
  // Set callback for remote stream
  public onRemoteStream(callback: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback;
  }
  
  // Initialize WebRTC peer connection
  private initializePeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.configuration);
    
    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }
    
    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real implementation, you would send this to the server
        console.log("ICE candidate generated:", event.candidate);
      }
    };
    
    // Handle incoming tracks
    this.peerConnection.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(this.remoteStream);
        }
      }
      this.remoteStream.addTrack(event.track);
    };
    
    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log("Connection state:", this.peerConnection?.connectionState);
      if (this.peerConnection?.connectionState === "disconnected" || 
          this.peerConnection?.connectionState === "failed") {
        this.endCall();
      }
    };
  }
  
  // Initiate a call
  public async initiateCall(callerId: string, receiverId: string, callType: "audio" | "video") {
    try {
      // Get user media
      const constraints = {
        video: callType === "video",
        audio: true
      };
      
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Initialize peer connection
      this.initializePeerConnection();
      
      // Create offer
      if (this.peerConnection) {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        
        // In a real implementation, you would send this to the server
        console.log("Call offer created:", offer);
        return { success: true, localStream: this.localStream };
      }
      
      return { success: false, error: "Failed to create peer connection" };
    } catch (error: any) {
      console.error("Error initiating call:", error);
      return { success: false, error: error.message };
    }
  }
  
  // Handle incoming call offer
  public async handleCallOffer(offer: RTCSessionDescriptionInit, callerId: string, callType: "audio" | "video") {
    try {
      // Get user media
      const constraints = {
        video: callType === "video",
        audio: true
      };
      
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Initialize peer connection
      this.initializePeerConnection();
      
      // Set remote description
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        
        // Create answer
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        
        // In a real implementation, you would send this to the server
        console.log("Call answer created:", answer);
        return { success: true, localStream: this.localStream };
      }
      
      return { success: false, error: "Failed to create peer connection" };
    } catch (error: any) {
      console.error("Error handling call offer:", error);
      return { success: false, error: error.message };
    }
  }
  
  // Handle call answer
  public async handleCallAnswer(answer: RTCSessionDescriptionInit) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        if (this.onCallAcceptedCallback) {
          this.onCallAcceptedCallback();
        }
        return { success: true };
      }
      return { success: false, error: "No peer connection" };
    } catch (error: any) {
      console.error("Error handling call answer:", error);
      return { success: false, error: error.message };
    }
  }
  
  // Handle ICE candidate
  public async handleIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        return { success: true };
      }
      return { success: false, error: "No peer connection" };
    } catch (error: any) {
      console.error("Error handling ICE candidate:", error);
      return { success: false, error: error.message };
    }
  }
  
  // End the current call
  public endCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Removed onCallEndedCallback to prevent unwanted notifications
    console.log("Ended call and cleaned up resources.");
  }
  
  // Toggle mute audio
  public toggleMute() {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
        return !audioTracks[0].enabled; // Return new mute state
      }
    }
    return false;
  }
  
  // Toggle video
  public toggleVideo() {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !videoTracks[0].enabled;
        return !videoTracks[0].enabled; // Return new video state
      }
    }
    return false;
  }
  
  // Cleanup resources
  public cleanup() {
    this.endCall();
  }
}

// Export singleton instance
export const webRTCService = new WebRTCService();