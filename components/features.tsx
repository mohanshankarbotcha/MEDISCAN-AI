"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Stethoscope, Brain, Calculator, ArrowRight } from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Stethoscope,
    title: "Clinical Insights",
    description: "Extract detailed clinical findings, diagnoses, and observations from your medical reports with precision.",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Brain,
    title: "Advanced AI Logic",
    description: "Powered by state-of-the-art machine learning models trained on millions of medical records.",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    icon: Calculator,
    title: "Cost Estimator",
    description: "Get transparent cost estimates for treatments, procedures, and follow-up care based on your analysis.",
    gradient: "from-primary/20 to-accent/5",
  },
]

export function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="features" className="py-24 relative">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Features
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground text-balance">
            Intelligent Medical Analysis
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-pretty">
            Our platform combines cutting-edge AI with medical expertise to deliver 
            comprehensive health insights.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <motion.div
                whileHover={{ y: -12, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative h-full group"
              >
                {/* Card glow */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500`} />
                
                <div className="relative bg-card border border-border rounded-3xl p-8 h-full overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute top-0 right-0 w-40 h-40 opacity-5">
                    <feature.icon className="w-full h-full" />
                  </div>

                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"
                  >
                    <feature.icon className="w-7 h-7 text-primary" />
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-primary/20"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Learn more link */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ x: 0 }}
                    className="mt-6 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    Learn more
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-12 group"
          >
            <Link href="#upload">
              Upload Medical Report
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Link
            href="#results"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            View Analysis Output
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
