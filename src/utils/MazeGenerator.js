/**
 * Generates a maze using Recursive Backtracking algorithm.
 * Returns a 2D grid where:
 *   1 = wall
 *   0 = floor
 */
export function generateMaze(cols, rows) {
  const gridCols = cols % 2 === 0 ? cols + 1 : cols
  const gridRows = rows % 2 === 0 ? rows + 1 : rows

  const grid = Array.from({ length: gridRows }, () => Array(gridCols).fill(1))
  const visited = Array.from({ length: gridRows }, () => Array(gridCols).fill(false))

  function inBounds(r, c) {
    return r > 0 && r < gridRows - 1 && c > 0 && c < gridCols - 1
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  function carve(r, c) {
    visited[r][c] = true
    grid[r][c] = 0

    const directions = shuffle([[0, 2], [0, -2], [2, 0], [-2, 0]])

    for (const [dr, dc] of directions) {
      const nr = r + dr
      const nc = c + dc
      if (inBounds(nr, nc) && !visited[nr][nc]) {
        grid[r + dr / 2][c + dc / 2] = 0
        carve(nr, nc)
      }
    }
  }

  carve(1, 1)

  // Remove ~15% of eligible interior walls to create loops / multiple paths
  for (let r = 2; r < gridRows - 2; r++) {
    for (let c = 2; c < gridCols - 2; c++) {
      if (grid[r][c] === 1) {
        const hLoop = grid[r][c - 1] === 0 && grid[r][c + 1] === 0
        const vLoop = grid[r - 1][c] === 0 && grid[r + 1][c] === 0
        if ((hLoop || vLoop) && Math.random() < 0.15) grid[r][c] = 0
      }
    }
  }

  return grid
}

export function getFloorCells(grid) {
  const cells = []
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 0) {
        cells.push({ row: r, col: c })
      }
    }
  }
  return cells
}

export function getFarCell(floorCells, fromRow, fromCol, minDist = 10) {
  const far = floorCells.filter(
    ({ row, col }) => Math.abs(row - fromRow) + Math.abs(col - fromCol) >= minDist
  )
  if (far.length === 0) return floorCells[Math.floor(Math.random() * floorCells.length)]
  return far[Math.floor(Math.random() * far.length)]
}

export function getRightmostCell(floorCells) {
  let maxCol = 0
  for (const c of floorCells) if (c.col > maxCol) maxCol = c.col
  const candidates = floorCells.filter(c => c.col === maxCol)
  candidates.sort((a, b) => a.row - b.row)
  return candidates[Math.floor(candidates.length / 2)]
}
