/** Deterministic QR-style matrix for the demo (finder patterns + hashed modules). */
export default function QRCode({ value, size = 200 }: { value: string; size?: number }) {
  const n = 29
  let h = 2166136261
  for (const ch of value) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  const rand = (i: number) => {
    let x = (h ^ Math.imul(i + 1, 2654435761)) >>> 0
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    return (x >>> 0) % 100 < 47
  }
  const inFinder = (r: number, c: number) => [[0, 0], [0, n - 7], [n - 7, 0]].some(([fr, fc]) => r >= fr - 1 && r <= fr + 7 && c >= fc - 1 && c <= fc + 7)
  const cells: [number, number][] = []
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!inFinder(r, c) && rand(r * n + c)) cells.push([r, c])
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} fill="#24332d" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="#24332d" />
    </g>
  )
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} width={size} height={size} role="img" aria-label={`Mã QR tham gia lớp ${value}`} shapeRendering="crispEdges" className="rounded-[8px] bg-white">
      <rect x={-2} y={-2} width={n + 4} height={n + 4} fill="#fff" />
      {cells.map(([r, c]) => <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#24332d" />)}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  )
}
