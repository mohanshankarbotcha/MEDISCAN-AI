"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { 
  Activity, 
  AlertTriangle, 
  Stethoscope, 
  Lightbulb, 
  DollarSign, 
  BarChart3 
} from "lucide-react"

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

interface HealthInsightsProps {
  result: AnalysisResult | null
}

export function HealthInsights({ result }: HealthInsightsProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Determine badge color for risk
  const getRiskBadgeClass = (level: string) => {
    switch (level) {
      case "Low":
        return "bg-green-500/10 text-green-500"
      case "Medium":
        return "bg-yellow-500/10 text-yellow-500"
      case "High":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const insights = [
    {
      icon: Activity,
      title: "Detected Condition",
      description: result?.detected_condition || "Upload a report to see detected conditions",
      value: result ? result.detected_condition?.split(" ").slice(0, 3).join(" ") : null,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      icon: AlertTriangle,
      title: "Risk Assessment",
      description: result
        ? `Risk Score: ${result.risk_score}/100`
        : "Risk level will appear after analysis",
      value: result ? result.condition_level : null,
      valueBadgeClass: result ? getRiskBadgeClass(result.condition_level) : "",
      color: "text-chart-5",
      bgColor: "bg-chart-5/10",
    },
    {
      icon: Stethoscope,
      title: "Clinical Explanation",
      description: result?.clinical_explanation || "Clinical findings will be shown here after analysis",
      value: null,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      icon: Lightbulb,
      title: "Recommended Guidance",
      description: result?.recommended_guidance || "Actionable recommendations will appear after analysis",
      value: null,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      icon: DollarSign,
      title: "Estimated Cost",
      description: result
        ? `Estimated treatment cost range`
        : "Cost estimates will appear after analysis",
      value: result?.estimated_cost || null,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: BarChart3,
      title: "Extracted Metrics",
      description: result?.extracted_metrics
        ? Object.entries(result.extracted_metrics)
            .map(([key, val]) => `${key}: ${val}`)
            .join(" • ")
        : "Health metrics will be extracted from your report",
      value: null,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ]

  return (
    <section id="results" className="py-24 relative">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Analysis Results
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground text-balance">
            Generated Health Insights
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-pretty">
            {result
              ? "Comprehensive analysis of your medical report with actionable insights and recommendations."
              : "Upload and analyze a report to see AI-generated health insights below."}
          </p>
        </motion.div>

        {/* Insight Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
            >
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`h-full bg-card border border-border rounded-2xl p-6 relative overflow-hidden group ${
                  result ? "ring-1 ring-primary/10" : ""
                }`}
              >
                {/* Hover glow */}
                <div className={`absolute inset-0 ${insight.bgColor} opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                      className={`w-12 h-12 rounded-xl ${insight.bgColor} flex items-center justify-center`}
                    >
                      <insight.icon className={`w-6 h-6 ${insight.color}`} />
                    </motion.div>
                    
                    {insight.value && (
                      <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          (insight as any).valueBadgeClass || `${insight.bgColor} ${insight.color}`
                        }`}
                      >
                        {insight.value}
                      </motion.span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {insight.title}
                  </h3>

                  {/* Description / Content */}
                  {insight.title === "Recommended Guidance" && result?.recommended_guidance ? (
                    <ul className="text-sm text-muted-foreground leading-relaxed space-y-1">
                      {result.recommended_guidance
                        .split(/[.\n]/)
                        .filter((s) => s.trim().length > 0)
                        .slice(0, 5)
                        .map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{item.trim()}</span>
                          </li>
                        ))}
                    </ul>
                  ) : insight.title === "Extracted Metrics" && result?.extracted_metrics ? (
                    <div className="space-y-1.5">
                      {Object.entries(result.extracted_metrics).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="text-foreground font-medium">{val}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                  )}
                </div>

                {/* Decorative element */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-5">
                  <insight.icon className="w-full h-full" />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
