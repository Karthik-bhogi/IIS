'use client'

import { useRef, ClipboardEvent, KeyboardEvent } from 'react'

interface BulletTextareaProps {
  name: string
  id: string
  defaultValue?: string
  placeholder?: string
  rows?: number
  required?: boolean
  className?: string
}

function toBulletLines(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return ''
      // Already a bullet
      if (/^[-•*]\s/.test(trimmed)) return trimmed
      return `- ${trimmed}`
    })
    .join('\n')
}

export default function BulletTextarea({ name, id, defaultValue, placeholder, rows = 4, required, className }: BulletTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text/plain')
    // Only auto-bullet if pasting multiple lines
    if (!pasted.includes('\n')) return

    e.preventDefault()
    const textarea = ref.current
    if (!textarea) return

    const formatted = toBulletLines(pasted)
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const current = textarea.value

    const before = current.substring(0, start)
    const after = current.substring(end)
    const prefix = before && !before.endsWith('\n') ? '\n' : ''

    textarea.value = before + prefix + formatted + after
    const newPos = (before + prefix + formatted).length
    textarea.selectionStart = textarea.selectionEnd = newPos

    // Trigger React's change tracking
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return
    const textarea = ref.current
    if (!textarea) return

    const { value, selectionStart } = textarea
    const currentLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
    const currentLine = value.substring(currentLineStart, selectionStart)

    // If current line starts with a bullet, continue with a bullet on next line
    if (/^[-•*]\s/.test(currentLine.trim())) {
      // If the line is just a bullet with no content, clear it instead
      if (/^[-•*]\s*$/.test(currentLine.trim())) return

      e.preventDefault()
      const before = value.substring(0, selectionStart)
      const after = value.substring(textarea.selectionEnd)
      textarea.value = before + '\n- ' + after
      const newPos = selectionStart + 3
      textarea.selectionStart = textarea.selectionEnd = newPos
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  return (
    <textarea
      ref={ref}
      name={name}
      id={id}
      defaultValue={defaultValue}
      placeholder={placeholder}
      rows={rows}
      required={required}
      className={className}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
    />
  )
}
