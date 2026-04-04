import { useState } from 'react'
import EntryPanel from './components/EntryPanel.jsx'
import ExitPanel from './components/ExitPanel.jsx'
import ParkingGrid from './components/ParkingGrid.jsx'

export default function App() {
  const [occupiedSlots, setOccupiedSlots] = useState(0)
  const [totalSlots] = useState(60)
  const [parkedCars, setParkedCars] = useState([])
  const [activePath, setActivePath] = useState(null)
  
  const isFull = occupiedSlots >= totalSlots


  const handlePark = (carData) => {
    setOccupiedSlots(prev => Math.min(prev + 1, totalSlots))
    setParkedCars(prev => [...prev, carData])
  }

  const handleExit = (rfid) => {
    setOccupiedSlots(prev => Math.max(prev - 1, 0))
    setParkedCars(prev => prev.filter(car => car.rfid !== rfid))
  }

  return (
    <div className="app">
      <h1>🚗 Smart Wallet Parking System</h1>
      <p className="subtitle">RFID + Keyfob Frequency → AI Assignment</p>
      
      {isFull && (
        <div style={{
          background: '#ef4444', color: '#fff', padding: '10px',
          borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold',
          boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
        }}>
          🚨 PARKING FULL - CAPACITY REACHED 🚨
        </div>
      )}

      
      <div className="stats-grid">
        <div className="card"><h3>Total</h3><p>{totalSlots}</p></div>
        <div className="card"><h3>Occupied</h3><p>{occupiedSlots}</p></div>
        <div className="card"><h3>Free</h3><p>{totalSlots-occupiedSlots}</p></div>
      </div>

      <div className="panels">
        <EntryPanel
          onPark={handlePark}
          parkedCars={parkedCars}
          totalSlots={totalSlots}
          isFull={isFull}
          onSlotAssigned={(slotId) => setActivePath(slotId ? { slotId, type: 'entry' } : null)}
        />

        <ExitPanel
          onExit={(rfid) => handleExit(rfid)}
          parkedCars={parkedCars}
          onRetrieve={(slotId) => setActivePath(slotId ? { slotId, type: 'exit' } : null)}
        />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <ParkingGrid totalSlots={totalSlots} parkedCars={parkedCars} activePath={activePath} />
      </div>

      {parkedCars.length > 0 && (
        <div className="card" style={{marginTop: '2rem'}}>
          <h3>Last 5 Parked Vehicles:</h3>
          {parkedCars.slice(-5).map((car, i) => (
            <div key={i} style={{padding: '0.5rem', borderBottom: '1px solid #475569'}}>
              {car.vehicle} | RFID: {car.rfid} | Slot {car.slot?.id}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}