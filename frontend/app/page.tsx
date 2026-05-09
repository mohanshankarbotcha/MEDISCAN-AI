"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Shield,
  Brain,
  Stethoscope,
  ChevronRight,
  Check,
  X,
  Loader2,
  Activity,
  Github,
  Instagram,
  Linkedin,
  Zap,
  Cpu,
  MousePointer2,
  FileCheck,
  TrendingUp,
  TriangleAlert,
  Lightbulb,
  CircleDollarSign,
  BarChart3,
  Search,
  Sparkles,
  Dna,
  HeartPulse,
  Plus
} from "lucide-react";
import { uploadReport, analyzeReport, AnalysisResult } from "@/api/midiscanApi";

// --- COMPONENTS ---

const ToastNotification = ({
  message,
  type,
  onDismiss
}: {
  message: string;
  type: "error" | "success";
  onDismiss: () => void
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 min-w-[300px] ${type === "error" ? "bg-red-600 text-white" : "bg-[#0D9488] text-white"
        }`}
    >
      {type === "success" ? <Check size={20} /> : <X size={20} />}
      <p className="flex-1 font-medium">{message}</p>
      <button onClick={onDismiss} className="hover:opacity-70 transition-opacity">
        <X size={18} />
      </button>
    </motion.div>
  );
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white h-48 rounded-2xl border border-[#E5E7EB] shadow-sm"></div>
    ))}
  </div>
);

// --- MAIN PAGE ---

export default function HomePage() {
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Handlers
  const validateAndSetFile = (file?: File) => {
    setFileError(null);
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "application/pdf", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      setFileError("Invalid file type or size. Please upload PNG, JPG, PDF, or TXT between 10KB and 40MB.");
      return;
    }

    if (file.size < 10240 || file.size > 41943040) {
      setFileError("Invalid file type or size. Please upload PNG, JPG, PDF, or TXT between 10KB and 40MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setAnalysisResult(null);
    setFileError(null);

    try {
      setStatusMessage("Uploading report...");
      const uploadRes = await uploadReport(selectedFile);
      setFileId(uploadRes.fileId);

      setStatusMessage("Analyzing...");
      const result = await analyzeReport(uploadRes.fileId);

      setAnalysisResult(result);
      setToast({ message: "Analysis completed successfully!", type: "success" });

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } catch (err: any) {
      const msg = err.message;
      if (msg.startsWith("INVALID_MEDICAL_CONTENT:")) {
        setFileError(msg.split("INVALID_MEDICAL_CONTENT:")[1].trim());
      } else if (msg.startsWith("AI_UNAVAILABLE:")) {
        setFileError("The AI analysis service is temporarily unavailable. Please wait a few seconds and click Analyze Report again.");
      } else if (msg.includes("Cannot connect") || msg.includes("Cannot reach")) {
        setFileError("Cannot connect to the Midiscanai server. Make sure the backend is running and try again.");
      } else if (msg.includes("taking too long")) {
        setFileError("Analysis timed out. The AI server is busy. Please try again.");
      } else {
        setFileError("Analysis failed: " + msg);
      }
      setToast({ message: "Analysis failed. See error for details.", type: "error" });
    } finally {
      setIsLoading(false);
      setStatusMessage(null);
    }
  };

  const smoothScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="min-h-screen bg-[#F9FAFB] text-[#111827] selection:bg-[#CCFBF1]"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      <AnimatePresence>
        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* SECTION 1 — STICKY HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E5E7EB] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#CCFBF1] rounded-full flex items-center justify-center">
              <Activity className="text-[#0D9488]" size={20} />
            </div>
            <div className="text-[1.5rem] font-bold">
              <span className="text-[#111827]">Midiscan</span>
              <span className="text-[#0D9488]">ai</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[1rem] font-medium text-[#374151]">
            <button onClick={() => smoothScroll("hero")} className="hover:text-[#0D9488] transition-colors">Home</button>
            <button onClick={() => smoothScroll("upload")} className="hover:text-[#0D9488] transition-colors">Upload</button>
            <button onClick={() => smoothScroll("results")} className="hover:text-[#0D9488] transition-colors">Result</button>
            <button
              onClick={() => smoothScroll("upload")}
              className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-5 py-2 rounded-full font-semibold transition-all shadow-md"
            >
              Upload Report
            </button>
          </nav>
        </div>
      </header>

      {/* SECTION 2 — HERO SECTION */}
      <section id="hero" className="min-h-screen pt-20 pb-32 flex flex-col items-center">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* LEFT COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start"
          >
            <div className="bg-[#CCFBF1] rounded-full px-3 py-1 flex items-center gap-2 mb-6">
              <Sparkles size={16} className="text-[#0D9488]" />
              <span className="text-[#0D9488] text-[0.875rem] font-semibold">Medical Intelligence Platform</span>
            </div>
            <h1 className="text-5xl md:text-[3.5rem] font-extrabold leading-[1.1] text-[#111827] mb-6">
              Transform <br />
              Medical Reports <br />
              Into Actionable <br />
              <span className="text-[#0D9488]">Insights</span>
            </h1>
            <p className="text-[#6B7280] text-[1rem] leading-relaxed max-w-[480px] mb-10">
              Upload your medical reports and let our advanced AI extract clinical insights, assess risks, and estimate costs — all in seconds.
            </p>
            <div className="flex items-center gap-4 mb-12">
              <button
                onClick={() => smoothScroll("upload")}
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-8 py-4 rounded-full font-bold text-[1.125rem] transition-all flex items-center gap-2 shadow-lg"
              >
                Upload Medical Report <ChevronRight size={20} />
              </button>
              <button className="text-[#374151] font-semibold hover:text-[#0D9488] transition-colors ml-4">
                View Analysis Output
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: <Brain size={16} />, text: "AI Analysis" },
                { icon: <Shield size={16} />, text: "HIPAA Secure" },
                { icon: <Zap size={16} />, text: "Real-time" }
              ].map((badge, i) => (
                <div key={i} className="bg-white border border-[#E5E7EB] rounded-full px-3 py-1.5 flex items-center gap-2 text-[#374151] text-[0.875rem] shadow-sm">
                  <span className="text-[#0D9488]">{badge.icon}</span>
                  {badge.text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT COLUMN — FLOATING MEDICAL DIAGRAM */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex items-center justify-center h-[500px]"
          >
            {/* Center Circle with Pulse */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-80 h-80 bg-[#CCFBF1] opacity-40 rounded-full"
            />
            <div className="relative w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center z-10">
              <Activity size={56} className="text-[#0D9488]" />
            </div>

            {/* Surrounding Icon Circles */}
            {[
              { icon: <Brain size={24} />, top: "10%", left: "10%", delay: 0 },
              { icon: <HeartPulse size={24} />, top: "10%", right: "10%", delay: 0.5 },
              { icon: <Stethoscope size={24} />, top: "45%", right: "-5%", delay: 0.2 },
              { icon: <Dna size={24} />, bottom: "10%", right: "10%", delay: 0.7 },
              { icon: <Plus size={24} />, bottom: "10%", left: "10%", delay: 0.4 }
            ].map((item, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
                className="absolute w-12 h-12 bg-white border border-[#E5E7EB] rounded-full flex items-center justify-center shadow-md z-20"
                style={{ top: item.top, bottom: item.bottom, left: item.left, right: item.right }}
              >
                <span className="text-[#0D9488]">{item.icon}</span>
              </motion.div>
            ))}

            {/* Connecting Dashed Lines */}
            <svg className="absolute w-full h-full pointer-events-none opacity-30" viewBox="0 0 500 500">
              <line x1="250" y1="250" x2="100" y2="100" stroke="#0D9488" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="250" y1="250" x2="400" y2="100" stroke="#0D9488" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="250" y1="250" x2="480" y2="250" stroke="#0D9488" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="250" y1="250" x2="400" y2="400" stroke="#0D9488" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="250" y1="250" x2="100" y2="400" stroke="#0D9488" strokeWidth="1" strokeDasharray="5,5" />
            </svg>

            {/* Floating Cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] right-[-10%] bg-white rounded-xl p-3 shadow-lg z-30 flex flex-col gap-2 border border-[#E5E7EB]"
            >
              <span className="text-[0.625rem] text-[#6B7280] uppercase font-bold tracking-wider">Report Scanned</span>
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-[#0D9488]" />
                <span className="text-[0.875rem] font-bold">Blood Panel.pdf</span>
              </div>
              <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full mt-1">
                <div className="bg-[#0D9488] h-full w-full rounded-full" />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[20%] left-[-10%] bg-white rounded-xl p-3 shadow-lg z-30 flex flex-col gap-2 border border-[#E5E7EB]"
            >
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-[#0D9488]" />
                <span className="text-[0.875rem] font-bold">Vital Signs</span>
              </div>
              <svg className="w-24 h-6" viewBox="0 0 100 20">
                <path d="M0,10 L20,10 L25,0 L35,20 L40,10 L60,10 L65,0 L75,20 L80,10 L100,10" fill="none" stroke="#0D9488" strokeWidth="2" />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        {/* STATS BAR */}
        <div className="w-full bg-white border-y border-[#E5E7EB] py-8 mt-12">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <span className="text-[2.5rem] font-extrabold text-[#0D9488]">50K+</span>
              <span className="text-[#6B7280] text-[0.875rem] font-medium">Reports Analyzed</span>
            </div>
            <div className="flex flex-col items-center md:border-x border-[#E5E7EB]">
              <span className="text-[2.5rem] font-extrabold text-[#6B7280]">99.2%</span>
              <span className="text-[#6B7280] text-[0.875rem] font-medium">Accuracy Rate</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[2.5rem] font-extrabold text-[#111827]">{"< 3s"}</span>
              <span className="text-[#6B7280] text-[0.875rem] font-medium">Avg. Processing</span>
            </div>
          </div>
        </div>

        {/* SCROLL INDICATOR */}
        <div className="mt-12 flex justify-center">
          <div className="w-7 h-12 border-2 border-[#0D9488] rounded-[14px] flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-1.5 bg-[#0D9488] rounded-full"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3 — HOW IT WORKS */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <span className="text-[#0D9488] text-[0.875rem] font-bold uppercase tracking-[0.1em] mb-4">How it works</span>
          <h2 className="text-[2.25rem] font-bold text-[#111827] text-center mb-6">From Upload to Insights in Seconds</h2>
          <p className="text-[#6B7280] text-[1.125rem] text-center max-w-[600px] mb-20 leading-relaxed">
            Our streamlined process ensures quick and accurate analysis of your medical reports using state-of-the-art AI technology.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
            {[
              { num: 1, title: "Upload Report", icon: <Upload size={24} />, desc: "Securely upload clinical records", delay: 0 },
              { num: 2, title: "Click Analyze", icon: <MousePointer2 size={24} />, desc: "Trigger AI extraction layer", delay: 0.1 },
              { num: 3, title: "AI Extracts Metrics", icon: <Cpu size={24} />, desc: "Structured data parsing", delay: 0.2 },
              { num: 4, title: "AI Reasoning", icon: <Brain size={24} />, desc: "Clinical cross-references", delay: 0.3 },
              { num: 5, title: "Structured Output", icon: <FileCheck size={24} />, desc: "Final data validation", delay: 0.4 }
            ].map((step, i) => (
              <React.Fragment key={i}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: step.delay }}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col items-start relative group"
                >
                  <div className="absolute top-[-10px] left-[-10px] w-8 h-8 bg-[#0D9488] text-white rounded-full flex items-center justify-center font-bold shadow-md">
                    {step.num}
                  </div>
                  <div className="w-12 h-12 bg-[#CCFBF1] rounded-full flex items-center justify-center text-[#0D9488] mb-6">
                    {step.icon}
                  </div>
                  <h4 className="font-bold text-[1rem] text-[#111827] mb-2">{step.title}</h4>
                  <p className="text-[0.875rem] text-[#6B7280] leading-relaxed">{step.desc}</p>
                </motion.div>
                {i < 4 && (
                  <div className="hidden md:flex items-center justify-center">
                    <ChevronRight className="text-[#9CA3AF]" size={24} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — FEATURES */}
      <section className="py-32 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <span className="text-[#0D9488] text-[0.875rem] font-bold uppercase tracking-[0.1em] mb-4">Features</span>
          <h2 className="text-[2.25rem] font-bold text-[#111827] text-center mb-6">Intelligent Medical Analysis</h2>
          <p className="text-[#6B7280] text-[1.125rem] text-center max-w-[600px] mb-20 leading-relaxed">
            Our platform combines cutting-edge AI with medical expertise to deliver comprehensive health insights.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {[
              {
                title: "Clinical Insights",
                icon: <Stethoscope size={32} />,
                desc: "Extract detailed clinical findings, diagnoses, and observations from your medical reports with precision."
              },
              {
                title: "Advanced AI Logic",
                icon: <Brain size={32} />,
                desc: "Powered by state-of-the-art machine learning models trained on millions of medical records."
              },
              {
                title: "Cost Estimator",
                icon: <BarChart3 size={32} />,
                desc: "Get transparent cost estimates for treatments, procedures, and follow-up care based on your analysis."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm flex flex-col items-start relative overflow-hidden h-full"
              >
                <div className="w-16 h-16 bg-[#CCFBF1] rounded-full flex items-center justify-center text-[#0D9488] mb-8">
                  {feature.icon}
                </div>
                <h4 className="text-[1.25rem] font-bold text-[#111827] mb-4">{feature.title}</h4>
                <p className="text-[#6B7280] leading-relaxed relative z-10">{feature.desc}</p>
                <div className="absolute bottom-[-20px] right-[-20px] text-[#E5E7EB] opacity-30">
                  {React.cloneElement(feature.icon as React.ReactElement<any>, { size: 100 })}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-12 mt-16">
            <button
              onClick={() => smoothScroll("upload")}
              className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-md flex items-center gap-2"
            >
              Upload Medical Report <ChevronRight size={18} />
            </button>
            <button className="text-[#374151] font-semibold hover:text-[#0D9488] transition-colors">
              View Analysis Output
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5 — UPLOAD SECTION */}
      <section id="upload" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <h2 className="text-[2rem] font-bold text-[#111827] text-center mb-6">Upload Your Medical Report</h2>
          <p className="text-[#6B7280] text-center max-w-[500px] mb-12">
            Drag and drop your file or click to browse. We support multiple formats for your convenience.
          </p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-[700px] min-h-[240px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-12 transition-all cursor-pointer ${isDragging ? "border-[#0D9488] bg-[#F0FDF4]" : "border-[#D1FAE5] bg-[#F9FAFB]"
              }`}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".png,.jpg,.jpeg,.pdf,.txt"
            />

            <div className="w-20 h-20 bg-[#CCFBF1] rounded-full flex items-center justify-center text-[#0D9488] mb-6">
              <Upload size={32} />
            </div>
            <h4 className="text-[1.125rem] font-bold text-[#111827] mb-2">Drag and drop your file here</h4>
            <p className="text-[#6B7280] text-[0.875rem]">or click to browse from your computer</p>
          </div>

          <div className="flex flex-wrap gap-4 mt-8 items-center">
            {[
              { icon: <Activity size={14} />, name: "PNG" },
              { icon: <Activity size={14} />, name: "JPG" },
              { icon: <FileText size={14} />, name: "PDF" },
              { icon: <FileText size={14} />, name: "TXT" }
            ].map((format, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-full px-3 py-1 flex items-center gap-2 text-[#374151] text-[0.875rem]">
                <span className="text-[#6B7280]">{format.icon}</span>
                {format.name}
              </div>
            ))}
            <span className="text-[#6B7280] text-[0.875rem] ml-2">(10KB-40MB)</span>
          </div>

          {fileError && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-red-600 font-medium text-center max-w-md">
              {fileError}
            </motion.p>
          )}

          {selectedFile && !fileError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 flex items-center gap-3 bg-[#F0FDF4] border border-[#D1FAE5] px-6 py-3 rounded-xl">
              <Check className="text-[#0D9488]" size={20} />
              <div className="flex flex-col">
                <span className="font-bold text-[#0D9488]">{selectedFile.name}</span>
                <span className="text-[0.75rem] text-[#6B7280]">
                  {selectedFile.size > 1024 * 1024
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                    : `${(selectedFile.size / 1024).toFixed(1)} KB`}
                </span>
              </div>
            </motion.div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || !!fileError || isLoading}
            className={`mt-12 px-10 py-4 rounded-full font-bold text-[1.125rem] flex items-center gap-2 transition-all shadow-lg ${!selectedFile || !!fileError || isLoading
                ? "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed opacity-50"
                : "bg-[#0D9488] hover:bg-[#0F766E] text-white"
              }`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={22} /> : <Sparkles size={22} />}
            {isLoading ? statusMessage || "Analyzing..." : "Analyze Report"}
          </button>
        </div>
      </section>

      {/* SECTION 6 — HEALTH INSIGHTS RESULTS */}
      {analysisResult && (
        <section id="results" ref={resultsRef} className="py-32 bg-[#F9FAFB]">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
            <span className="text-[#0D9488] text-[0.875rem] font-bold uppercase tracking-[0.1em] mb-4">Analysis Results</span>
            <h2 className="text-[2rem] font-bold text-[#111827] text-center mb-6">Generated Health Insights</h2>
            <p className="text-[#6B7280] text-center max-w-[600px] mb-20">
              Comprehensive analysis of your medical report with actionable insights and recommendations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {[
                {
                  title: "Detected Condition",
                  val: analysisResult.detected_condition,
                  icon: <Activity size={24} />,
                  badge: analysisResult.detected_condition
                },
                {
                  title: "Risk Assessment",
                  val: (
                    <div className="flex flex-col gap-1">
                      <div className="text-[2rem] font-black text-[#111827] leading-none mb-1">{analysisResult.risk_score} <span className="text-[1.25rem] text-[#6B7280] font-normal">/ 100</span></div>
                      <div>
                        {analysisResult.condition_level === "Low" ? "Mild concern — monitoring recommended" :
                         analysisResult.condition_level === "Medium" ? "Moderate risk — schedule a doctor visit" :
                         "High risk — seek medical attention soon"}
                      </div>
                    </div>
                  ),
                  icon: <TriangleAlert size={24} />,
                  statusBadge: analysisResult.condition_level
                },
                {
                  title: "Clinical Explanation",
                  val: analysisResult.clinical_explanation,
                  icon: <Stethoscope size={24} />
                },
                {
                  title: "Recommended Guidance",
                  val: analysisResult.recommended_guidance,
                  icon: <Lightbulb size={24} />
                },
                {
                  title: "Estimated Cost",
                  val: analysisResult.estimated_cost,
                  icon: <CircleDollarSign size={24} />,
                  badge: "Cost Estimate"
                },
                {
                  title: "Extracted Metrics",
                  val: analysisResult.extracted_metrics,
                  icon: <BarChart3 size={24} />,
                  isMetrics: true
                }
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col items-start relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between w-full mb-6 relative z-10">
                    <div className="w-10 h-10 bg-[#CCFBF1] rounded-full flex items-center justify-center text-[#0D9488]">
                      {card.icon}
                    </div>
                    {card.badge && (
                      <div className="bg-[#CCFBF1] text-[#0D9488] px-3 py-1 rounded-full text-[0.75rem] font-bold max-w-[150px] truncate">
                        {card.badge}
                      </div>
                    )}
                    {card.statusBadge && (
                      <div className={`px-3 py-1 rounded-full text-[0.75rem] font-bold ${card.statusBadge === "Low" ? "bg-[#DCFCE7] text-[#166534]" :
                          card.statusBadge === "Medium" ? "bg-[#FEF9C3] text-[#854D0E]" :
                            "bg-[#FEE2E2] text-[#991B1B]"
                        }`}>
                        {card.statusBadge}
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-[0.9375rem] text-[#111827] mb-3 relative z-10">{card.title}</h4>
                  {card.isMetrics ? (
                    <div className="w-full relative z-10 overflow-hidden rounded-xl border border-[#F3F4F6]">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                          <tr>
                            <th className="px-3 py-2 text-[0.65rem] font-bold text-[#6B7280] uppercase tracking-wider">Parameter</th>
                            <th className="px-3 py-2 text-[0.65rem] font-bold text-[#6B7280] uppercase tracking-wider">Result (Range)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F3F4F6]">
                          {Object.entries(card.val as Record<string, string>).length > 0 ? (
                            Object.entries(card.val as Record<string, string>).map(([key, value], idx) => {
                              const strValue = String(value).toLowerCase();
                              const isNormal = strValue.includes('normal') &&
                                !strValue.includes('abnormal') &&
                                !strValue.includes('high') &&
                                !strValue.includes('low');
                              const isAbnormal = strValue.includes('abnormal') ||
                                strValue.includes('high') ||
                                strValue.includes('low');

                              return (
                                <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                                  <td className="px-3 py-2 text-[0.75rem] font-bold text-[#111827]">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                                  </td>
                                  <td className="px-3 py-2 text-[0.75rem] text-[#374151] flex items-center gap-1">
                                    <span style={{ color: String(value).startsWith('⚠') ? '#DC2626' : 'inherit' }}>
                                      {value}
                                    </span>
                                    {isNormal && <Check size={12} className="text-green-500 shrink-0" />}
                                    {isAbnormal && <TriangleAlert size={12} className="text-orange-500 shrink-0" />}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={2} className="px-3 py-4 text-center text-[#9CA3AF] text-[0.75rem]">
                                No specific metrics extracted.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-[0.875rem] text-[#6B7280] leading-relaxed relative z-10">{card.val as React.ReactNode}</div>
                  )}
                  <div className="absolute bottom-[-10px] right-[-10px] text-[#F0FDF4] opacity-50 z-0">
                    {React.cloneElement(card.icon as React.ReactElement<any>, { size: 80 })}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* NEW: HOW WAS THIS DETECTED CARD */}
            {analysisResult.detection_reasoning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm flex flex-col items-start w-full relative overflow-hidden"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#CCFBF1] rounded-full flex items-center justify-center text-[#0D9488]">
                    <Search size={24} />
                  </div>
                  <h4 className="text-[1.25rem] font-bold text-[#111827]">How Was This Detected?</h4>
                </div>
                <p className="text-[#374151] leading-relaxed text-[1rem] z-10">{analysisResult.detection_reasoning}</p>
                <div className="absolute bottom-[-20px] right-[-20px] text-[#F0FDF4] opacity-50 z-0">
                  <Search size={120} />
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 7 — ANALYSIS SUMMARY */}
      {analysisResult && (
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center mb-16">
              <span className="text-[#0D9488] text-[0.875rem] font-bold uppercase tracking-[0.1em] mb-4">Summary</span>
              <h2 className="text-[2rem] font-bold text-[#111827] text-center mb-6">Analysis Summary</h2>
              <p className="text-[#6B7280] text-center max-w-[600px]">
                A comprehensive overview of your health analysis with key metrics at a glance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-8">
              {/* LEFT COLUMN — RISK GAUGE CARD */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-[#CCFBF1] rounded-full flex items-center justify-center text-[#0D9488]">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111827]">Risk Score</h4>
                    <p className="text-[#6B7280] text-[0.875rem]">Overall health risk assessment</p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-10 relative">
                  <svg width="300" height="150" viewBox="0 0 300 150">
                    <defs>
                      <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4ADE80" />
                        <stop offset="50%" stopColor="#FCD34D" />
                        <stop offset="100%" stopColor="#F87171" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 20 140 A 130 130 0 0 1 280 140"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 20 140 A 130 130 0 0 1 280 140"
                      fill="none"
                      stroke="url(#gaugeGradient)"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />

                    <motion.g
                      initial={{ rotate: -90 }}
                      animate={{ rotate: (analysisResult.risk_score / 100) * 180 - 90 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      style={{ originX: "150px", originY: "140px" }}
                    >
                      <line x1="150" y1="140" x2="150" y2="40" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="150" cy="140" r="5" fill="#111827" />
                    </motion.g>
                  </svg>

                  <div className="text-center mt-6">
                    <span className="text-[2.5rem] font-extrabold text-[#111827]">{analysisResult.risk_score}</span>
                    <span className="text-[#6B7280] text-[1.25rem] font-bold italic ml-2">/100</span>
                  </div>

                  <div className="w-full flex justify-between mt-8 px-4 font-bold text-[0.875rem]">
                    <span className="text-[#16A34A]">Low Risk</span>
                    <span className="text-[#D97706]">Medium Risk</span>
                    <span className="text-[#DC2626]">High Risk</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN — TWO STACKED CARDS */}
              <div className="flex flex-col gap-6">
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-[#CCFBF1] rounded-full flex items-center justify-center text-[#0D9488] mb-4">
                    <TrendingUp size={24} />
                  </div>
                  <h4 className="font-bold text-[#111827] mb-4">Condition Level</h4>
                  <div className={`px-10 py-3 rounded-full text-[1rem] font-black uppercase tracking-tighter ${analysisResult.condition_level === "Low" ? "bg-[#DCFCE7] text-[#166534]" :
                      analysisResult.condition_level === "Medium" ? "bg-[#FEF9C3] text-[#92400E]" :
                        "bg-[#FEE2E2] text-[#991B1B]"
                    }`}>
                    {analysisResult.condition_level}
                  </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-[#CCFBF1] rounded-full flex items-center justify-center text-[#0D9488] mb-4">
                    <CircleDollarSign size={24} />
                  </div>
                  <h4 className="font-bold text-[#111827] mb-2">Estimated Bill</h4>
                  <span className="text-[2rem] font-bold text-[#111827]">{analysisResult.estimated_cost}</span>
                  <p className="text-[#6B7280] text-[0.875rem] mt-2">Based on standard pricing</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 8 — FOOTER */}
      <footer className="bg-white border-t border-[#E5E7EB] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="flex flex-col items-start gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#CCFBF1] rounded-full flex items-center justify-center">
                  <Activity className="text-[#0D9488]" size={16} />
                </div>
                <div className="text-[1.25rem] font-bold">
                  <span className="text-[#111827]">Midiscan</span>
                  <span className="text-[#0D9488]">ai</span>
                </div>
              </div>
              <p className="text-[#6B7280] text-[0.875rem] leading-relaxed max-w-[280px]">
                Medical Disclaimer: This platform provides AI-generated insights for informational purposes only. Always consult with a qualified healthcare professional for medical advice.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-center">
              <h4 className="font-bold text-[#111827] text-[0.9375rem] mb-6">Quick Links</h4>
              <nav className="flex flex-col gap-3">
                <button onClick={() => smoothScroll("hero")} className="text-[#6B7280] hover:text-[#0D9488] transition-colors text-[0.875rem] text-left">Home</button>
                <button onClick={() => smoothScroll("features")} className="text-[#6B7280] hover:text-[#0D9488] transition-colors text-[0.875rem] text-left">Features</button>
                <button onClick={() => smoothScroll("upload")} className="text-[#6B7280] hover:text-[#0D9488] transition-colors text-[0.875rem] text-left">Upload</button>
                <button onClick={() => smoothScroll("results")} className="text-[#6B7280] hover:text-[#0D9488] transition-colors text-[0.875rem] text-left">Results</button>
              </nav>
            </div>

            <div className="flex flex-col items-start md:items-end">
              <h4 className="font-bold text-[#111827] text-[0.9375rem] mb-6 text-left md:text-right">Connect</h4>
              <div className="flex items-center gap-4">
                {[
                  { icon: <Instagram size={20} />, href: "https://www.instagram.com/b.mohan2678/" },
                  { icon: <Github size={20} />, href: "https://github.com/mohanshankarbotcha" },
                  { icon: <Linkedin size={20} />, href: "https://www.linkedin.com/in/mohanshankar-botcha-06668a379" }
                ].map((social, i) => (
                  <motion.a
                    key={i}
                    whileHover={{ scale: 1.1 }}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 bg-white border border-[#E5E7EB] rounded-full flex items-center justify-center text-[#374151] hover:bg-[#F0FDF4] hover:text-[#0D9488] hover:border-[#0D9488] transition-all shadow-sm"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-[#E5E7EB] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-[#6B7280] text-[0.875rem]">Designed by Aditya Air A Boys</span>
            <span className="text-[#111827] font-bold text-[0.875rem] uppercase tracking-[0.05em]">CREATED BY BMS, SHANMUK, HARI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PlusSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  )
}
