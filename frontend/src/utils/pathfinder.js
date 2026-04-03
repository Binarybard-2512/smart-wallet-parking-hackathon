// ── Layout constants ──────────────────────────────────────────────────────
export const COLS      = 10
export const SLOT_GAP_X = 1.5
export const OFFSET_X   = (COLS - 1) * SLOT_GAP_X / 2   // 6.75

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
export const GATE_X = 0
export const GATE_Z = 9.0

// Main entry spine — car first travels straight down this before turning
export const MAIN_AISLE_X = 0          // centre column (x = 0)
export const ENTRY_AISLE_Z = 7.5       // just behind the gate, before row-0

// Lot bounding box (used for walls / floor)
export const LOT_HALF_W  = OFFSET_X + SLOT_GAP_X   // 8.25
export const LOT_FRONT_Z = GATE_Z                   // 9
export const LOT_BACK_Z  = ROW_Z[5] - SLOT_GAP_X   // -9

/**
 * Returns { waypoints, steps } for a STRICT L-shaped path Gate → Slot.
 *
 * Routing rules (no diagonal cuts):
 *   1. Gate  →  entry-aisle      (drive straight down centre, z drops)
 *   2. Entry-aisle → target aisle (drive down centre spine past inter-lanes)
 *   3. At target aisle  →  align X (turn & drive laterally along aisle row)
 *   4. Aisle → slot row          (turn & drive straight into slot)
 *
 * For EXIT the caller reverses the array so the car traces slot → gate.
 */
export function computePath({ slotId }) {
  const index   = slotId - 1
  const col     = index % COLS
  const row     = Math.floor(index / COLS)
  const pairIdx = Math.floor(row / 2)          // 0,1,2
  const isFront = row % 2 === 0

  const slotX  = col * SLOT_GAP_X - OFFSET_X
  const slotZ  = ROW_Z[row]
  const pathY  = 0.35

  // ── Step 1: enter the lot and drive straight down the centre spine ──────
  const wps = [
    [GATE_X, pathY, GATE_Z],           // gate
    [GATE_X, pathY, ENTRY_AISLE_Z],    // just past the gate, in main aisle
  ]

  // ── Step 2: travel down the centre spine to reach the correct aisle ─────
  //   Pass through each inter-pair lane that comes before our target pair.
  for (let p = 0; p < pairIdx; p++) {
    wps.push([GATE_X, pathY, INTER_LANE_Z[p]])
  }

  // Arrive at the aisle z-level of our target pair (still on centre spine)
  const targetAisleZ = PAIR_AISLE_Z[pairIdx]
  wps.push([GATE_X, pathY, targetAisleZ])

  // ── Step 3: turn and drive laterally along the aisle to the slot column ─
  wps.push([slotX, pathY, targetAisleZ])

  // ── Step 4: turn and drive straight into the slot ────────────────────────
  //   Front-row slots are above the aisle → drive from aisle up to slot.
  //   Back-row slots are below the aisle → drive from aisle down to slot.
  wps.push([slotX, pathY, slotZ])

  // ── Step count (for display) ─────────────────────────────────────────────
  const lateralSteps = Math.round(Math.abs(slotX) / SLOT_GAP_X)
  const depthSteps   = pairIdx * 2 + (isFront ? 1 : 2)

  return { waypoints: wps, steps: lateralSteps + depthSteps }
}
