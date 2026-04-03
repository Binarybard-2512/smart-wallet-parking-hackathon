import { useState } from 'react'

export default function ExitPanel({ onExit, parkedCars }) {
  const [rfid, setRfid] = useState('')
  const [frequency, setFrequency] = useState('')
  const [result, setResult] = useState(null)

  const scanRfid = () => {
    const car = parkedCars.find(c => c.rfid === rfid)
    if (!car) {
      setResult({ error: 'RFID not found' })
      return
    }
    setResult({ 
      rfid, 
      foundCar: car.vehicle,
      slot: car.slot,
      expectedFreq: car.frequency,
      compositeKey: `${rfid}_${car.frequency}`
    })
  }

  const verifyAndRetrieve = () => {
    const car = parkedCars.find(c => c.rfid === rfid && c.frequency == frequency)
    if (!car || car.frequency != frequency) {
      setResult(prev => ({ ...prev, error: 'Frequency mismatch!' }))
      return
    }
    setResult(prev => ({ 
      ...prev, 
      verified: true,
      robotPath: `Retrieve from ${car.slot.row},${car.slot.col} → Exit C`
    }))
  }

  const confirmExit = () => {
    if (onExit) onExit()
    setResult(prev => ({ ...prev, status: 'EXITED' }))
  }

  return (
    <div className="panel">
      <h2>🚪 Exit Gate</h2>
      <input value={rfid} onChange={e => setRfid(e.target.value)} placeholder="RFID code" />
      <button onClick={scanRfid}>🏷️ Scan RFID</button>
      
      {result && !result.verified && (
        <>
          <input value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="Keyfob Hz" />
          <button onClick={verifyAndRetrieve}>🔐 Verify + Retrieve</button>
        </>
      )}
      
      {result?.verified && <button onClick={confirmExit}>✅ Exit Complete</button>}
      
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}