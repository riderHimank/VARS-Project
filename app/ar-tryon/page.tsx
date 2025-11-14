"use client"; // Remove for Pages Router

import { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useSearchParams, useRouter } from "next/navigation"; // Use 'next/router' for Pages Router
import * as THREE from "three";
import { Regular } from "../models3d/Regular";
import { Hoodie } from "../models3d/Hoodie";
import { Oversized } from "../models3d/Oversized";
import styles from "./ar-tryon.module.css";

interface ShoulderPosition {
  x: number;
  y: number;
  scale: number;
}

export default function ARTryOnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modelType = searchParams.get("model") || "regular";

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [poseDetected, setPoseDetected] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [shoulderPos, setShoulderPos] = useState<ShoulderPosition>({
    x: 0,
    y: 0,
    scale: 1,
  });

  // Initialize MediaPipe
  useEffect(() => {
    let isComponentMounted = true;

    const initMediaPipe = async () => {
      try {
        console.log("Initializing MediaPipe Pose...");

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
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        poseLandmarkerRef.current = poseLandmarker;
        console.log("MediaPipe initialized successfully");
      } catch (err) {
        console.error("MediaPipe initialization error:", err);
        setError(
          "Failed to initialize pose detection. Please refresh the page."
        );
      }
    };

    const startCamera = async () => {
      try {
        // Check if component is still mounted
        if (!isComponentMounted) return;

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
        const currentVideoTime = video.currentTime;
        if (currentVideoTime === lastVideoTimeRef.current) {
          if (isComponentMounted) {
            animationFrameIdRef.current = requestAnimationFrame(detectPose);
          }
          return;
        }
        lastVideoTimeRef.current = currentVideoTime;

        const timestamp = performance.now();
        const results = poseLandmarkerRef.current.detectForVideo(
          video,
          timestamp
        );

        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.landmarks && results.landmarks.length > 0) {
            setPoseDetected(true);
            const landmarks = results.landmarks[0];

            // Key landmarks for torso positioning
            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];

            if (leftShoulder && rightShoulder && leftHip && rightHip) {
              // Calculate center positions
              const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
              const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;

              const hipCenterX = (leftHip.x + rightHip.x) / 2;
              const hipCenterY = (leftHip.y + rightHip.y) / 2;

              // T-shirt center is between shoulders and hips
              const torsoCenterX = (shoulderCenterX + hipCenterX) / 2;
              const torsoCenterY = (shoulderCenterY + hipCenterY) / 2;

              // Calculate scaling based on body dimensions
              const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
              const torsoHeight = Math.abs(shoulderCenterY - hipCenterY);

              // Scale adjustment based on model type
              let scaleMultiplier = 3;
              if (modelType === "hoodie") scaleMultiplier = 2.8;
              if (modelType === "oversized") scaleMultiplier = 3.5;

              const widthScale = shoulderWidth * scaleMultiplier;
              const heightScale = torsoHeight * 2.5;
              const scale = Math.max(
                0.5,
                Math.min(2.5, (widthScale + heightScale) / 2)
              );

              // Convert to Three.js coordinates
              const x = (torsoCenterX - 0.5) * 2;
              const y = -(torsoCenterY - 0.5) * 2;

              setShoulderPos({ x, y, scale });

              // Draw pose tracking visualization
              drawPoseVisualization(
                ctx,
                landmarks,
                canvas.width,
                canvas.height
              );
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

    const drawPoseVisualization = (
      ctx: CanvasRenderingContext2D,
      landmarks: any[],
      width: number,
      height: number
    ) => {
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];

      // Draw shoulder circles
      ctx.fillStyle = "#00ff00";
      ctx.beginPath();
      ctx.arc(
        leftShoulder.x * width,
        leftShoulder.y * height,
        8,
        0,
        2 * Math.PI
      );
      ctx.fill();

      ctx.beginPath();
      ctx.arc(
        rightShoulder.x * width,
        rightShoulder.y * height,
        8,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Draw hip circles
      ctx.fillStyle = "#00ffff";
      ctx.beginPath();
      ctx.arc(leftHip.x * width, leftHip.y * height, 8, 0, 2 * Math.PI);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(rightHip.x * width, rightHip.y * height, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Draw shoulder line
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(leftShoulder.x * width, leftShoulder.y * height);
      ctx.lineTo(rightShoulder.x * width, rightShoulder.y * height);
      ctx.stroke();

      // Draw hip line
      ctx.strokeStyle = "#00ffff";
      ctx.beginPath();
      ctx.moveTo(leftHip.x * width, leftHip.y * height);
      ctx.lineTo(rightHip.x * width, rightHip.y * height);
      ctx.stroke();

      // Draw torso outline
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftShoulder.x * width, leftShoulder.y * height);
      ctx.lineTo(leftHip.x * width, leftHip.y * height);
      ctx.moveTo(rightShoulder.x * width, rightShoulder.y * height);
      ctx.lineTo(rightHip.x * width, rightHip.y * height);
      ctx.stroke();
    };

    initMediaPipe();
    startCamera();

    // Cleanup - runs when component unmounts or dependencies change
    return () => {
      console.log("Cleaning up AR try-on camera and pose detection...");

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
          console.log("Stopped AR camera track:", track.kind);
        });
        streamRef.current = null;
      }

      // Clear video source and event handlers
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
  }, [facingMode, modelType]);

  const toggleCamera = () => {
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

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorBox}>
          <p className={styles.errorTitle}>📱 Camera Access Error</p>
          <p className={styles.errorMessage}>{error}</p>
          <div className={styles.errorSolutions}>
            <p className={styles.solutionsTitle}>💡 Solutions:</p>
            <ul>
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
                <strong>Permissions:</strong> Check browser camera permissions
              </li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => router.back()}>
        X
      </button>

      <div className={styles.arContainer}>
        {/* Hidden video element for camera feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.hiddenVideo}
        />

        {/* Camera feed with mirroring */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.videoFeed}
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        />

        {/* 3D Canvas Overlay */}
        <div
          className={styles.canvasOverlay}
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        >
          <Canvas
            camera={{ position: [0, 0, 3], fov: 75 }}
            gl={{ alpha: true }}
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <pointLight position={[-5, -5, -5]} intensity={0.5} />

            <Suspense fallback={null}>
              <MerchModel
                modelType={modelType}
                position={[shoulderPos.x, shoulderPos.y, 0]}
                scale={shoulderPos.scale}
                visible={poseDetected}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Pose Detection Debug Canvas */}
        <canvas
          ref={canvasRef}
          className={styles.debugCanvas}
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        />

        {/* Status Indicator */}
        <div className={styles.statusIndicator}>
          <div
            className={`${styles.statusDot} ${
              poseDetected ? styles.active : ""
            }`}
          ></div>
          <span>
            {poseDetected ? "Tracking Active" : "Searching for body..."}
          </span>
        </div>

        {/* Camera Toggle Button */}
        <button
          onClick={toggleCamera}
          className={styles.cameraToggle}
          title={`Switch to ${facingMode === "user" ? "rear" : "front"} camera`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </button>

        {/* Instructions */}
        <div className={styles.instructions}>
          <p className={styles.instructionsTitle}>
            📸 AR Try-On: {modelType.toUpperCase()}
          </p>
          <p className={styles.instructionsText}>
            Position yourself in front of the camera. The {modelType} will
            automatically fit to your torso.
            {poseDetected && (
              <span className={styles.detected}>✓ Body detected!</span>
            )}
          </p>
          <p className={styles.legendText}>
            <span className={styles.green}>●</span> Shoulders &nbsp;
            <span className={styles.cyan}>●</span> Hips &nbsp;
            <span className={styles.yellow}>—</span> Torso &nbsp;
            <span className={styles.magenta}>●</span> Center
          </p>
        </div>
      </div>
    </div>
  );
}

// Component to render the correct 3D model
function MerchModel({
  modelType,
  position,
  scale,
  visible,
}: {
  modelType: string;
  position: [number, number, number];
  scale: number;
  visible: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current && visible) {
      groupRef.current.position.set(...position);
      groupRef.current.scale.setScalar(scale);
      groupRef.current.visible = true;
    } else if (groupRef.current) {
      groupRef.current.visible = false;
    }
  });

  return (
    <group ref={groupRef}>
      {modelType === "hoodie" && <Hoodie />}
      {modelType === "regular" && <Regular />}
      {modelType === "oversized" && <Oversized />}
    </group>
  );
}
