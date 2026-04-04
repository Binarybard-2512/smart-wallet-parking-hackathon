import { useState } from 'react'

function generateRfid() {
  return `RFID-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}

export default function EntryPanel({ onPark, parkedCars, totalSlots = 60, isFull, onSlotAssigned }) {

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
    const occupiedIds = parkedCars.map(c => c.slot?.id);
    let bestFit = null;
    for (let i = 1; i <= totalSlots; i++) {
        if (!occupiedIds.includes(i)) {
            bestFit = { id: i, type: result.size || 'standard' };
            break;
        }
    }
    if (!bestFit) return; // No slots available

    
    setSlotAssigned(bestFit)
    setResult(prev => ({ ...prev, slot: bestFit }))
    if (onSlotAssigned) onSlotAssigned(bestFit.id)
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
    if (onSlotAssigned) onSlotAssigned(null)
  }

  const reset = () => {
    setResult(null)
    setSlotAssigned(null)
    setParked(false)
    setRfidCard('')
    setFrequency('315.00')
    if (onSlotAssigned) onSlotAssigned(null)
  }

  return (
    <div className="panel">
      <h2>📡 Entry Gate</h2>
      {isFull ? (
        <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '10px' }}>
          ⚠️ NO VACANCY
        </div>
      ) : (
        <>
          <input value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="Keyfob Hz" />
          <button onClick={detectVehicle}>🔍 Scan + Issue RFID</button>
        </>
      )}

      
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