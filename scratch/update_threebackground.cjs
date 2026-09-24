const fs = require('fs');
const targetFile = 'src/components/ThreeBackground.tsx';

const newContent = `import React, { useRef, useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Stars, Clouds, Cloud, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  level: number;
}

// Reusable hook to track Phaser camera scroll
const usePhaserScroll = () => {
  const [scroll, setScroll] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleScroll = (e: CustomEvent) => {
      setScroll({ x: e.detail.scrollX, y: e.detail.scrollY });
    };
    window.addEventListener('phaser-scroll', handleScroll as EventListener);
    return () => window.removeEventListener('phaser-scroll', handleScroll as EventListener);
  }, []);
  return scroll;
};

const DynamicCamera = () => {
  const scroll = usePhaserScroll();
  useFrame((state) => {
    // Escala suave do movimento do Phaser para o mundo 3D
    const targetX = scroll.x * 0.01;
    const targetY = scroll.y * 0.005; 
    
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.1);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, -targetY + 8, 0.1);
    state.camera.lookAt(state.camera.position.x, state.camera.position.y, 0);
  });
  return null;
};

// Procedural Scenery (Vegetation & Details)
const ProceduralScenery = ({ level }: { level: number }) => {
  const scroll = usePhaserScroll();
  
  const treeCount = 200;
  const mountCount = 50;
  
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const leavesRef = useRef<THREE.InstancedMesh>(null);
  const mountainRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    
    if (level === 1) {
      if (trunkRef.current && leavesRef.current) {
        for (let i = 0; i < treeCount; i++) {
          const x = (Math.random() - 0.5) * 800;
          const z = -Math.random() * 200 - 50; 
          
          dummy.position.set(x, 5, z);
          dummy.rotation.set(0, 0, (Math.random() - 0.5) * 0.3);
          dummy.scale.set(1.5, 10 + Math.random() * 8, 1.5);
          dummy.updateMatrix();
          trunkRef.current.setMatrixAt(i, dummy.matrix);
          
          dummy.position.set(x, dummy.position.y + dummy.scale.y * 0.45, z);
          dummy.rotation.set(0, Math.random() * Math.PI, 0);
          dummy.scale.set(8 + Math.random() * 6, 12 + Math.random() * 6, 8 + Math.random() * 6);
          dummy.updateMatrix();
          leavesRef.current.setMatrixAt(i, dummy.matrix);
        }
        trunkRef.current.instanceMatrix.needsUpdate = true;
        leavesRef.current.instanceMatrix.needsUpdate = true;
      }
      
      if (mountainRef.current) {
        for (let i = 0; i < mountCount; i++) {
          const x = (Math.random() - 0.5) * 1200;
          const z = -250 - Math.random() * 200; 
          dummy.position.set(x, -10, z);
          dummy.rotation.set(0, Math.random() * Math.PI, 0);
          const scale = 50 + Math.random() * 100;
          dummy.scale.set(scale, scale * 1.5, scale);
          dummy.updateMatrix();
          mountainRef.current.setMatrixAt(i, dummy.matrix);
        }
        mountainRef.current.instanceMatrix.needsUpdate = true;
      }
    } else if (level === 2 || level === 5) {
       if (trunkRef.current) {
          for (let i = 0; i < treeCount; i++) {
            const x = (Math.random() - 0.5) * 800;
            const z = -Math.random() * 300 - 50;
            dummy.position.set(x, 10 + Math.random() * 20, z);
            dummy.rotation.set((Math.random() - 0.5)*0.5, 0, (Math.random() - 0.5)*0.5);
            dummy.scale.set(3, 40 + Math.random() * 60, 3);
            dummy.updateMatrix();
            trunkRef.current.setMatrixAt(i, dummy.matrix);
          }
          trunkRef.current.instanceMatrix.needsUpdate = true;
       }
    } else {
       if (trunkRef.current) {
          for (let i = 0; i < treeCount; i++) {
            const x = (Math.random() - 0.5) * 800;
            const y = Math.random() * 150;
            const z = -Math.random() * 300 - 50;
            dummy.position.set(x, y, z);
            dummy.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
            const scale = 5 + Math.random() * 20;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            trunkRef.current.setMatrixAt(i, dummy.matrix);
          }
          trunkRef.current.instanceMatrix.needsUpdate = true;
       }
    }
  }, [level]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = scroll.x * 0.004; // Parallax
    }
  });

  return (
    <group ref={groupRef}>
      {level === 1 && (
        <>
          <instancedMesh ref={trunkRef} args={[undefined, undefined, treeCount]}>
            <cylinderGeometry args={[1, 1.5, 1, 8]} />
            <meshStandardMaterial color="#5C4033" roughness={0.9} />
          </instancedMesh>
          <instancedMesh ref={leavesRef} args={[undefined, undefined, treeCount]}>
            <coneGeometry args={[1, 1.5, 5]} />
            <meshStandardMaterial color="#228B22" roughness={0.8} />
          </instancedMesh>
          <instancedMesh ref={mountainRef} args={[undefined, undefined, mountCount]}>
            <coneGeometry args={[1, 1, 4]} />
            <meshStandardMaterial color="#4169E1" roughness={1} />
          </instancedMesh>
        </>
      )}
      
      {level === 2 && (
        <instancedMesh ref={trunkRef} args={[undefined, undefined, treeCount]}>
          <cylinderGeometry args={[2, 2, 1, 6]} />
          <meshStandardMaterial color="#4A4A4A" roughness={0.7} />
        </instancedMesh>
      )}
      
      {(level === 3 || level === 4) && (
        <instancedMesh ref={trunkRef} args={[undefined, undefined, treeCount]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={level === 3 ? "#00e5ff" : "#ff00ff"} emissive={level === 3 ? "#0044aa" : "#aa00aa"} emissiveIntensity={0.8} wireframe={true} />
        </instancedMesh>
      )}
      
      {level === 5 && (
        <instancedMesh ref={trunkRef} args={[undefined, undefined, treeCount]}>
          <coneGeometry args={[2, 1, 4]} />
          <meshStandardMaterial color="#2B2B2B" metalness={0.9} roughness={0.2} />
        </instancedMesh>
      )}
    </group>
  );
};


// Checkerboard Floor
const CheckerboardFloor = ({ level }: { level: number }) => {
  const scroll = usePhaserScroll();
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      let c1 = '#3a8b2a', c2 = '#8b5a2b'; // Level 1 
      if (level === 2) { c1 = '#1a0000'; c2 = '#aa2200'; } // Level 2
      if (level === 3) { c1 = '#1a052b'; c2 = '#00e5ff'; } // Level 3
      if (level === 4) { c1 = '#ff00aa'; c2 = '#110022'; } // Level 4
      if (level === 5) { c1 = '#111111'; c2 = '#660000'; } // Level 5

      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillRect(64, 64, 64, 64);
      ctx.fillStyle = c2;
      ctx.fillRect(64, 0, 64, 64);
      ctx.fillRect(0, 64, 64, 64);
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.magFilter = THREE.NearestFilter; 
    tex.repeat.set(100, 100); 
    return tex;
  }, [level]);

  useFrame((_, delta) => {
    if (texture) {
      texture.offset.y -= delta * 0.5;
      texture.offset.x = scroll.x * 0.005; 
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, -50]}>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial 
        ref={materialRef} 
        map={texture} 
        roughness={0.4} 
        metalness={level >= 3 ? 0.8 : 0.2} 
      />
    </mesh>
  );
};

// Floating Giant Rings
const GiantRings = ({ level }: { level: number }) => {
  const scroll = usePhaserScroll();
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.y += delta * 1.5;
        ring.position.y += Math.sin(Date.now() * 0.002 + i) * 0.02;
      });
      ringsRef.current.position.x = scroll.x * 0.008;
    }
  });

  return (
    <group ref={ringsRef}>
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 400,
            Math.random() * 20 + 5,
            (Math.random() - 0.5) * 300 - 100
          ]}
        >
          <torusGeometry args={[8, 1.5, 16, 32]} />
          <meshStandardMaterial 
            color="#FFD700" 
            emissive="#AA8800"
            emissiveIntensity={0.5}
            metalness={1} 
            roughness={0.1} 
          />
        </mesh>
      ))}
    </group>
  );
};

const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ level }) => {
  const skyProps = useMemo(() => {
    if (level === 1) return { sunPosition: [100, 20, -100] as [number, number, number], turbidity: 0.8, rayleigh: 0.5, mieCoefficient: 0.005, mieDirectionalG: 0.8 };
    if (level === 2) return { sunPosition: [100, -5, -100] as [number, number, number], turbidity: 10, rayleigh: 3, mieCoefficient: 0.1, mieDirectionalG: 0.9 };
    if (level === 4) return { sunPosition: [100, -100, -100] as [number, number, number], turbidity: 0.1, rayleigh: 0.1, mieCoefficient: 0.001, mieDirectionalG: 0.9 };
    if (level === 5) return { sunPosition: [100, 50, -100] as [number, number, number], turbidity: 20, rayleigh: 5, mieCoefficient: 0.2, mieDirectionalG: 0.9 };
    return { sunPosition: [100, -100, -100] as [number, number, number], turbidity: 0.1, rayleigh: 0.1, mieCoefficient: 0.001, mieDirectionalG: 0.9 };
  }, [level]);

  const bgColor = level === 1 ? '#87CEEB' 
                : level === 2 ? '#ffaa00' 
                : level === 3 || level === 4 ? '#050510' 
                : '#200000';

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, backgroundColor: bgColor }}>
      <Canvas camera={{ position: [0, 10, 50], fov: 60 }}>
        <fog attach="fog" args={[bgColor, 50, 400]} />
        <DynamicCamera />
        
        <ambientLight intensity={level === 2 || level === 5 ? 0.4 : 0.7} />
        <directionalLight 
          position={[100, 100, 50]} 
          intensity={1.5} 
          color={level === 2 ? '#ff8844' : level === 5 ? '#ff2200' : level === 4 ? '#ff00ff' : '#ffffff'} 
        />
        
        {(level === 1 || level === 2 || level === 5) && <Sky {...skyProps} />}
        {(level === 3 || level === 4) && <Stars radius={200} depth={50} count={5000} factor={4} saturation={1} fade speed={1} />}

        {(level === 1 || level === 2) && (
          <Clouds material={THREE.MeshBasicMaterial}>
            <Cloud segments={40} bounds={[100, 20, 50]} volume={50} color={level === 2 ? '#ffaa88' : '#ffffff'} position={[0, 40, -100]} />
          </Clouds>
        )}

        {/* --- THE 3 NEW LAYERS OF BACKGROUND --- */}
        <ProceduralScenery level={level} />
        <CheckerboardFloor level={level} />
        <GiantRings level={level} />

        {(level === 3 || level === 4 || level === 5) && (
          <Sparkles 
            count={1000} 
            scale={400} 
            size={level === 5 ? 8 : 4} 
            speed={level === 5 ? 2 : 0.5} 
            opacity={0.5} 
            color={level === 4 ? "#ff00ff" : level === 5 ? "#ff0000" : "#88aaff"} 
          />
        )}
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
\`;

fs.writeFileSync(targetFile, newContent);
console.log('ProceduralScenery added successfully!');
