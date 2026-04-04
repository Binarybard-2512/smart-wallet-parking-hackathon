// ── Layout constants ──────────────────────────────────────────────────────
export const COLS      = 10
export const SLOT_GAP_X = 1.5
export const CENTRE_GAP_X = 2.0 // Extra gap in the middle for the car path
export const OFFSET_X   = ((COLS - 1) * SLOT_GAP_X + CENTRE_GAP_X) / 2

//  3 pairs of rows.  Each pair shares a central driving aisle.
//  Between pairs: wider separation (inter-pair) lane.
//
//  z = +9.0  ← Gate (entry / exit)
//  z = +7.5  ← Main entry aisle (car travels along x=0 here first)
//  z = +6.5  ← Row 0  (pair-1 front)
//  z = +5.0  ← pair-1 AISLE  ← car drives laterally here
//  z = +3.5  ← Row 1  (pair-1 back)
//  z = +2.25 ← inter-pair lane ← car crosses here
//  z = +1.0  ← Row 2  (pair-2 front)
//  z = −0.5  ← pair-2 AISLE  ← car drives laterally here
//  z = −2.0  ← Row 3  (pair-2 back)
//  z = −3.25 ← inter-pair lane ← car crosses here
//  z = −4.5  ← Row 4  (pair-3 front)
//  z = −6.0  ← pair-3 AISLE  ← car drives laterally here
//  z = −7.5  ← Row 5  (pair-3 back)
//  z = −9.0  ← back wall

export const ROW_Z        = [6.5,  3.5,  1.0, -2.0, -4.5, -7.5]
export const PAIR_AISLE_Z = [5.0, -0.5, -6.0]
export const INTER_LANE_Z = [2.25, -3.25]

// Symmetric entry/exit gate – centred at x = 0, in front of the lot
export const ENTRY_GATE_X = 6.5
export const ENTRY_GATE_Z = 9.0
export const EXIT_GATE_X  = -6.5
export const EXIT_GATE_Z  = -10.0


// (Keep these for backward compatibility if needed, but we'll use the specific ones)
export const GATE_X = 0
export const GATE_Z = 9.0


// Main entry spine — car first travels straight down this before turning
export const MAIN_AISLE_X = 0          // centre column (x = 0)
export const ENTRY_AISLE_Z = 7.5       // just behind the gate, before row-0

// Lot bounding box (used for walls / floor)
export const LOT_HALF_W  = OFFSET_X + 1.5
export const LOT_FRONT_Z = GATE_Z                   // 9
export const LOT_BACK_Z  = -10.0

/**
 * Returns the X-coordinate for a given column index, accounting for the central gap.
 */
export function getSlotX(col) {
  const baseLine = col * SLOT_GAP_X - OFFSET_X
  return col >= 5 ? baseLine + CENTRE_GAP_X : baseLine
}

/**
 * Returns { waypoints, steps } for a STRICT L-shaped path Gate → Slot or Slot → Gate.
 * @param {string} type - 'entry' or 'exit'
 */
export function computePath({ slotId, type = 'entry' }) {
  const isEntry = type === 'entry'

  const index   = slotId - 1
  const col     = index % COLS
  const row     = Math.floor(index / COLS)
  const pairIdx = Math.floor(row / 2)          // 0,1,2
  const isFront = row % 2 === 0

  const slotX  = getSlotX(col)
  const slotZ  = ROW_Z[row]
  const pathY  = 0.35
  const targetAisleZ = PAIR_AISLE_Z[pairIdx]

  // ── Step 1: Waypoints from gate to target aisle (or vice-versa) ──────
  const wps = []
  
  if (isEntry) {
    wps.push([ENTRY_GATE_X, pathY, ENTRY_GATE_Z])        // entry gate
    wps.push([ENTRY_GATE_X, pathY, ENTRY_AISLE_Z])       // alignment depth
    wps.push([MAIN_AISLE_X, pathY, ENTRY_AISLE_Z])       // merge to center spine
    
    // travel down the centre spine to reach the correct aisle
    for (let p = 0; p < pairIdx; p++) {
      wps.push([MAIN_AISLE_X, pathY, INTER_LANE_Z[p]])
    }
    wps.push([MAIN_AISLE_X, pathY, targetAisleZ])
    wps.push([slotX, pathY, targetAisleZ])
    wps.push([slotX, pathY, slotZ])
  } else {
    // Exit path starts at slot (Slot -> Aisle -> Center Spine -> Exit Gate)
    wps.push([slotX, pathY, slotZ])                     // start at slot
    wps.push([slotX, pathY, targetAisleZ])              // pull into aisle
    wps.push([MAIN_AISLE_X, pathY, targetAisleZ])       // move to center spine
    
    // travel from current aisle back to center spine... 
    // Actually, we need to travel TOWARDS the back wall for exit, 
    // but the center spine logic was designed gate-down.
    // Let's travel from targetAisleZ to the back-exit.
    
    // If pairIdx is 0 (front), we need to pass inter-lanes 0 and 1 to get to the back.
    // If pairIdx is 1, we pass inter-lane 1.
    // If pairIdx is 2, we are already near the back.
    for (let p = pairIdx; p < INTER_LANE_Z.length; p++) {
        wps.push([MAIN_AISLE_X, pathY, INTER_LANE_Z[p]])
    }
    
    // To reach back-left corner, we need to go to the back wall
    // Symmetric gap (2.5 units) to match entry gap.
    const BACK_AISLE_Z = -8.75
    wps.push([MAIN_AISLE_X, pathY, BACK_AISLE_Z])
    wps.push([EXIT_GATE_X, pathY, BACK_AISLE_Z])
    wps.push([EXIT_GATE_X, pathY, EXIT_GATE_Z])
  }

  // ── Step count (for display) ─────────────────────────────────────────────
  const lateralSteps = Math.round(Math.abs(slotX) / SLOT_GAP_X)
  const depthSteps   = pairIdx * 2 + (isFront ? 1 : 2)

  return { waypoints: wps, steps: lateralSteps + depthSteps }
}

