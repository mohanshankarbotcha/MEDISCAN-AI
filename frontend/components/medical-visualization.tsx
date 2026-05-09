"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, Heart, Brain, Dna, Stethoscope, Pill, Syringe, FileText } from "lucide-react"

// Pre-computed positions for orbiting icons (avoids trig hydration mismatch)
const orbitPositions = [
  { angle: 0,   top: "0%",    left: "50%" },
  { angle: 60,  top: "25%",   left: "93.3%" },
  { angle: 120, top: "75%",   left: "93.3%" },
  { angle: 180, top: "100%",  left: "50%" },
  { angle: 240, top: "75%",   left: "6.7%" },
  { angle: 300, top: "25%",   left: "6.7%" },
]

// Pre-computed positions for data connection lines
const dataLinePositions = [
  { angle: 0,   top: "0%",   left: "50%" },
  { angle: 45,  top: "14.6%", left: "85.4%" },
  { angle: 90,  top: "50%",  left: "100%" },
  { angle: 135, top: "85.4%", left: "85.4%" },
  { angle: 180, top: "100%", left: "50%" },
  { angle: 225, top: "85.4%", left: "14.6%" },
  { angle: 270, top: "50%",  left: "0%" },
  { angle: 315, top: "14.6%", left: "14.6%" },
]

// Pre-computed deterministic particle positions (instead of Math.random)
const particleData = [
  { left: "35%", top: "28%", xDrift: 8,  duration: 3.5 },
  { left: "57%", top: "45%", xDrift: -6, duration: 4.2 },
  { left: "45%", top: "51%", xDrift: 10, duration: 3.8 },
  { left: "36%", top: "42%", xDrift: -4, duration: 4.5 },
  { left: "42%", top: "32%", xDrift: 7,  duration: 3.2 },
  { left: "73%", top: "26%", xDrift: -9, duration: 4.0 },
  { left: "64%", top: "65%", xDrift: 5,  duration: 3.6 },
  { left: "56%", top: "70%", xDrift: -3, duration: 4.8 },
  { left: "70%", top: "61%", xDrift: 8,  duration: 3.3 },
  { left: "43%", top: "33%", xDrift: -7, duration: 4.1 },
  { left: "44%", top: "32%", xDrift: 6,  duration: 3.9 },
  { left: "50%", top: "31%", xDrift: -5, duration: 4.4 },
]

const orbitIcons = [Heart, Brain, Dna, Stethoscope, Pill, Activity]

export function MedicalVisualization() {
  // Only render particles after mount to avoid any hydration issues
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="relative w-full h-[500px] lg:h-[600px]">
      {/* Central Medical Core */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer rotating ring */}
        <motion.div
          className="absolute w-80 h-80 lg:w-96 lg:h-96 rounded-full border border-primary/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {/* Orbiting icons */}
          {orbitPositions.map((pos, i) => {
            const Icon = orbitIcons[i]
            return (
              <motion.div
                key={pos.angle}
                className="absolute w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-card border border-primary/30 flex items-center justify-center"
                style={{
                  top: pos.top,
                  left: pos.left,
                  transform: "translate(-50%, -50%)",
                }}
                animate={{ 
                  scale: [1, 1.15, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(45, 212, 191, 0)",
                    "0 0 20px 5px rgba(45, 212, 191, 0.3)",
                    "0 0 0 0 rgba(45, 212, 191, 0)"
                  ]
                }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
              >
                {Icon && <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />}
              </motion.div>
            )
          })}
        </motion.div>

        {/* Middle pulsing ring */}
        <motion.div
          className="absolute w-56 h-56 lg:w-72 lg:h-72 rounded-full border-2 border-dashed border-accent/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner ring with data points */}
        <motion.div
          className="absolute w-40 h-40 lg:w-52 lg:h-52 rounded-full border border-primary/40"
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {/* Data connection lines */}
          {dataLinePositions.map((pos) => (
            <motion.div
              key={`line-${pos.angle}`}
              className="absolute w-0.5 h-3 bg-gradient-to-t from-primary to-transparent"
              style={{
                top: pos.top,
                left: pos.left,
                transform: `translate(-50%, -50%) rotate(${pos.angle}deg)`,
              }}
              animate={{ opacity: [0.3, 1, 0.3], height: [12, 20, 12] }}
              transition={{ duration: 1.5, delay: pos.angle / 360, repeat: Infinity }}
            />
          ))}
        </motion.div>

        {/* Central core with heartbeat */}
        <motion.div
          className="absolute w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/50 flex items-center justify-center backdrop-blur-sm"
          animate={{ 
            scale: [1, 1.08, 1, 1.08, 1],
          }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity,
            times: [0, 0.1, 0.3, 0.4, 1]
          }}
        >
          {/* Inner glow */}
          <motion.div
            className="absolute inset-2 rounded-full bg-primary/10"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <Heart className="w-10 h-10 lg:w-14 lg:h-14 text-primary" />
        </motion.div>
      </div>

      {/* Floating data cards */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="absolute top-8 right-4 lg:right-8"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Report Scanned</p>
              <p className="text-sm font-semibold text-foreground">Blood Panel.pdf</p>
            </div>
          </div>
          <motion.div 
            className="mt-2 h-1 bg-muted rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ECG Line Animation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="absolute bottom-16 left-4 lg:left-8"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-foreground">Vital Signs</span>
          </div>
          <svg width="140" height="40" viewBox="0 0 140 40" className="overflow-visible">
            <motion.path
              d="M0 20 L20 20 L25 20 L30 5 L35 35 L40 10 L45 30 L50 20 L70 20 L75 20 L80 8 L85 32 L90 15 L95 25 L100 20 L140 20"
              fill="none"
              stroke="url(#ecgGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <defs>
              <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(45, 212, 191)" stopOpacity="0" />
                <stop offset="50%" stopColor="rgb(45, 212, 191)" stopOpacity="1" />
                <stop offset="100%" stopColor="rgb(45, 212, 191)" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </motion.div>

      {/* AI Analysis indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="absolute top-16 left-4 lg:left-12"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity }}
          className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-3 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <motion.div
              className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(45, 212, 191, 0.4)",
                  "0 0 0 8px rgba(45, 212, 191, 0)",
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Brain className="w-4 h-4 text-primary" />
            </motion.div>
            <div>
              <p className="text-xs text-muted-foreground">AI Processing</p>
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* DNA Helix floating */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="absolute bottom-8 right-8 lg:right-16"
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-3 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Dna className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Genetic Markers</p>
              <p className="text-sm font-semibold text-foreground">12 Found</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scanning lines effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Particle effects — only rendered client-side to avoid hydration mismatch */}
      {mounted && particleData.map((p, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-primary/60"
          style={{ left: p.left, top: p.top }}
          animate={{
            y: [0, -30, 0],
            x: [0, p.xDrift, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: i * 0.4,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  )
}
