// ── Layout constants ──────────────────────────────────────────────────────
export const COLS = 10
export const SLOT_GAP_X = 1.5
export const OFFSET_X = (COLS - 1) * SLOT_GAP_X / 2  // 6.75

//  3 pairs of rows.  Each pair shares a central driving aisle.
//  Between pairs: wider separation lane.
//
//  z = +9.0  ← Gate (entry / exit)
//  z = +6.5  ← Row 0  (pair-1 front)
//  z = +5.0  ← pair-1 aisle
//  z = +3.5  ← Row 1  (pair-1 back)
//  z = +2.25 ← inter-pair lane
//  z = +1.0  ← Row 2  (pair-2 front)
//  z = −0.5  ← pair-2 aisle
//  z = −2.0  ← Row 3  (pair-2 back)
//  z = −3.25 ← inter-pair lane
//  z = −4.5  ← Row 4  (pair-3 front)
//  z = −6.0  ← pair-3 aisle
//  z = −7.5  ← Row 5  (pair-3 back)
//  z = −9.0  ← back wall

export const ROW_Z         = [6.5, 3.5, 1.0, -2.0, -4.5, -7.5]
export const PAIR_AISLE_Z  = [5.0, -0.5, -6.0]
export const INTER_LANE_Z  = [2.25, -3.25]

// Symmetric entry/exit gate – centred at x = 0, in front of the lot
export const GATE_X = 0
export const GATE_Z = 9.0

// Lot bounding box (used for walls / floor)
export const LOT_HALF_W   = OFFSET_X + SLOT_GAP_X   // 8.25
export const LOT_FRONT_Z  = GATE_Z                   // 9
export const LOT_BACK_Z   = ROW_Z[5] - SLOT_GAP_X   // -9

/**
 * Returns { waypoints, steps } for the shortest path Gate → Slot.
 * For EXIT animation, caller should reverse the waypoints array.
 */
export function computePath({ slotId }) {
  const index   = slotId - 1
  const col     = index % COLS
  const row     = Math.floor(index / COLS)
  const pairIdx = Math.floor(row / 2)
  const isFront = row % 2 === 0

  const slotX = col * SLOT_GAP_X - OFFSET_X
  const slotZ = ROW_Z[row]
  const pathY = 0.35

  const wps = [
    [GATE_X, pathY, GATE_Z],
    [slotX,  pathY, ROW_Z[0] + 1.0],   // approach lane in front of row-0
  ]

  for (let p = 0; p < pairIdx; p++) {
    wps.push([slotX, pathY, INTER_LANE_Z[p]])
  }

  if (!isFront) {
    wps.push([slotX, pathY, PAIR_AISLE_Z[pairIdx]])
  }

  wps.push([slotX, pathY, slotZ])

  const lateralSteps = Math.round(Math.abs(slotX) / SLOT_GAP_X)
  const depthSteps   = pairIdx * 2 + (isFront ? 1 : 2)

  return { waypoints: wps, steps: lateralSteps + depthSteps }
}
