import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Stars, Clouds, Cloud, Environment, Float, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  level: number;
}

const DynamicCamera = () => {
  const [scroll, setScroll] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = (e: CustomEvent) => {
      setScroll({ x: e.detail.scrollX, y: e.detail.scrollY });
    };
    window.addEventListener('phaser-scroll', handleScroll as EventListener);
    return () => window.removeEventListener('phaser-scroll', handleScroll as EventListener);
  }, []);

  useFrame((state) => {
    // Smoothly interpolate camera position based on Phaser scroll
    // Phaser X can go from 0 to 50000. Let's scale it down for 3D world.
    const targetX = scroll.x * 0.01;
    const targetY = scroll.y * 0.005; // Parallax
    
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.1);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, -targetY + 10, 0.1);
    state.camera.lookAt(state.camera.position.x, state.camera.position.y, 0);
  });

  return null;
};

// Procedural Terrain / Ocean
const ProceduralTerrain = ({ level }: { level: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = level === 1 ? '#0077ff' : level === 2 ? '#ff3300' : '#8800ff';
  const emissive = level === 1 ? '#001155' : level === 2 ? '#550000' : '#110055';

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.z = -100;
      meshRef.current.position.y = -20;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1000, 1000, 64, 64]} />
      <MeshDistortMaterial
        color={color}
        emissive={emissive}
        distort={level === 2 ? 0.6 : 0.3} // Lava distorts more
        speed={level === 2 ? 3 : 1}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
};

const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ level }) => {
  // Configurações de acordo com o nível
  const skyProps = useMemo(() => {
    if (level === 1) return { sunPosition: [100, 20, -100] as [number, number, number], turbidity: 0.8, rayleigh: 0.5, mieCoefficient: 0.005, mieDirectionalG: 0.8 };
    if (level === 2) return { sunPosition: [100, -5, -100] as [number, number, number], turbidity: 10, rayleigh: 3, mieCoefficient: 0.1, mieDirectionalG: 0.9 }; // Pôr do sol / Lava
    return { sunPosition: [100, -100, -100] as [number, number, number], turbidity: 0.1, rayleigh: 0.1, mieCoefficient: 0.001, mieDirectionalG: 0.9 }; // Noite / Espaço
  }, [level]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, backgroundColor: level === 3 ? '#050510' : '#87CEEB' }}>
      <Canvas camera={{ position: [0, 10, 50], fov: 60 }}>
        <DynamicCamera />
        
        <ambientLight intensity={level === 2 ? 0.3 : 0.5} />
        <directionalLight position={[100, 100, 50]} intensity={1.5} color={level === 2 ? '#ff8844' : '#ffffff'} />
        
        {level !== 3 && <Sky {...skyProps} />}
        {level === 3 && <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={1} />}

        <Clouds material={THREE.MeshBasicMaterial}>
          <Cloud segments={40} bounds={[100, 20, 50]} volume={50} color={level === 2 ? '#ffaa88' : '#ffffff'} position={[0, 40, -100]} />
        </Clouds>

        <ProceduralTerrain level={level} />

        {/* Floating abstract decorative elements in the background */}
        {Array.from({ length: 20 }).map((_, i) => (
          <Float
            key={i}
            speed={1} 
            rotationIntensity={1} 
            floatIntensity={2} 
            position={[
              (Math.random() - 0.5) * 400,
              Math.random() * 50 + 10,
              (Math.random() - 0.5) * 400 - 100
            ]}
          >
            <mesh>
              {level === 1 ? <octahedronGeometry args={[Math.random() * 5 + 2]} /> : <boxGeometry args={[Math.random()*10, Math.random()*10, Math.random()*10]} />}
              <meshStandardMaterial color={level === 2 ? '#880000' : '#4488ff'} wireframe={level === 3} roughness={0.1} metalness={0.8} />
            </mesh>
          </Float>
        ))}

        {level === 3 && <Sparkles count={1000} scale={200} size={5} speed={0.4} opacity={0.2} color="#88aaff" />}
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
