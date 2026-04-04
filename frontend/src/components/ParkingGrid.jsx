import React, { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Line } from '@react-three/drei'
import { useSpring, a } from '@react-spring/three'
import {
  computePath, getSlotX,
  ENTRY_GATE_X, ENTRY_GATE_Z,
  EXIT_GATE_X, EXIT_GATE_Z,
  COLS, SLOT_GAP_X, OFFSET_X,
  ROW_Z, PAIR_AISLE_Z, INTER_LANE_Z,
  GATE_X, GATE_Z, ENTRY_AISLE_Z,
  LOT_HALF_W, LOT_FRONT_Z, LOT_BACK_Z,
  MAIN_AISLE_X,
} from '../utils/pathfinder'



const LOT_DEPTH    = LOT_FRONT_Z - LOT_BACK_Z        // 18
const LOT_CENTER_Z = (LOT_FRONT_Z + LOT_BACK_Z) / 2 // 0
const WALL_H       = 2.8
const GATE_HW      = 2.2   // half-width of gate opening
const LANE_W       = LOT_HALF_W * 2 - 0.6            // usable lane width

// ── Parking slot ─────────────────────────────────────────────────────────
const GridSlot = ({ slotId, carInSlot, position }) => {
  const isOccupied = !!carInSlot
  const [sp, api] = useSpring(() => ({
    color: '#22c55e', scale: [1,1,1], posY: position[1],
    config: { tension: 170, friction: 14 }
  }))
  useEffect(() => {
    api.start({
      color: isOccupied ? '#ef4444' : '#22c55e',
      scale: isOccupied ? [1.06,1.06,1.06] : [1,1,1],
      posY:  isOccupied ? position[1] + 0.35 : position[1],
    })
  }, [isOccupied, api, position])

  return (
    <a.mesh
      position-x={position[0]} position-y={sp.posY} position-z={position[2]}
      scale={sp.scale} castShadow receiveShadow
    >
      <boxGeometry args={[1.3, 0.3, 1.8]} />
      <a.meshStandardMaterial color={sp.color} metalness={0.1} roughness={0.7} />
      <Html position={[0, 0.28, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          color:'#fff', textAlign:'center',
          background: isOccupied ? 'rgba(120,20,20,0.92)' : 'rgba(15,23,42,0.88)',
          padding:'3px 5px', borderRadius:'5px', fontSize:'10px',
          border:`1px solid ${isOccupied?'rgba(239,68,68,0.5)':'rgba(255,255,255,0.1)'}`,
          transition:'all 0.3s ease', whiteSpace:'nowrap'
        }}>
          <b>S{slotId}</b>
          {isOccupied && <>
            <br /><span style={{fontFamily:'monospace',color:'#93c5fd',fontSize:'9px'}}>{carInSlot.rfid}</span>
            <br /><span style={{fontSize:'8px',color:'#cbd5e1'}}>{carInSlot.frequency}Hz</span>
          </>}
        </div>
      </Html>
    </a.mesh>
  )
}

// ── Car symbol (body + cabin + wheels + lights) ──────────────────────────
const CarSymbol = ({ color }) => (
  <group>
    {/* Body */}
    <mesh position={[0, 0.1, 0]} castShadow>
      <boxGeometry args={[0.55, 0.2, 0.9]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.65} metalness={0.4} roughness={0.3}/>
    </mesh>
    {/* Cabin */}
    <mesh position={[0, 0.28, 0.04]}>
      <boxGeometry args={[0.38, 0.17, 0.44]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.2}/>
    </mesh>
    {/* Wheels */}
    {[[-0.28,0,0.3],[0.28,0,0.3],[-0.28,0,-0.3],[0.28,0,-0.3]].map((p,i)=>(
      <mesh key={i} position={p} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[0.11,0.11,0.1,10]}/>
        <meshStandardMaterial color="#111827" metalness={0.5}/>
      </mesh>
    ))}
    {/* Headlights */}
    {[[-0.16,0.1,0.46],[0.16,0.1,0.46]].map((p,i)=>(
      <mesh key={i} position={p}>
        <boxGeometry args={[0.1,0.06,0.04]}/>
        <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={2}/>
      </mesh>
    ))}
    {/* Taillights */}
    {[[-0.16,0.1,-0.46],[0.16,0.1,-0.46]].map((p,i)=>(
      <mesh key={i} position={p}>
        <boxGeometry args={[0.1,0.06,0.04]}/>
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5}/>
      </mesh>
    ))}
  </group>
)

// ── Animated car that follows waypoints ──────────────────────────────────
const MovingCar = ({ waypoints, color }) => {
  const ref  = useRef()
  const tRef = useRef(0)

  const segs = waypoints.slice(1).map((pt, i) => {
    const pr = waypoints[i]
    const dx = pt[0]-pr[0], dz = pt[2]-pr[2]
    return { len: Math.hypot(dx, dz), dx, dz }
  })
  const total  = segs.reduce((s,sg) => s+sg.len, 0)
  const cumLen = segs.reduce((acc,sg) => { acc.push((acc[acc.length-1]||0)+sg.len); return acc }, [])

  useFrame((_, delta) => {
    tRef.current = (tRef.current + delta * 0.3) % 1.08
    if (!ref.current) return
    const dist = Math.min(tRef.current, 1) * total
    for (let i = 0; i < cumLen.length; i++) {
      if (dist <= cumLen[i]) {
        const st = i === 0 ? 0 : cumLen[i-1]
        const t  = (dist - st) / (segs[i].len || 1)
        const a  = waypoints[i], b = waypoints[i+1]
        ref.current.position.set(a[0]+(b[0]-a[0])*t, a[1], a[2]+(b[2]-a[2])*t)
        if (segs[i].len > 0.01)
          ref.current.rotation.y = Math.atan2(segs[i].dx, segs[i].dz)
        break
      }
    }
  })

  return <group ref={ref} position={waypoints[0]}><CarSymbol color={color} /></group>
}

// ── Path line + dots + moving car ────────────────────────────────────────
const PathVisualizer = ({ slotId, type }) => {
  const { waypoints, steps } = computePath({ slotId, type })
  const isEntry   = type === 'entry'
  const pathColor = isEntry ? '#3b82f6' : '#f59e0b'
  const label     = isEntry ? '📥 Parking' : '📤 Retrieving'
  const gateX     = isEntry ? ENTRY_GATE_X : EXIT_GATE_X
  const gateZ     = isEntry ? ENTRY_GATE_Z : EXIT_GATE_Z


  return (
    <group>
      <Line points={waypoints} color={pathColor} lineWidth={3} />
      {waypoints.map((pt, i) => (
        <mesh key={i} position={pt}>
          <sphereGeometry args={[0.08, 10, 10]}/>
          <meshStandardMaterial
            color={i===0?'#22c55e': i===waypoints.length-1?'#ef4444': pathColor}
            emissive={pathColor} emissiveIntensity={0.9}
          />
        </mesh>
      ))}
      <MovingCar waypoints={waypoints} color={pathColor} />
      {/* Label at gate */}
      <Html position={[gateX, 1.8, gateZ]} center>

        <div style={{
          color:'#fff', background:'rgba(15,23,42,0.93)',
          padding:'5px 12px', borderRadius:'8px', fontSize:'12px',
          border:`1px solid ${pathColor}`, fontWeight:700,
          boxShadow:`0 0 14px ${pathColor}66`, whiteSpace:'nowrap'
        }}>
          {label} · Slot {slotId} · 🤖 {steps} steps
        </div>
      </Html>
    </group>
  )
}

// ── Driving lane strips + markings ────────────────────────────────────────
const DrivingLanes = () => {
  const Y = -0.24   // just above the floor

  // Dashed centre-line arrow helper rendered as small chevron meshes
  const CentreDashes = ({ zStart, zEnd, x = MAIN_AISLE_X, count = 5 }) => {
    const step = (zEnd - zStart) / (count + 1)
    return (
      <group>
        {Array.from({ length: count }, (_, i) => {
          const z = zStart + step * (i + 1)
          return (
            <mesh key={i} rotation={[-Math.PI/2, 0, 0]} position={[x, Y + 0.012, z]}>
              <planeGeometry args={[0.12, 0.55]} />
              <meshStandardMaterial color="#facc15" opacity={0.55} transparent />
            </mesh>
          )
        })}
      </group>
    )
  }

  // Arrow chevrons pointing in the −z direction (into the lot)
  const ArrowChevrons = ({ z, count = 4, laneWidth }) => {
    const spacing = laneWidth / (count + 1)
    const xStart  = -(laneWidth / 2)
    return (
      <group>
        {Array.from({ length: count }, (_, i) => {
          const x = xStart + spacing * (i + 1)
          return (
            <mesh key={i} rotation={[-Math.PI/2, 0, 0]} position={[x, Y + 0.013, z]}>
              <planeGeometry args={[0.08, 0.35]} />
              <meshStandardMaterial color="#facc15" opacity={0.45} transparent />
            </mesh>
          )
        })}
      </group>
    )
  }

  return (
    <group>
      {/* ── Main entry aisle (gate → row 0) ─────────────────────── */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[MAIN_AISLE_X, Y, (GATE_Z + ROW_Z[0]) / 2]}>
        <planeGeometry args={[LANE_W, GATE_Z - ROW_Z[0]]} />
        <meshStandardMaterial color="#1e3a5f" opacity={0.65} transparent />
      </mesh>
      {/* edge lines — main aisle */}
      {[-LOT_HALF_W + 0.32, LOT_HALF_W - 0.32].map((ex, i) => (
        <mesh key={i} rotation={[-Math.PI/2, 0, 0]} position={[ex, Y + 0.01, (GATE_Z + ROW_Z[0]) / 2]}>
          <planeGeometry args={[0.06, GATE_Z - ROW_Z[0]]} />
          <meshStandardMaterial color="#facc15" opacity={0.7} transparent />
        </mesh>
      ))}
      <CentreDashes zStart={ROW_Z[0]} zEnd={GATE_Z} count={5} />

      {/* ── Pair aisles (between paired rows) ───────────────────── */}
      {PAIR_AISLE_Z.map((az, i) => {
        const frontRowZ = ROW_Z[i * 2]      // row above the aisle
        const backRowZ  = ROW_Z[i * 2 + 1]  // row below the aisle
        const aisleH    = frontRowZ - backRowZ  // depth of the aisle gap
        return (
          <group key={i}>
            {/* Lane surface */}
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, Y, az]}>
              <planeGeometry args={[LANE_W, aisleH - 0.1]} />
              <meshStandardMaterial color="#0f2744" opacity={0.72} transparent />
            </mesh>
            {/* Edge stripes (yellow) */}
            {[-LOT_HALF_W + 0.32, LOT_HALF_W - 0.32].map((ex, j) => (
              <mesh key={j} rotation={[-Math.PI/2, 0, 0]} position={[ex, Y + 0.011, az]}>
                <planeGeometry args={[0.07, aisleH - 0.1]} />
                <meshStandardMaterial color="#facc15" opacity={0.65} transparent />
              </mesh>
            ))}
            {/* Centre dashes along z-axis (short — this lane is lateral) */}
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, Y + 0.011, az]}>
              <planeGeometry args={[LANE_W - 0.5, 0.07]} />
              <meshStandardMaterial color="#facc15" opacity={0.25} transparent />
            </mesh>
            {/* Row-label above lane */}
            <Html position={[-LOT_HALF_W + 0.7, 0.45, az]} center>
              <div style={{
                color:'#facc15', fontSize:'9px', fontWeight:700,
                background:'rgba(0,0,0,0.5)', padding:'1px 5px', borderRadius:3,
                border:'1px solid rgba(250,204,21,0.3)', whiteSpace:'nowrap',
                pointerEvents:'none'
              }}>
                🚗 AISLE {i + 1}
              </div>
            </Html>
          </group>
        )
      })}

      {/* ── Inter-pair lanes (between pairs of rows) ─────────────── */}
      {INTER_LANE_Z.map((lz, i) => {
        // the lane sits between pair i's back row and pair (i+1)'s front row
        const topZ    = ROW_Z[i * 2 + 1]    // bottom of the row above
        const bottomZ = ROW_Z[(i + 1) * 2]  // top of the row below
        const laneH   = topZ - bottomZ
        return (
          <group key={i}>
            {/* Lane surface — slightly lighter to distinguish */}
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, Y, lz]}>
              <planeGeometry args={[LANE_W, laneH - 0.1]} />
              <meshStandardMaterial color="#162032" opacity={0.60} transparent />
            </mesh>
            {/* White edge stripes */}
            {[-LOT_HALF_W + 0.32, LOT_HALF_W - 0.32].map((ex, j) => (
              <mesh key={j} rotation={[-Math.PI/2, 0, 0]} position={[ex, Y + 0.011, lz]}>
                <planeGeometry args={[0.07, laneH - 0.1]} />
                <meshStandardMaterial color="#ffffff" opacity={0.35} transparent />
              </mesh>
            ))}
            {/* Directional chevron arrows */}
            <ArrowChevrons z={lz} count={5} laneWidth={LANE_W} />
          </group>
        )
      })}
    </group>
  )
}

// ── Parking lot walls ─────────────────────────────────────────────────────
const LotWalls = () => {
  const wallMat = <meshStandardMaterial color="#334155" metalness={0.2} roughness={0.8}/>
  const W = LOT_HALF_W, frontZ = LOT_FRONT_Z, backZ = LOT_BACK_Z
  const y = WALL_H / 2, t = 0.3

  return (
    <group>
      {/* Back wall with Exit Gate gap at Back-Left side */}
      <mesh position={[(-W + (EXIT_GATE_X - 1.5)) / 2, y, backZ]}>
        <boxGeometry args={[Math.abs((EXIT_GATE_X - 1.5) - (-W)), WALL_H, t]}/>{wallMat}
      </mesh>
      <mesh position={[(EXIT_GATE_X + 1.5 + W) / 2, y, backZ]}>
        <boxGeometry args={[W - (EXIT_GATE_X + 1.5), WALL_H, t]}/>{wallMat}
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-W, y, LOT_CENTER_Z]}><boxGeometry args={[t, WALL_H, LOT_DEPTH]}/>{wallMat}</mesh>
      {/* Right wall */}
      <mesh position={[W, y, LOT_CENTER_Z]}><boxGeometry args={[t, WALL_H, LOT_DEPTH]}/>{wallMat}</mesh>
      
      {/* Front wall with Entry Gate gap at Front-Right side */}
      <mesh position={[(-W + (ENTRY_GATE_X - 1.5)) / 2, y, frontZ]}>
        <boxGeometry args={[W + (ENTRY_GATE_X - 1.5), WALL_H, t]}/>{wallMat}
      </mesh>
      <mesh position={[(ENTRY_GATE_X + 1.5 + W) / 2, y, frontZ]}>
        <boxGeometry args={[W - (ENTRY_GATE_X + 1.5), WALL_H, t]}/>{wallMat}
      </mesh>

      {/* Gate pillars (fixed size) */}
      <mesh position={[ENTRY_GATE_X - 1.5, y, frontZ]}><boxGeometry args={[t, WALL_H, t]}/>{wallMat}</mesh>
      <mesh position={[ENTRY_GATE_X + 1.5, y, frontZ]}><boxGeometry args={[t, WALL_H, t]}/>{wallMat}</mesh>
      <mesh position={[EXIT_GATE_X - 1.5, y, backZ]}><boxGeometry args={[t, WALL_H, t]}/>{wallMat}</mesh>
      <mesh position={[EXIT_GATE_X + 1.5, y, backZ]}><boxGeometry args={[t, WALL_H, t]}/>{wallMat}</mesh>
    </group>



  )
}

// ── Lot floor with row + aisle markings ───────────────────────────────────
const LotFloor = () => {
  const W = LOT_HALF_W
  return (
    <group position={[0, -0.27, LOT_CENTER_Z]}>
      {/* Main floor */}
      <mesh rotation={[-Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[W*2, LOT_DEPTH]}/>
        <meshStandardMaterial color="#0f172a"/>
      </mesh>
      {/* Row strips — light band under each slot row */}
      {ROW_Z.map((z, i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[0,0.01,z]}>
          <planeGeometry args={[W*2 - 0.6, 2.0]}/>
          <meshStandardMaterial color="#1e293b"/>
        </mesh>
      ))}
      {/* White slot-divider lines */}
      {ROW_Z.map((z, ri) =>
        Array.from({ length: COLS + 1 }, (_, ci) => {
          // If it's the middle divider (between col 4 and 5), skip it to leave the path clear
          if (ci === 5) return null
          
          let x
          if (ci < 5) {
            x = ci * SLOT_GAP_X - OFFSET_X - SLOT_GAP_X/2
          } else {
            x = ci * SLOT_GAP_X - OFFSET_X - SLOT_GAP_X/2 + 2.0 // matches CENTRE_GAP_X
          }

          return (
            <mesh key={`${ri}-${ci}`} rotation={[-Math.PI/2,0,0]} position={[x, 0.02, z]}>
              <planeGeometry args={[0.05, 1.9]}/>
              <meshStandardMaterial color="#ffffff" opacity={0.25} transparent/>
            </mesh>
          )
        })
      )}
      {/* Grid helper */}
      <gridHelper args={[W*2, 30, '#1e3a5f', '#1e293b']} position={[0,0.03,0]} rotation={[0,0,0]}/>
    </group>
  )
}

// ── Entry/Exit gate signs ──────────────────────────────────────────────────
const GateSign = ({ x, z, label, color = '#1e40af', icon = '🅿️' }) => (
  <group position={[x, 0, z]}>
    {/* Gate arch beam */}
    <mesh position={[0, WALL_H + 0.15, 0]}>
      <boxGeometry args={[GATE_HW * 2 + 0.3, 0.25, 0.25]}/>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5}/>
    </mesh>
    <Html position={[0, WALL_H + 0.7, 0]} center>
      <div style={{
        color:'#fff', background:'rgba(30,64,175,0.92)',
        padding:'4px 12px', borderRadius:'6px', fontSize:'12px',
        border:`1px solid ${color}`, fontWeight:700, whiteSpace:'nowrap',
        boxShadow:`0 0 12px rgba(59,130,246,0.5)`
      }}>{icon} {label}</div>
    </Html>
  </group>
)

const Gates = () => (
  <group>
    <GateSign x={ENTRY_GATE_X} z={ENTRY_GATE_Z} label="ENTRY" icon="📥" color="#3b82f6" />
    <GateSign x={EXIT_GATE_X} z={EXIT_GATE_Z} label="EXIT" icon="📤" color="#f59e0b" />
  </group>
)


// ── Main ParkingGrid ──────────────────────────────────────────────────────
export default function ParkingGrid({ totalSlots = 60, parkedCars = [], activePath = null }) {
  const slots = Array.from({ length: totalSlots }, (_, i) => i + 1)

  return (
    <div style={{ height: '620px', width: '100%', position: 'relative', overflow: 'hidden' }}>
      <h2 style={{
        textAlign:'center', color:'#3b82f6',
        position:'absolute', top:16, width:'100%', zIndex:10,
        margin:0, textShadow:'0 2px 4px rgba(0,0,0,0.6)'
      }}>🅿️ 3D Smart Parking Simulation {parkedCars.length >= totalSlots && <span style={{color: '#ef4444', marginLeft: '10px'}}>(FULL)</span>}</h2>


      {activePath && (() => {
        const { steps } = computePath({ slotId: activePath.slotId })
        const c = activePath.type === 'entry' ? '#3b82f6' : '#f59e0b'
        return (
          <div style={{
            position:'absolute', bottom:18, left:'50%', transform:'translateX(-50%)',
            zIndex:20, background:'rgba(15,23,42,0.94)',
            border:`1px solid ${c}`, borderRadius:10,
            padding:'8px 20px', color:'#fff', fontSize:14, fontWeight:700,
            whiteSpace:'nowrap', boxShadow:'0 4px 20px rgba(0,0,0,0.45)'
          }}>
            {activePath.type==='entry'?'📥 Parking':'📤 Retrieving'} → Slot {activePath.slotId}
            &nbsp;·&nbsp;🤖 {steps} steps
          </div>
        )
      })()}

      <Canvas shadows camera={{ position: [0, 18, 24], fov: 52 }}>
        <ambientLight intensity={0.5}/>
        <directionalLight position={[8, 18, 10]} intensity={1.6} castShadow
          shadow-mapSize-width={2048} shadow-mapSize-height={2048}/>
        <pointLight position={[0, 8, -5]} intensity={0.6} color="#93c5fd"/>

        <LotFloor />
        <DrivingLanes />
        <LotWalls />
        <Gates />

        {slots.map(slotId => {

          const carInSlot = parkedCars.find(c => c.slot?.id === slotId)
          const index = slotId - 1
          const col   = index % COLS
          const row   = Math.floor(index / COLS)
          const x     = getSlotX(col)
          const z     = ROW_Z[row]
          return (
            <GridSlot
              key={`${slotId}-${!!carInSlot}`}
              slotId={slotId} carInSlot={carInSlot}
              position={[x, 0, z]}
            />
          )
        })}

        {activePath && (
          <PathVisualizer slotId={activePath.slotId} type={activePath.type}/>
        )}

        <OrbitControls enablePan enableZoom enableRotate maxPolarAngle={Math.PI/2 - 0.05}/>
      </Canvas>
    </div>
  )
}