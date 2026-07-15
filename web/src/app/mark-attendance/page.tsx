"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const api_url = process.env.NEXT_PUBLIC_API_URL as string;

const MarkAttendancePage = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const startVideo = useCallback(async () => {
    const constraints = {
      video: true,
      audio: false,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoTag = videoRef.current;
      if (videoTag) {
        videoTag.srcObject = stream;
        setVideoStream(stream);

        // Wait for video to be ready
        videoTag.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.log("Camera error:", err);
    }
  }, []);

  // Capture image when button is clicked
  const handleCapture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) {
      console.log("Canvas or video not available");
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      console.log("Could not get canvas context");
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame onto canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to image URL for preview
    const imageDataUrl = canvas.toDataURL("image/jpeg");
    setCapturedImage(imageDataUrl);

    // Optional: Convert to Blob for uploading
    canvas.toBlob((blob) => {
      if (blob) {
        const formData = new FormData();
        formData.append("image", blob, "attendance-photo.jpg");

        // Send to your API
        uploadToServer(formData);
        console.log("Image captured and ready to upload");
      }
    }, "image/jpeg");
  };

  // Upload function (example)
  const uploadToServer = async (formData: FormData) => {
    try {
      const response = await fetch(`${api_url}/auth/mark-attendance`, {
        method: "POST",
        body: formData,
      });
      console.log(response);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  useEffect(() => {
    startVideo();

    // Cleanup on unmount
    return () => {
      if (videoStream) {
        for (const track of videoStream.getTracks()) {
          track.stop();
        }
      }
    };
  }, [videoStream, startVideo]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mark Attendance</h1>

      <div className="mb-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ maxWidth: "400px" }}
        />
      </div>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Capture Button */}
      <button
        type="button"
        onClick={handleCapture}
        disabled={!isCameraReady}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        Capture Attendance
      </button>

      {/* Show captured image preview */}
      {capturedImage && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Captured Image:</h2>
          <Image
            width={300}
            height={300}
            src={capturedImage}
            alt="Captured attendance"
            className="border rounded"
            style={{ maxWidth: "300px" }}
          />
        </div>
      )}
    </div>
  );
};

export default MarkAttendancePage;
