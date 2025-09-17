import * as React from 'react'
import { clsx } from 'clsx'

const buttonVariants = {
  default: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 py-2',
  outline: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2',
  ghost: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2',
  sm: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-8 px-3 py-1.5'
}

export function Button({ 
  className = '',
  variant = 'default',
  size,
  children,
  ...props 
}) {
  const baseClass = buttonVariants[variant] || buttonVariants.default
  const sizeClass = size === 'sm' ? 'h-8 px-3 py-1.5' : 'h-9 px-4 py-2'
  
  return (
    <button
      className={clsx(baseClass, className)}
      {...props}
    >
      {children}
    </button>
  )
}