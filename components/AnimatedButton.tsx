'use client'

import { Button, ButtonProps } from '@mui/material'
import { motion } from 'framer-motion'

export function AnimatedButton({ children, ...props }: ButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button {...props}>
        {children}
      </Button>
    </motion.div>
  )
} 