'use client'

import React, { useEffect, useRef } from 'react'

interface Props {
  children: React.ReactNode
}

const ScrollReveal: React.FC<Props> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view')
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    el.classList.add('scroll-reveal')
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return <div ref={ref}>{children}</div>
}

export default ScrollReveal
