/**
 * Renders text as a bullet list.
 * Lines starting with "- ", "* ", or "• " are treated as bullets.
 * If multiple lines exist but none have bullet prefixes, each line becomes a bullet.
 * Single-line text without a bullet prefix renders as a paragraph.
 */
export default function BulletList({ text, className }: { text: string; className?: string }) {
  if (!text) return null

  const lines = text.split('\n').filter((l) => l.trim())

  if (lines.length === 0) return null

  // Check if any lines have bullet prefixes
  const hasBulletPrefixes = lines.some((l) => /^[-•*]\s/.test(l.trim()))

  // If multiple lines and none have prefixes, treat all as bullets
  if (lines.length > 1 && !hasBulletPrefixes) {
    return (
      <div className={className}>
        <ul className="list-disc list-inside space-y-1">
          {lines.map((line, i) => (
            <li key={i}>{line.trim()}</li>
          ))}
        </ul>
      </div>
    )
  }

  // Single line without prefix — render as paragraph
  if (lines.length === 1 && !hasBulletPrefixes) {
    return <div className={className}><p>{lines[0].trim()}</p></div>
  }

  // Mixed or all-bullet content
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
