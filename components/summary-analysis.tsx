"use client"

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Shield, TrendingUp, DollarSign } from "lucide-react"

interface AnalysisResult {
  detected_condition: string
  risk_score: number
  condition_level: "Low" | "Medium" | "High"
  clinical_explanation: string
  recommended_guidance: string
  estimated_cost: string
  extracted_metrics: Record<string, string>
  reasoning: string
}

interface SummaryAnalysisProps {
  result: AnalysisResult | null
}

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration,
        onUpdate: (v) => setDisplayValue(Math.round(v)),
      })
      return () => controls.stop()
    }
  }, [isInView, value, duration])

  return <span ref={ref}>{displayValue}</span>
}

function RiskMeter({ score }: { score: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const rotation = useMotionValue(0)
  const angle = useTransform(rotation, [0, 100], [-90, 90])

  useEffect(() => {
    if (isInView) {
      animate(rotation, score, { duration: 2, ease: "easeOut" })
    }
  }, [isInView, score, rotation])

  const getScoreColor = (score: number) => {
    if (score < 30) return "text-green-500"
    if (score < 70) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div ref={ref} className="relative w-full max-w-xs mx-auto">
      {/* Meter background */}
      <svg viewBox="0 0 200 120" className="w-full">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-border"
          strokeLinecap="round"
        />
        
        {/* Colored segments */}
        <defs>
          <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#meterGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.3"
        />
        
        {/* Needle */}
        <motion.g style={{ originX: "100px", originY: "100px", rotate: angle }}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="35"
            stroke="currentColor"
            strokeWidth="3"
            className="text-foreground"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="8" className="fill-primary" />
        </motion.g>
      </svg>

      {/* Score display */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 2, type: "spring" }}
          className={`text-4xl font-bold ${getScoreColor(score)}`}
        >
          <AnimatedCounter value={score} />
          <span className="text-lg text-muted-foreground">/100</span>
        </motion.div>
      </div>
    </div>
  )
}

export function SummaryAnalysis({ result }: SummaryAnalysisProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const riskScore = result?.risk_score ?? 0
  const conditionLevel = result?.condition_level ?? "Low"
  const estimatedCost = result?.estimated_cost ?? "—"

  const getConditionColor = (level: string) => {
    switch (level) {
      case "Low": return "text-green-500 bg-green-500/10"
      case "Medium": return "text-yellow-500 bg-yellow-500/10"
      case "High": return "text-red-500 bg-red-500/10"
      default: return "text-muted-foreground bg-muted"
    }
  }

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
      
      <div ref={ref} className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Summary
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground text-balance">
            Analysis Summary
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-pretty">
            {result
              ? "A comprehensive overview of your health analysis with key metrics at a glance."
              : "Complete an analysis to see your risk summary and cost estimates."}
          </p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-card border border-border rounded-3xl p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Risk Score</h3>
                  <p className="text-sm text-muted-foreground">Overall health risk assessment</p>
                </div>
              </div>
              
              <RiskMeter score={riskScore} />

              {/* Progress bar */}
              <div className="mt-8">
                <div className="w-full h-3 rounded-full bg-border overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${riskScore}%` } : {}}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      riskScore <= 30
                        ? "bg-green-500"
                        : riskScore <= 70
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                </div>
              </div>

              {/* Risk labels */}
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Low Risk</span>
                <span>Medium Risk</span>
                <span>High Risk</span>
              </div>
            </div>
          </motion.div>

          {/* Side Cards */}
          <div className="space-y-6">
            {/* Condition Level */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-chart-4" />
                  </div>
                  <span className="text-sm text-muted-foreground">Condition Level</span>
                </div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ delay: 0.5, type: "spring" }}
                  className={`inline-flex px-4 py-2 rounded-full text-lg font-semibold ${getConditionColor(conditionLevel)}`}
                >
                  {conditionLevel}
                </motion.span>
              </motion.div>
            </motion.div>

            {/* Estimated Cost */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Estimated Treatment Cost</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {estimatedCost}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Based on detected conditions and recommended care
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
