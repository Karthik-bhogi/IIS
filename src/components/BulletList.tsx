/**
 * Renders text with lines starting with "- ", "* ", or "• " as a bullet list.
 * Other lines render as paragraphs.
 */
export default function BulletList({ text, className }: { text: string; className?: string }) {
  if (!text) return null

  const lines = text.split('\n').filter((l) => l.trim())
  const bullets: string[] = []
  const result: React.ReactNode[] = []

  const flushBullets = () => {
    if (bullets.length === 0) return
    result.push(
      <ul key={`ul-${result.length}`} className="list-disc list-inside space-y-1">
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    )
    bullets.length = 0
  }

  for (const line of lines) {
    const trimmed = line.trim()
    const match = trimmed.match(/^[-•*]\s+(.*)/)
    if (match) {
      bullets.push(match[1])
    } else {
      flushBullets()
      result.push(<p key={`p-${result.length}`}>{trimmed}</p>)
    }
  }
  flushBullets()

  return <div className={className}>{result}</div>
}
