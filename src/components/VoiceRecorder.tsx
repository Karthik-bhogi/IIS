'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Mic, Square } from 'lucide-react'

type SpeechRecognitionResultItem = {
  transcript: string
}

type SpeechRecognitionResultEntry = {
  isFinal: boolean
  0: SpeechRecognitionResultItem
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultEntry>
}

type SpeechRecognitionErrorLike = {
  error?: string
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type BrowserWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike
  webkitSpeechRecognition?: new () => SpeechRecognitionLike
}

export default function VoiceRecorder({ targetInputId }: { targetInputId: string }) {
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  const SpeechRecognitionConstructor = useMemo(() => {
    if (typeof window === 'undefined') {
      return undefined
    }
    const browserWindow = window as BrowserWindow
    return browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition
  }, [])

  const isSupported = Boolean(SpeechRecognitionConstructor)

  useEffect(() => {
    if (!SpeechRecognitionConstructor) {
      return
    }

    const recognition = new SpeechRecognitionConstructor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }

      if (finalTranscript !== '') {
        const targetElement = document.getElementById(targetInputId) as HTMLTextAreaElement | HTMLInputElement | null
        if (targetElement) {
          const currentVal = targetElement.value
          const prefix = currentVal.trim() === '' ? '- ' : '\n- '

          targetElement.value = currentVal + prefix + finalTranscript.trim()

          const inputEvent = new Event('input', { bubbles: true })
          targetElement.dispatchEvent(inputEvent)
        }
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorLike) => {
      console.error('Speech recognition error', event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // No-op: recognition may already be stopped.
        }
      }
    }
  }, [SpeechRecognitionConstructor, targetInputId])

  const toggleRecording = (e: React.MouseEvent) => {
    e.preventDefault()

    if (!isSupported) {
      alert('Voice transcription is unavailable in this browser. Please use a recent Chrome or Edge version. On iOS Safari, enable microphone access in browser settings and try again.')
      return
    }

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      try {
        recognitionRef.current?.start()
        setIsRecording(true)
      } catch (error) {
        console.error(error)
        alert('Could not start voice recording. Please check microphone permissions and browser support, then try again.')
      }
    }
  }

  if (!isSupported) return null

  return (
    <button
      type="button"
      onClick={toggleRecording}
      title="Voice Dictation"
      className={`p-2 rounded-full border transition-all flex items-center gap-2 ${
        isRecording
          ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600'
      }`}
    >
      {isRecording ? <Square size={16} fill="currentColor" /> : <Mic size={16} />}
      <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline-block">
        {isRecording ? 'Recording...' : 'Voice'}
      </span>
    </button>
  )
}
