import { useState } from 'react'
import EntryPanel from './components/EntryPanel.jsx'
import ExitPanel from './components/ExitPanel.jsx'

export default function App() {
  const [occupiedSlots, setOccupiedSlots] = useState(0)
  const [totalSlots] = useState(58)
  const [parkedCars, setParkedCars] = useState([])

  const handlePark = (carData) => {
    setOccupiedSlots(prev => Math.min(prev + 1, totalSlots))
    setParkedCars(prev => [...prev, carData])
  }

  const handleExit = () => {
    setOccupiedSlots(prev => Math.max(prev - 1, 0))
    setParkedCars(prev => prev.slice(0, -1))
  }

  return (
    <div className="app">
      <h1>🚗 Smart Wallet Parking System</h1>
      <p className="subtitle">RFID + Keyfob Frequency → AI Assignment</p>
      
      <div className="stats-grid">
        <div className="card"><h3>Total</h3><p>{totalSlots}</p></div>
        <div className="card"><h3>Occupied</h3><p>{occupiedSlots}</p></div>
        <div className="card"><h3>Free</h3><p>{totalSlots-occupiedSlots}</p></div>
      </div>

      <div className="panels">
        <EntryPanel onPark={handlePark} parkedCars={parkedCars} />
        <ExitPanel onExit={handleExit} parkedCars={parkedCars} />
      </div>

      {parkedCars.length > 0 && (
        <div className="card" style={{marginTop: '2rem'}}>
          <h3>Parked Vehicles:</h3>
          {parkedCars.slice(-5).map((car, i) => (
            <div key={i} style={{padding: '0.5rem', borderBottom: '1px solid #475569'}}>
              {car.vehicle} | RFID: {car.rfid} | Slot {car.slot?.row},{car.slot?.col}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}