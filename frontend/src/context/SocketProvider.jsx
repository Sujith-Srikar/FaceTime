import React, { createContext, useContext, useMemo } from 'react'
import {io} from "socket.io-client"

const SocketContext = React.createContext()

export const useSocket = () => {
    const socket = useContext(SocketContext)
    return socket
}

function SocketProvider(props) {

    const socket = useMemo(() => io("https://facetime-4cmz.onrender.com"), []);
    
  return (
    <>
    <SocketContext.Provider value={socket}>
        {props.children}
    </SocketContext.Provider>
    </>
  )
}

export default SocketProvider
