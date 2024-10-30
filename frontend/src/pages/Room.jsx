import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import PeerService from "../service/peer";

function Room() {
  const socket = useSocket();
  const [remoteSocketid, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [users, setUsers] = useState([]);

  const handleUserJoin = useCallback(({ name, id }) => {
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await PeerService.getOffer();
    socket.emit("call:user", { to: remoteSocketid, offer });
    setMyStream(stream);
  }, [remoteSocketid, socket]);

  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    setRemoteSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    console.log("Offer received:", offer);
    const ans = await PeerService.getAnswer(offer);
    socket.emit("call:accepted", { to: from, ans });
  }, []);

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      PeerService.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    async ({ from, offer }) => {
      const ans = PeerService.getAnswer(offer);
      PeerService.setLocalDescription(ans);
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await PeerService.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketid });
  }, [remoteSocketid, socket]);

  useEffect(() => {
    if (PeerService.peer) {
      PeerService.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    }

    return () => {
      if (PeerService.peer) {
        PeerService.peer.removeEventListener(
          "negotiationneeded",
          handleNegoNeeded
        );
      }
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    if (PeerService.peer) {
      PeerService.peer.addEventListener("track", (ev) => {
        const remoteStream = ev.streams;
        setRemoteStream(remoteStream[0]);
      });
    }
  }, []);

  const handleNegoIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await PeerService.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await PeerService.setLocalDescription(ans);
  }, []); 

  const handleRoomUsers = useCallback((users) => {
    const otherUsers = users.filter((user) => user.id !== socket.id);
    setUsers(otherUsers);
  },[users])

  useEffect(() => {
    socket.on("user:joined", handleUserJoin);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("room:users", handleRoomUsers);

    return () => {
      socket.off("user:joined", handleUserJoin);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("room:users", handleRoomUsers);
    };
  }, [
    socket,
    handleUserJoin,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoIncoming,
    handleNegoNeedFinal,
    handleRoomUsers
  ]);

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Main Container */}
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Video Chat Room
          </h1>
          <h3 className="text-xl mt-2 text-gray-300">
            {remoteSocketid ? `Connected` : "Waiting for someone to join..."}
          </h3>
        </div>

        {/* Video Streams Container */}
        <div className="relative w-full h-[80vh]">
          {/* Remote Stream (Full Width) */}
          {remoteStream && (
            <div className="w-full h-full rounded-xl overflow-hidden border-2 border-gray-700 bg-gray-800">
              <ReactPlayer
                playing
                url={remoteStream}
                width="100%"
                height="100%"
                className="object-cover"
              />
            </div>
          )}

          {/* My Stream (Top Left Overlay) */}
          {myStream && (
            <div className="absolute top-4 left-4 w-[300px] rounded-xl overflow-hidden border-2 border-blue-500 shadow-lg z-10">
              <ReactPlayer
                playing
                url={myStream}
                width="100%"
                height="100%"
                className="object-cover"
              />
            </div>
          )}

          {/* No Stream Placeholder */}
          {!remoteStream && !myStream && (
            <div className="w-full h-full flex items-center justify-center rounded-xl border-2 border-gray-700 bg-gray-800">
              <div className="text-center">
                <div className="text-6xl mb-4">👋</div>
                <p className="text-xl text-gray-400">
                  Start a call to begin streaming
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-4 backdrop-blur-md bg-gray-800/80 p-4 rounded-full shadow-lg">
            {myStream && (
              <button
                onClick={sendStreams}
                className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2"
              >
                <span>Send Stream</span>
              </button>
            )}
            {remoteSocketid && (
              <button
                onClick={handleCallUser}
                className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2"
              >
                <span>Call</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Room;