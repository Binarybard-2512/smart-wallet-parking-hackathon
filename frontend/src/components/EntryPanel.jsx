import { useState } from 'react'

function generateRfid() {
  return `RFID-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}

export default function EntryPanel({ onPark, parkedCars }) {
  const [frequency, setFrequency] = useState('315.00')
  const [rfidCard, setRfidCard] = useState('')
  const [result, setResult] = useState(null)
  const [slotAssigned, setSlotAssigned] = useState(null)
  const [parked, setParked] = useState(false)

  const detectVehicle = () => {
    const rfid = generateRfid()  // Issue new RFID card
    const vehicles = {
      '315.00': { brand: 'Toyota', model: 'Camry', size: 'sedan' },
      '315.25': { brand: 'Honda', model: 'Civic', size: 'compact' },
      '433.00': { brand: 'Maruti', model: 'Swift', size: 'compact' },
      '868.00': { brand: 'BMW', model: 'X5', size: 'suv' }
    }
    const vehicle = vehicles[frequency] || { brand: 'Unknown', model: 'Vehicle', size: 'standard' }
    
    setRfidCard(rfid)
    setResult({ 
      rfid, 
      frequency: Number(frequency),
      vehicle: `${vehicle.brand} ${vehicle.model}`,
      size: vehicle.size,
      compositeKey: `${rfid}_${frequency}`
    })
  }

  const assignNearestSlot = () => {
    // NEAREST slots from Entry A (0,0) - Manhattan distance
    const candidates = [
      { row: 0, col: 1, type: 'compact', distance: 1 },
      { row: 1, col: 0, type: 'standard', distance: 1 },
      { row: 0, col: 2, type: 'compact', distance: 2 },
      { row: 1, col: 1, type: 'standard', distance: 2 },
      { row: 2, col: 0, type: 'standard', distance: 2 }
    ]
    
    // Find nearest size match
    const bestFit = candidates.find(s => s.type === result.size || s.type === 'standard') || candidates[0]
    setSlotAssigned(bestFit)
    setResult(prev => ({ ...prev, slot: bestFit }))
  }

  const confirmPark = () => {
    setParked(true)
    const carData = {
      rfid: rfidCard,
      frequency: Number(frequency),
      vehicle: result.vehicle,
      slot: slotAssigned,
      parkedAt: new Date().toLocaleTimeString()
    }
    if (onPark) onPark(carData)
  }

  const reset = () => {
    setResult(null)
    setSlotAssigned(null)
    setParked(false)
    setRfidCard('')
    setFrequency('315.00')
  }

  return (
    <div className="panel">
      <h2>📡 Entry Gate</h2>
      <input value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="Keyfob Hz" />
      <button onClick={detectVehicle}>🔍 Scan + Issue RFID</button>
      
      {result && !slotAssigned && (
        <div>
          <strong>RFID Issued:</strong> {rfidCard}
          <br/><button onClick={assignNearestSlot}>🎯 Nearest Slot</button>
        </div>
      )}
      
      {slotAssigned && !parked && <button onClick={confirmPark}>✅ Park</button>}
      {parked && <button onClick={reset}>➕ Next Car</button>}
      
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}