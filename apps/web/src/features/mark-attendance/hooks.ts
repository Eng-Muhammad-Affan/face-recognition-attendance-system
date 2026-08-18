import { useCallback, useEffect, useRef, useState } from "react";

export const useMarkAttendance = () => {
    const api_url = process.env.NEXT_PUBLIC_API_URL as string;

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<
        "idle" | "success" | "error"
    >("idle");

    const startVideo = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user",
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
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, [startVideo]);

    const uploadToServer = async (formData: FormData) => {
        setIsUploading(true);
        setUploadStatus("idle");

        try {
            const response = await fetch(`${api_url}/auth/mark-attendance`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setUploadStatus("success");
                setTimeout(() => setUploadStatus("idle"), 4000);
            } else {
                setUploadStatus("error");
            }
        } catch (error) {
            console.error("Upload failed:", error);
            setUploadStatus("error");
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
        setUploadStatus("idle");

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
        setUploadStatus("idle");
    };
    return {
        videoRef,canvasRef , streamRef , capturedImage, setCapturedImage, isCameraReady, isUploading, setUploadStatus , setIsUploading , uploadStatus, startVideo, handleCapture, handleRetake, 
    }
}