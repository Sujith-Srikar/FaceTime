import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import { useNavigate } from 'react-router-dom'

function Lobby() {
    const [email, setEmail] = useState("")
    const [room, setRoom] = useState("")

    const socket = useSocket()
    const navigate = useNavigate()

    const handleSubmit = useCallback((e)=>{
        e.preventDefault();
        socket.emit("join_room", {
            email,
            room
        })
    }, [email, room, socket])

    const handleJoinRoom = useCallback((data)=>{
        const {email, room} = data
        navigate(`/room/${room}`)
    },[navigate])

    useEffect(()=>{
        socket.on("join_room",handleJoinRoom)
        return ()=>{
            socket.off("join_room",handleJoinRoom)
        }
    }, [socket, handleJoinRoom])

  return (
    <>
      <h1>Lobby</h1>
      <form type="submit" onSubmit={handleSubmit}>
        <label htmlFor="iemail">Email</label>
        <input
          id="iemail"
          type="email"
          placeholder="enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-black"
        />
        <br />
        <br />
        <label htmlFor="room">Email</label>
        <input
          id="room"
          type="number"
          placeholder="enter your email"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="text-black"
        />
        <br />
        <br />
        <button>Join</button>
      </form>
    </>
  );
}

export default Lobby
