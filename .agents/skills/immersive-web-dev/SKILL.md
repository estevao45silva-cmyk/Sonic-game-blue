---
name: immersive-web-dev
description: Instruções e melhores práticas para integrar bibliotecas 3D (React Three Fiber, Spline, Three.js) e de Animação (GSAP, Framer Motion) no projeto React. Acione essa skill quando o usuário quiser criar uma interface premium, 3D, interativa ou "legal para o site".
---

# Immersive Web Development Skill

This skill provides the best practices for building high-end, immersive, and 3D web interfaces using the stack installed in this project.

## The Immersive Stack
- **Three.js & React Three Fiber (R3F)**: Core 3D rendering.
- **Drei (`@react-three/drei`)**: Helpers for R3F (cameras, controls, loaders, HTML overlays).
- **GSAP**: For scroll-linked and complex sequenced animations.
- **Framer Motion**: For React UI component micro-interactions.
- **Spline**: For importing beautiful web-optimized 3D models and scenes.

## Guidelines for 3D Interfaces (R3F)
1. **Always wrap 3D components in `<Canvas>`**: R3F elements (`<mesh>`, `<ambientLight>`, etc.) cannot exist outside of a `<Canvas>` tag from `@react-three/fiber`.
2. **Use `<Html>` for DOM overlays**: When you need to put buttons or text floating inside the 3D world, use the `<Html>` component from `@react-three/drei`.
3. **Performance First**: 
   - Never load large assets on the main thread blocking the UI.
   - Use `<Suspense>` to wrap models that are being loaded asynchronously.
4. **Avoid standard `useState` in animation loops**: If you need an object to constantly rotate, do NOT update React state in `useFrame`. Update the `ref.current.rotation` directly to avoid re-rendering the whole tree 60 times per second.

## Example: Basic Floating 3D Component
```tsx
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const FloatingCube = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta;
    meshRef.current.rotation.y += delta;
  });
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
};

export default function Scene() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <FloatingCube />
      <OrbitControls />
    </Canvas>
  );
}
```

## Integrating GSAP
Use `useGSAP` (if available via `@gsap/react`) or a standard `useEffect` to trigger animations when the component mounts. Be sure to cleanup GSAP timelines in the unmount return function.

Use this knowledge whenever requested to build something impressive for the user!
