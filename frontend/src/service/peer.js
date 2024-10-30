class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });
    }
  }

  async getAnswer(offer) {
    if (this.peer) {
      // Ensure the offer is in the correct format
      if (!offer || !offer.type || !offer.sdp) {
        throw new Error(
          "Invalid offer: Expected an object with 'type' and 'sdp' properties."
        );
      }
      await this.peer.setRemoteDescription(offer); // No need to wrap offer again
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(ans); // Directly pass ans
      return ans;
    }
  }

  async setLocalDescription(ans) {
    if (this.peer) {
      // Ensure answer has the correct structure
      if (!ans || !ans.type || !ans.sdp) {
        throw new Error(
          "Invalid answer: Expected an object with 'type' and 'sdp' properties."
        );
      }
      await this.peer.setRemoteDescription(ans); // Directly pass ans
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer); // Directly pass offer
      return offer;
    }
  }
}

export default new PeerService();
