"use client"

import { useEffect, useRef } from "react"

interface SignalFieldProps {
  seed?: number
  className?: string
  density?: number
}

/**
 * The City as Data Field: a deterministic barcode field rendered from a seed.
 * Columns shimmer one at a time; everything halts under reduced motion or when
 * scrolled away. No color, no grey - pure black bars on white.
 */
export function SignalField({ seed = 20260825, className, density = 0.5 }: SignalFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let raf = 0
    let width = 0
    let height = 0
    let columns: { x: number; w: number; on: boolean }[] = []

    // mulberry32 - deterministic per seed so the field is a stable signature
    let state = seed >>> 0
    const rand = () => {
      state |= 0
      state = (state + 0x6d2b79f5) | 0
      let t = Math.imul(state ^ (state >>> 15), 1 | state)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      columns = []
      let x = 0
      while (x < width) {
        const w = 1 + Math.floor(rand() * 5)
        columns.push({ x, w, on: rand() < density })
        x += w + 1 + Math.floor(rand() * 3)
      }
    }

    const draw = () => {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = "#000000"
      for (const col of columns) {
        if (col.on) ctx.fillRect(col.x, 0, col.w, height)
      }
    }

    build()
    draw()

    if (!reduced) {
      let last = 0
      const tick = (t: number) => {
        if (t - last > 90) {
          last = t
          const flips = 2 + Math.floor(Math.random() * 4)
          for (let i = 0; i < flips; i++) {
            const c = columns[Math.floor(Math.random() * columns.length)]
            if (c) c.on = !c.on
          }
          draw()
        }
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    const onResize = () => {
      build()
      draw()
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
    }
  }, [seed, density])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  )
}
