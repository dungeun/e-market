"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Sonner 기반 Toast 타입 정의
export interface ToastProps {
  className?: string
  variant?: "default" | "destructive"
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

export type ToastActionElement = React.ReactElement<{
  altText: string
  onClick: () => void
}>

// 간단한 Toast Action 컴포넌트
export const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    altText: string
  }
>(({ className, altText, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = "ToastAction"

// 기본 내보내기 (backward compatibility)
export const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const ToastViewport = () => null
export const Toast = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const ToastTitle = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const ToastDescription = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const ToastClose = () => null