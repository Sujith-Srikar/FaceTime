import './App.css'
import Home from './pages/Home';
import Lobby from './pages/Lobby'
import Room from "./pages/Room";
import {Routes, Route} from "react-router-dom"

function App() {
  return (
    <>
      <Routes>
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomid" element={<Room />} />
      </Routes>
    </>
  )
}

export default App
