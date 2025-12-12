"use client"

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function onMove(e: MouseEvent) {
      if (!el) return
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
    }
    
    function onDown() {
      if (!el) return
      el.classList.add('small')
    }
    
    function onUp() {
      if (!el) return
      el.classList.remove('small')
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  // Show only on desktop via CSS media query
  return <div ref={ref} className="custom-cursor" aria-hidden="true" />
}

