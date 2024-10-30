import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!isNaN(roomCode) && roomCode.trim() !== "") {
        socket.emit("join_room", {
          name,
          roomCode,
        });
      } else {
        alert("Please provide a room code using only digits");
      }
    },
    [name, roomCode, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { roomCode } = data;
      navigate(`/room/${roomCode}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("join_room", handleJoinRoom);
    return () => {
      socket.off("join_room", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gray-900 text-white px-4">
      {/* Navbar */}
      <header className="w-full flex justify-between items-center p-4 border-b border-gray-800">
        <h1 className="text-3xl font-bold text-indigo-500">FaceTime</h1>
        <button className="bg-indigo-500 text-white p-2 px-4 rounded-md">
          Create Room
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center mt-10 md:mt-20">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">
          Bringing People Closer, One Call at a Time
        </h2>
        <p className="text-lg text-gray-400 text-center max-w-md mb-8">
          Join live video streams and connect with friends in real-time. Enter a
          room code to start watching now!
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center w-full max-w-sm"
        >
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            required
            className="w-full p-3 m-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="w-full mt-4 p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition duration-200"
          >
            Join Room
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="mt-10 w-full border-t border-gray-800 py-4 text-center">
        <p className="text-gray-500">© 2024 FaceTime. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
