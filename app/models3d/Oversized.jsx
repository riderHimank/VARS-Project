import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Oversized(props) {
  const { nodes, materials } = useGLTF('/Oversized.glb')
  console.log(materials)
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Object_0004.geometry} material={materials.WOI} position={[0, -1.9, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.065} />
    </group>
  )
}

useGLTF.preload('/Oversized.glb')
