"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

const api_url = process.env.NEXT_PUBLIC_API_URL as string;

const MarkAttendancePage = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false,
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  }, []);

  useEffect(() => {
    startVideo();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startVideo]);

  const uploadToServer = async (formData: FormData) => {
    setIsUploading(true);
    setUploadStatus('idle');
    
    try {
      const response = await fetch(`${api_url}/auth/mark-attendance`, {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        setUploadStatus('success');
        setTimeout(() => setUploadStatus('idle'), 4000);
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCapture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageDataUrl);
    setUploadStatus('idle');

    canvas.toBlob(async (blob) => {
      if (blob) {
        const formData = new FormData();
        formData.append("image", blob, "attendance-photo.jpg");
        await uploadToServer(formData);
      }
    }, "image/jpeg");
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setUploadStatus('idle');
  };

  return (
    <div className="h-screen w-full bg-black text-gray-100 flex flex-col justify-between overflow-hidden">
      
      {/* 1. Header (Stays anchored at the top) */}
      <header className="w-full max-w-md mx-auto pt-6 px-4 text-center shrink-0 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-semibold uppercase tracking-wider">
          <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
          Secure Verification
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          Mark Attendance
        </h1>
      </header>

      {/* 2. Main Viewport (Expands to fill mobile height) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 flex flex-col justify-center overflow-hidden">
        <div className="w-full h-full max-h-[65vh] md:max-h-[500px] bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col justify-between">
          
          <div className="relative w-full h-full bg-black">
            {/* Live Video Frame */}
            {!capturedImage && (   
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            )}

            {/* Static Captured Image */}
            {capturedImage && (
              <div className="relative w-full h-full">
                <Image
                  fill
                  src={capturedImage}
                  alt="Captured attendance verification"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Camera Spinner */}
            {!isCameraReady && !capturedImage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-3">
                <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
                <p className="text-xs text-zinc-500">Initializing biometric stream...</p>
              </div>
            )}

            {/* Biometric Framing & Pulse Laser Overlay */}
            {isCameraReady && !capturedImage && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="relative w-full h-full max-w-[240px] max-h-[240px] md:max-w-[280px] md:max-h-[280px]">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-green-500 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-green-500 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-green-500 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-green-500 rounded-br-xl" />
                  
                  {/* Glowing Laser Scan effect */}
                  <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan" />
                </div>
              </div>
            )}

            {/* Upload Spinner Overlaid */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
                <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
                <p className="text-xs text-green-400 font-semibold tracking-wide uppercase">Verifying ID...</p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </main>

      {/* 3. Status Alerts Overlay & Footer Control Panel */}
      <footer className="w-full max-w-md mx-auto pb-8 px-6 shrink-0 space-y-4">
        
        {/* Dynamic Upload Statuses */}
        <div className="flex items-center justify-center">
          {uploadStatus === 'success' && (
            <div className="w-full flex items-center gap-2 p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-emerald-400 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs font-medium">Attendance verified successfully!</p>
            </div>
          )}
          
          {uploadStatus === 'error' && (
            <div className="w-full flex items-center gap-2 p-3 bg-rose-950/30 border border-rose-500/20 rounded-xl text-rose-400 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-xs font-medium">Failed to recognize. Please try again.</p>
            </div>
          )}
        </div>

        {/* Buttons Panel */}
        <div className="flex justify-center w-full">
          {!capturedImage ? (
            <button
              type="button"
              onClick={handleCapture}
              disabled={!isCameraReady}
              className="group relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-600 hover:bg-green-500 active:scale-90 disabled:bg-zinc-900 disabled:text-zinc-700 text-white shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20"
              aria-label="Capture verification photo"
            >
              <Camera className="w-8 h-8 sm:w-10 sm:h-10" />
              {/* Pulsing ring behind the button */}
              <span className="absolute -inset-3 rounded-full border border-green-500/20 group-hover:scale-110 transition-all duration-300 pointer-events-none" />
            </button>
          ) : (
            <div className="flex gap-4 w-full">
              <button
                type="button"
                onClick={handleRetake}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 py-4 px-5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 text-sm font-medium rounded-2xl transition-all duration-200 border border-zinc-800"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </button>
              <button
                type="button"
                onClick={handleCapture}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 py-4 px-5 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-medium rounded-2xl shadow-lg shadow-green-600/10 transition-all duration-200"
              >
                Upload Again
              </button>
            </div>
          )}
        </div>

        {/* Tiny encrypted notice */}
        <div className="text-center text-[10px] text-zinc-600 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          <span>Biometric validation is active and encrypted.</span>
        </div>
      </footer>
    </div>
  );
};

export default MarkAttendancePage;