"use client"

import { useState, useCallback, useRef } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Image, File, X, Sparkles, Check, Loader2 } from "lucide-react"

const acceptedFormats = [
  { ext: "PNG", icon: Image },
  { ext: "JPG", icon: Image },
  { ext: "PDF", icon: FileText },
  { ext: "TXT", icon: File },
]

interface UploadedFile {
  name: string
  size: number
  type: string
  fileObject: globalThis.File
}

interface UploadSectionProps {
  onAnalysisComplete?: (result: any) => void
  onError?: (message: string) => void
}

export function UploadSection({ onAnalysisComplete, onError }: UploadSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [statusText, setStatusText] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      validateAndSetFile(file)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }, [])

  const validateAndSetFile = (file: globalThis.File) => {
    const validTypes = ["image/png", "image/jpeg", "application/pdf", "text/plain"]
    const maxSize = 40 * 1024 * 1024 // 40MB
    const minSize = 10 * 1024 // 10KB

    setErrorMessage("")

    if (!validTypes.includes(file.type)) {
      setErrorMessage("Invalid file type. Please upload PNG, JPG, PDF, or TXT files.")
      return
    }

    if (file.size < minSize) {
      setErrorMessage("File too small — minimum 10KB required.")
      return
    }

    if (file.size > maxSize) {
      setErrorMessage("File too large — maximum 40MB allowed.")
      return
    }

    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
      fileObject: file,
    })
    setAnalysisComplete(false)
  }

  const removeFile = () => {
    setUploadedFile(null)
    setAnalysisComplete(false)
    setErrorMessage("")
    setStatusText("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) return

    setIsUploading(true)
    setStatusText("Uploading...")
    setErrorMessage("")

    try {
      // Dynamic import to avoid SSR issues
      const { uploadReport, analyzeReport } = await import("@/src/api/midiscanApi")

      // Step 1: Upload
      const uploadResult = await uploadReport(uploadedFile.fileObject)
      const fileId = uploadResult.fileId

      // Step 2: Analyze
      setIsUploading(false)
      setIsAnalyzing(true)
      setStatusText("Analyzing with AI...")

      const analysisResult = await analyzeReport(fileId)

      // Step 3: Complete
      setIsAnalyzing(false)
      setAnalysisComplete(true)
      setStatusText("")

      // Notify parent
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult)
      }

      // Scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })
      }, 300)

    } catch (error: any) {
      setIsUploading(false)
      setIsAnalyzing(false)
      setStatusText("")
      const msg = error?.message || "Analysis failed — please try again"
      setErrorMessage(msg)
      if (onError) {
        onError(msg)
      }
    }
  }

  const isLoading = isUploading || isAnalyzing

  return (
    <section id="upload" className="py-24 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
      <div ref={ref} className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Upload
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground text-balance">
            Upload Your Medical Report
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-pretty">
            Drag and drop your file or click to browse. We support multiple formats 
            for your convenience.
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 ${
              isDragging
                ? "border-primary bg-primary/10"
                : uploadedFile
                ? "border-primary/50 bg-card"
                : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
            }`}
          >
            {/* Glow effect when dragging */}
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-3xl bg-primary/5 pointer-events-none"
                />
              )}
            </AnimatePresence>

            <div className="p-12 md:p-16">
              <AnimatePresence mode="wait">
                {uploadedFile ? (
                  <motion.div
                    key="uploaded"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center"
                  >
                    {/* File preview */}
                    <div className="relative inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-primary/10 border border-primary/20">
                      <FileText className="w-10 h-10 text-primary" />
                      <div className="text-left">
                        <p className="text-foreground font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <div className="ml-2">
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                        disabled={isLoading}
                        className="ml-2 hover:bg-destructive/20 hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Analysis status */}
                    {analysisComplete && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 inline-flex items-center gap-2 text-primary"
                      >
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-medium">Analysis Complete!</span>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    {/* Upload icon */}
                    <motion.div
                      animate={{ y: isDragging ? -10 : 0 }}
                      className="relative inline-flex"
                    >
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-10 h-10 text-primary" />
                      </div>
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>

                    <p className="mt-6 text-foreground font-medium">
                      Drag & drop your medical report here
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Supported formats: PNG, JPG, PDF, TXT — Size: 10KB to 40MB
                    </p>

                    <Button
                      variant="outline"
                      className="mt-6 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </Button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Supported formats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-4"
          >
            <span className="text-sm text-muted-foreground">Supported formats:</span>
            {acceptedFormats.map((format) => (
              <div
                key={format.ext}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
              >
                <format.icon className="w-3 h-3" />
                {format.ext}
              </div>
            ))}
            <span className="text-xs text-muted-foreground">
              (10KB – 40MB)
            </span>
          </motion.div>

          {/* Analyze Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="mt-8 flex justify-center"
          >
            <Button
              onClick={handleAnalyze}
              disabled={!uploadedFile || isLoading}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-12 h-14 text-base font-medium disabled:opacity-50 group"
            >
              {isLoading ? (
                <motion.div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{statusText}</span>
                </motion.div>
              ) : (
                <>
                  <Sparkles className="mr-2 w-5 h-5 transition-transform group-hover:scale-110" />
                  Analyze Report
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
