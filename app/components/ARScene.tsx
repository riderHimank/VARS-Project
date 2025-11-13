"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function MerchTShirt({ color }: { color: string }) {
  const groupRef = useRef<any>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main T-Shirt body */}
      <mesh>
        <boxGeometry args={[2, 2.5, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Left Sleeve */}
      <mesh position={[-1.2, 0.5, 0]}>
        <boxGeometry args={[0.4, 1, 0.25]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Right Sleeve */}
      <mesh position={[1.2, 0.5, 0]}>
        <boxGeometry args={[0.4, 1, 0.25]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Logo background */}
      <mesh position={[0, 0, 0.16]}>
        <boxGeometry args={[1.2, 0.6, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Decorative stars */}
      <mesh position={[-0.7, 0.7, 0.16]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.5}
        />
      </mesh>

      <mesh position={[0.7, 0.7, 0.16]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

export default function ARScene({ color = "#4a5568" }: { color?: string }) {
  return (
    <div className="w-full h-[600px] bg-gradient-to-b from-purple-900 to-indigo-900 rounded-lg overflow-hidden shadow-2xl">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <OrbitControls enableZoom={true} enablePan={true} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <spotLight position={[0, 10, 0]} intensity={0.3} />

        {/* 3D T-Shirt */}
        <MerchTShirt color={color} />
      </Canvas>
    </div>
  );
}
