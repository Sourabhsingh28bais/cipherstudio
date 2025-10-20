'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical'
  onResize: (delta: number) => void
  className?: string
}

export function ResizeHandle({ direction, onResize, className }: ResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false)
  const startPos = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true)
    startPos.current = direction === 'horizontal' ? e.clientY : e.clientX
    document.body.style.cursor = direction === 'horizontal' ? 'row-resize' : 'col-resize'
    document.body.style.userSelect = 'none'
  }, [direction])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return

    const currentPos = direction === 'horizontal' ? e.clientY : e.clientX
    const delta = currentPos - startPos.current
    onResize(delta)
    startPos.current = currentPos
  }, [isResizing, direction, onResize])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  // Add global event listeners
  useState(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  })

  return (
    <div
      className={cn(
        'resize-handle bg-border hover:bg-accent-foreground transition-colors',
        direction === 'horizontal' ? 'h-1 cursor-row-resize' : 'w-1 cursor-col-resize',
        isResizing && 'bg-accent-foreground',
        className
      )}
      onMouseDown={handleMouseDown}
    />
  )
}
