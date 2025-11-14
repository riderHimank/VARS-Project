import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber';

export function Oversized(props) {
  const { nodes, materials } = useGLTF('/Oversized.glb')
  const merchRef = useRef();
  useFrame(() => {
    if (merchRef.current && props.isRotating) {
      merchRef.current.rotation.y += 0.005;
    }
  });
  return (
    <group {...props} dispose={null} ref={merchRef}>
      <mesh geometry={nodes.Object_0004.geometry} material={materials.WOI} position={[0, -1.9, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.065} />
    </group>
  )
}

useGLTF.preload('/Oversized.glb')
