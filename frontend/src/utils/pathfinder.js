// ── Layout constants ──────────────────────────────────────────────────────
export const COLS      = 10
export const SLOT_GAP_X = 1.5
export const CENTRE_GAP_X = 2.0 
export const OFFSET_X   = ((COLS - 1) * SLOT_GAP_X + CENTRE_GAP_X) / 2

export const LEVEL_HEIGHT = 8.0
export const SLOTS_PER_LEVEL = 60 // 6 rows * 10 cols

// perfectamente apilados (sin desfases laterales ni de profundidad)
export const LEVEL_OFFSET_X = 0.0
export const LEVEL_OFFSET_Z = 0.0

// Full 6-row configuration
export const ROW_Z        = [6.5, 3.5, 1.0, -2.0, -4.5, -7.5] 
export const PAIR_AISLE_Z = [5.0, -0.5, -6.0]           
export const INTER_LANE_Z = [2.25, -3.25]           

// Symmetric entry/exit gate
export const ENTRY_GATE_X = 6.5
export const ENTRY_GATE_Z = 9.0
export const EXIT_GATE_X  = -6.5
export const EXIT_GATE_Z  = -10.0

export const GATE_X = 0
export const GATE_Z = 9.0

export const MAIN_AISLE_X = 0          
export const ENTRY_AISLE_Z = 7.5       

// Lot bounding box
export const LOT_HALF_W  = OFFSET_X + 1.5
export const LOT_FRONT_Z = 9.0
export const LOT_BACK_Z  = -10.0

export function getSlotX(col) {
  const baseLine = col * SLOT_GAP_X - OFFSET_X
  return col >= 5 ? baseLine + CENTRE_GAP_X : baseLine
}

/**
 * Returns { waypoints, steps } for a path Gate → Slot or Slot → Gate.
 * Handles staggered levels: Top (1, slots 1-60), Bottom (0, slots 61-120, offset by X/Z).
 */
export function computePath({ slotId, type = 'entry' }) {
  const isEntry = type === 'entry'

  const level   = slotId <= SLOTS_PER_LEVEL ? 1 : 0
  const localId = (slotId - 1) % SLOTS_PER_LEVEL
  
  const col     = localId % COLS
  const row     = Math.floor(localId / COLS)
  const pairIdx = Math.floor(row / 2) 
  
  const topY    = LEVEL_HEIGHT + 0.35 // Gate height
  const groundY = 0.35                // Ground floor height
  
  // Offsets: Level 1 (Top) is at 0,0, while Level 0 (Bottom) is staggered by LEVEL_OFFSET_X, LEVEL_OFFSET_Z
  const offX    = level === 0 ? LEVEL_OFFSET_X : 0
  const offZ    = level === 0 ? LEVEL_OFFSET_Z : 0
  const targetY = level === 1 ? topY : groundY

  const slotX   = getSlotX(col) + offX
  const slotZ   = ROW_Z[row] + offZ
  const mainAisleX = MAIN_AISLE_X + offX
  const entryAisleZ = ENTRY_AISLE_Z + offZ
  const targetAisleZ = PAIR_AISLE_Z[pairIdx] + offZ

  const wps = []
  
  if (isEntry) {
    // Start at Top Gate (fixed location)
    wps.push([ENTRY_GATE_X, topY, ENTRY_GATE_Z])
    
    // If ground level, descend + move to staggered floor
    if (level === 0) {
      wps.push([ENTRY_GATE_X + offX, groundY, ENTRY_GATE_Z + offZ])
    }
    
    wps.push([ENTRY_GATE_X + offX, targetY, entryAisleZ])
    wps.push([mainAisleX, targetY, entryAisleZ])
    
    // Down the spine
    for (let p = 0; p < pairIdx; p++) {
        wps.push([mainAisleX, targetY, INTER_LANE_Z[p] + offZ])
    }
    wps.push([mainAisleX, targetY, targetAisleZ])
    wps.push([slotX, targetY, targetAisleZ])
    wps.push([slotX, targetY, slotZ])
  } else {
    // Exit path starts at slot
    wps.push([slotX, targetY, slotZ])
    wps.push([slotX, targetY, targetAisleZ])
    wps.push([mainAisleX, targetY, targetAisleZ])
    
    // Travel from aisle back towards exit gate
    for (let p = pairIdx; p < INTER_LANE_Z.length; p++) {
        wps.push([mainAisleX, targetY, INTER_LANE_Z[p] + offZ])
    }
    
    // Travel towards back wall
    const BACK_AISLE_Z = -8.75 + offZ
    wps.push([mainAisleX, targetY, BACK_AISLE_Z])
    wps.push([EXIT_GATE_X + offX, targetY, BACK_AISLE_Z])
    
    // If ground level, lift + move back to Top Gate (fixed location)
    if (level === 0) {
        wps.push([EXIT_GATE_X, topY, BACK_AISLE_Z - offZ]) // Bridge the Z-offset back to gate
    }
    
    wps.push([EXIT_GATE_X, topY, EXIT_GATE_Z])
  }

  const lateralSteps = Math.round(Math.abs(slotX - offX) / SLOT_GAP_X)
  const depthSteps   = row * 2 + (level === 0 ? 8 : 0) // Extra steps for staggered movement

  return { waypoints: wps, steps: lateralSteps + depthSteps }
}





