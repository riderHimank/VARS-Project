"use client";

import { Canvas } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

interface ShoulderPosition {
  x: number;
  y: number;
  scale: number;
}

function MerchTShirt({
  color,
  position,
  scale,
}: {
  color: string;
  position: [number, number, number];
  scale: number;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Main T-Shirt body */}
      <mesh>
        <boxGeometry args={[1.5, 2, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Left Sleeve */}
      <mesh position={[-0.9, 0.4, 0]}>
        <boxGeometry args={[0.3, 0.8, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Right Sleeve */}
      <mesh position={[0.9, 0.4, 0]}>
        <boxGeometry args={[0.3, 0.8, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Logo */}
      <mesh position={[0, 0, 0.11]}>
        <boxGeometry args={[0.8, 0.4, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Stars */}
      <mesh position={[-0.5, 0.5, 0.11]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.5}
        />
      </mesh>

      <mesh position={[0.5, 0.5, 0.11]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

export default function CameraARScene({
  color = "#4a5568",
}: {
  color?: string;
}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [poseDetected, setPoseDetected] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [shoulderPos, setShoulderPos] = useState<ShoulderPosition>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const toggleCamera = async () => {
    // Cancel animation frame before switching cameras
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    // Stop current stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Reset detection state
    setPoseDetected(false);
    lastVideoTimeRef.current = -1;

    // Toggle facing mode - this will trigger the useEffect to restart camera
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacingMode);
  };

  useEffect(() => {
    let isComponentMounted = true;

    const initMediaPipe = async () => {
      try {
        console.log("Initializing MediaPipe...");

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });

        poseLandmarkerRef.current = poseLandmarker;
        console.log("MediaPipe initialized successfully");
      } catch (err) {
        console.error("MediaPipe initialization error:", err);
        setError("Failed to initialize pose detection");
      }
    };

    const startCamera = async () => {
      try {
        // Check if component is still mounted
        if (!isComponentMounted) return;

        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error(
            "Camera access is not supported. Please use HTTPS or a supported browser."
          );
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        // Check again if component is still mounted after async operation
        if (!isComponentMounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        setStream(mediaStream);
        streamRef.current = mediaStream;

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;

          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            if (!isComponentMounted) return;
            videoRef.current?.play().catch((err) => {
              console.error("Error playing video:", err);
            });
            detectPose();
          };
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);

        let errorMessage = err.message || "Failed to access camera";

        // Provide specific error messages for common issues
        if (err.name === "NotAllowedError") {
          errorMessage =
            "Camera access denied. Please allow camera permissions in your browser settings.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "No camera found on this device.";
        } else if (err.name === "NotReadableError") {
          errorMessage = "Camera is already in use by another application.";
        } else if (errorMessage.includes("getUserMedia")) {
          errorMessage =
            "Camera access requires HTTPS. Please access this site using https:// or use localhost for testing.";
        }

        setError(errorMessage);
      }
    };

    const detectPose = async () => {
      // Check if component is still mounted
      if (!isComponentMounted) return;

      if (
        !videoRef.current ||
        !canvasRef.current ||
        !poseLandmarkerRef.current
      ) {
        if (isComponentMounted) {
          animationFrameIdRef.current = requestAnimationFrame(detectPose);
        }
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState >= 2) {
        // Check if this is a new video frame
        const currentVideoTime = video.currentTime;
        if (currentVideoTime === lastVideoTimeRef.current) {
          if (isComponentMounted) {
            animationFrameIdRef.current = requestAnimationFrame(detectPose);
          }
          return;
        }
        lastVideoTimeRef.current = currentVideoTime;

        // Use video timestamp in milliseconds for MediaPipe
        const timestamp = performance.now();
        const results = poseLandmarkerRef.current.detectForVideo(
          video,
          timestamp
        );

        // Draw on canvas
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.landmarks && results.landmarks.length > 0) {
            setPoseDetected(true);
            const landmarks = results.landmarks[0];

            // MediaPipe pose landmarks indices:
            // 11 = left shoulder, 12 = right shoulder
            // 23 = left hip, 24 = right hip
            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];

            if (leftShoulder && rightShoulder && leftHip && rightHip) {
              // Calculate center position between shoulders
              const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
              const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;

              // Calculate center position between hips
              const hipCenterX = (leftHip.x + rightHip.x) / 2;
              const hipCenterY = (leftHip.y + rightHip.y) / 2;

              // T-shirt center should be between shoulders and hips (torso center)
              const torsoCenterX = (shoulderCenterX + hipCenterX) / 2;
              const torsoCenterY = (shoulderCenterY + hipCenterY) / 2;

              // Calculate shoulder width and torso height for scaling
              const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
              const torsoHeight = Math.abs(shoulderCenterY - hipCenterY);

              // Scale based on both width and height to maintain proportions
              const widthScale = shoulderWidth * 3;
              const heightScale = torsoHeight * 2.5;
              const scale = Math.max(
                0.5,
                Math.min(2.5, (widthScale + heightScale) / 2)
              );

              // Convert to Three.js coordinates (-1 to 1)
              const x = (torsoCenterX - 0.5) * 2;
              const y = -(torsoCenterY - 0.5) * 2;

              setShoulderPos({ x, y, scale });

              // Draw body tracking markers
              ctx.fillStyle = "#00ff00";
              ctx.strokeStyle = "#00ff00";
              ctx.lineWidth = 3;

              // Draw shoulder circles
              ctx.beginPath();
              ctx.arc(
                leftShoulder.x * canvas.width,
                leftShoulder.y * canvas.height,
                8,
                0,
                2 * Math.PI
              );
              ctx.fill();

              ctx.beginPath();
              ctx.arc(
                rightShoulder.x * canvas.width,
                rightShoulder.y * canvas.height,
                8,
                0,
                2 * Math.PI
              );
              ctx.fill();

              // Draw hip circles
              ctx.fillStyle = "#00ffff";
              ctx.beginPath();
              ctx.arc(
                leftHip.x * canvas.width,
                leftHip.y * canvas.height,
                8,
                0,
                2 * Math.PI
              );
              ctx.fill();

              ctx.beginPath();
              ctx.arc(
                rightHip.x * canvas.width,
                rightHip.y * canvas.height,
                8,
                0,
                2 * Math.PI
              );
              ctx.fill();

              // Draw shoulder line
              ctx.strokeStyle = "#00ff00";
              ctx.beginPath();
              ctx.moveTo(
                leftShoulder.x * canvas.width,
                leftShoulder.y * canvas.height
              );
              ctx.lineTo(
                rightShoulder.x * canvas.width,
                rightShoulder.y * canvas.height
              );
              ctx.stroke();

              // Draw hip line
              ctx.strokeStyle = "#00ffff";
              ctx.beginPath();
              ctx.moveTo(leftHip.x * canvas.width, leftHip.y * canvas.height);
              ctx.lineTo(rightHip.x * canvas.width, rightHip.y * canvas.height);
              ctx.stroke();

              // Draw torso outline (connecting shoulders to hips)
              ctx.strokeStyle = "#ffff00";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(
                leftShoulder.x * canvas.width,
                leftShoulder.y * canvas.height
              );
              ctx.lineTo(leftHip.x * canvas.width, leftHip.y * canvas.height);
              ctx.moveTo(
                rightShoulder.x * canvas.width,
                rightShoulder.y * canvas.height
              );
              ctx.lineTo(rightHip.x * canvas.width, rightHip.y * canvas.height);
              ctx.stroke();

              // Draw center point
              ctx.fillStyle = "#ff00ff";
              ctx.beginPath();
              ctx.arc(
                torsoCenterX * canvas.width,
                torsoCenterY * canvas.height,
                6,
                0,
                2 * Math.PI
              );
              ctx.fill();
            }
          } else {
            setPoseDetected(false);
          }
        }
      }

      if (isComponentMounted) {
        animationFrameIdRef.current = requestAnimationFrame(detectPose);
      }
    };

    initMediaPipe();
    startCamera();

    // Cleanup function - stops camera when component unmounts or facingMode changes
    return () => {
      console.log("Cleaning up camera and pose detection...");

      // Mark component as unmounted
      isComponentMounted = false;

      // Cancel animation frame first
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }

      // Stop all camera tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log("Stopped camera track:", track.kind);
        });
        streamRef.current = null;
      }

      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.onloadedmetadata = null;
      }

      // Reset refs
      lastVideoTimeRef.current = -1;

      // Clear state
      setStream(null);
      setPoseDetected(false);
    };
  }, [facingMode]);

  if (error) {
    return (
      <div className="w-full h-[600px] bg-red-100 rounded-lg flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📱🚫</div>
          <p className="text-red-600 font-semibold mb-3 text-lg">
            Camera Access Error
          </p>
          <p className="text-red-700 text-sm mb-4 font-medium">{error}</p>

          <div className="bg-white rounded-lg p-4 text-left text-xs text-gray-700 space-y-2">
            <p className="font-semibold text-gray-800 mb-2">💡 Solutions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>For iPhone/iOS:</strong> Access must use HTTPS
                (https://)
              </li>
              <li>
                <strong>For Testing:</strong> Deploy to Vercel/Netlify which
                provides HTTPS
              </li>
              <li>
                <strong>For Development:</strong> Use ngrok or cloudflared for
                HTTPS tunnel
              </li>
              <li>
                <strong>Permissions:</strong> Check Safari Settings → Camera
                permissions
              </li>
            </ul>
            <p className="mt-3 pt-2 border-t text-gray-600">
              <strong>Current URL:</strong>{" "}
              {typeof window !== "undefined"
                ? window.location.protocol
                : "unknown"}
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-2xl">
      {/* Camera Video Background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
      />

      {/* 3D Canvas Overlay */}
      <div
        className="absolute inset-0"
        style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
      >
        <Canvas
          camera={{ position: [0, 0, 3], fov: 75 }}
          gl={{ alpha: true }}
          style={{ background: "transparent" }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} />

          {/* 3D T-Shirt - positioned based on shoulder tracking */}
          <MerchTShirt
            color={color}
            position={[shoulderPos.x, shoulderPos.y, 0]}
            scale={shoulderPos.scale}
          />
        </Canvas>
      </div>

      {/* Pose Detection Canvas Overlay */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
      />

      {/* Status Indicator */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            poseDetected ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
        <span>
          {poseDetected ? "Tracking Active" : "Searching for body..."}
        </span>
      </div>

      {/* Camera Toggle Button */}
      <button
        onClick={toggleCamera}
        className="absolute top-4 left-4 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full shadow-lg transition-all"
        title={`Switch to ${facingMode === "user" ? "rear" : "front"} camera`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </button>

      {/* AR Instructions Overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-60 text-white p-3 rounded-lg text-sm">
        <p className="font-semibold mb-1">📸 Full Body Tracking AR Mode</p>
        <p className="text-xs">
          Position yourself in front of the camera. The t-shirt will
          automatically fit to your torso (shoulders to hips).
          {poseDetected && (
            <span className="text-green-400 ml-2">✓ Torso detected!</span>
          )}
        </p>
        <p className="text-xs mt-1 text-gray-300">
          <span className="text-green-400">●</span> Shoulders &nbsp;
          <span className="text-cyan-400">●</span> Hips &nbsp;
          <span className="text-yellow-400">—</span> Torso &nbsp;
          <span className="text-pink-400">●</span> Center
        </p>
      </div>
    </div>
  );
}
