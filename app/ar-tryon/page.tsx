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
import { is } from "@react-three/fiber/dist/declarations/src/core/utils";

interface ShoulderPosition {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}

function ARTryOnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modelType = searchParams.get("model") || "regular";
  const [isMobile, setIsMobile] = useState(true);

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
    scaleX: 1,
    scaleY: 1,
  });

  useEffect(() => {}, []);

  // Initialize MediaPipe
  useEffect(() => {
    let isComponentMounted = true;
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    const initMediaPipe = async () => {
      try {
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

              // Convert to Three.js coordinates
              let x = (torsoCenterX - 0.5) * 2;
              let y = -(torsoCenterY - 0.5) * 2;

              // Scale adjustment based on model type
              // Increased width multipliers and decreased height multipliers for better proportions
              let widthMultiplier = isMobile ? 1.4 : 5;
              let heightMultiplier = isMobile ? 1.3 : 1.7;

              if (modelType === "regular") {
                y += 0.1;
              }
              if (modelType === "hoodie") {
                widthMultiplier = isMobile ? 1.9 : 4.6;
                heightMultiplier = isMobile ? 1.5 : 1.9;
                y += 0.2;
              }
              if (modelType === "oversized") {
                widthMultiplier = isMobile ? 1.4 : 5;
                heightMultiplier = isMobile ? 1.3 : 1.7;
                y += 0.2;
              }

              // Calculate separate X and Y scales with proper bounds
              const scaleX = Math.max(
                0.3,
                Math.min(1.5, shoulderWidth * widthMultiplier)
              );
              const scaleY = Math.max(
                0.3,
                Math.min(1.5, torsoHeight * heightMultiplier)
              );

              setShoulderPos({ x, y, scaleX, scaleY });

              // Draw pose tracking visualization
              // drawPoseVisualization(
              //   ctx,
              //   landmarks,
              //   canvas.width,
              //   canvas.height
              // );
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
    handleResize();
    initMediaPipe();
    startCamera();

    // Cleanup - runs when component unmounts or dependencies change
    return () => {
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
      window.removeEventListener("resize", handleResize);
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
                <strong>For Mobile Phones:</strong> Access must use HTTPS
                (https://)
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
        ←
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
                scale={[
                  shoulderPos.scaleX,
                  shoulderPos.scaleY,
                  shoulderPos.scaleX,
                ]}
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
          <span
            style={{
              fontFamily: "StoneSlab",
            }}
          >
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
          <p
            className={styles.instructionsTitle}
            style={{
              fontFamily: "GameTape",
              fontSize: "20px",
            }}
          >
            AR Try-On: {modelType.toUpperCase()}
          </p>
          <p
            className={styles.instructionsText}
            style={{
              fontFamily: "StoneSlab",
            }}
          >
            Position yourself in front of the camera. The {modelType} will
            automatically fit.
            {poseDetected && (
              <span className={styles.detected}>✓ Body detected!</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary
export default function ARTryOnPage() {
  return (
    <Suspense fallback={<div className={styles.container}>Loading...</div>}>
      <ARTryOnContent />
    </Suspense>
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
  scale: number | [number, number, number];
  visible: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current && visible) {
      groupRef.current.position.set(...position);
      // Support both uniform scale (number) and separate scale (array)
      if (typeof scale === "number") {
        groupRef.current.scale.setScalar(scale);
      } else {
        groupRef.current.scale.set(scale[0], scale[1], scale[2]);
      }
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
