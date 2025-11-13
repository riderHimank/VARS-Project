import React, { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function Regular(props) {
  const { scene } = useGLTF('./Regular.glb')

  useEffect(() => {
    if (scene) {
      // Center the entire scene
      const box = new THREE.Box3().setFromObject(scene)
      const center = box.getCenter(new THREE.Vector3())
      scene.position.sub(center)
    }
  }, [scene])

  return <primitive object={scene} {...props} />
}

useGLTF.preload('./Regular.glb')
