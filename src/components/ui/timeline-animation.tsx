'use client'

import { motion, useInView, type Variants } from "motion/react"
import { type ElementType, type RefObject } from "react"
import { cn } from "@/lib/utils"

interface TimelineContentProps {
  as?: ElementType
  animationNum: number
  timelineRef: RefObject<HTMLDivElement | null>
  customVariants: Variants
  className?: string
  children: React.ReactNode
}

function TimelineContent({
  as: Tag = "div",
  animationNum,
  timelineRef,
  customVariants,
  className,
  children,
}: TimelineContentProps) {
  const isInView = useInView(timelineRef, { once: true, amount: 0.1 })

  return (
    <motion.div
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: { staggerChildren: 0.1 },
        },
        hidden: {},
      }}
      className={cn(className)}
    >
      <Tag>
        <motion.span
          custom={animationNum}
          variants={customVariants}
          className={Tag === "p" ? "block" : undefined}
        >
          {children}
        </motion.span>
      </Tag>
    </motion.div>
  )
}

TimelineContent.displayName = "TimelineContent"

export { TimelineContent }
