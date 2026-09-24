import React, { useRef, useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Stars, Clouds, Cloud, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  level: number;
}

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

// Câmera Dinâmica mas Estável ("Fixo")
const DynamicCamera = () => {
  const scroll = usePhaserScroll();
  useFrame((state) => {
    // Parallax suave apenas no eixo X para dar estabilidade 
    const targetX = scroll.x * 0.015;
    const targetY = 12; // Altura fixa da câmera para não pular junto com o personagem
    
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.1);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.1);
    state.camera.lookAt(state.camera.position.x, targetY - 4, 0);
  });
  return null;
};

// Cenário Procedural Melhorado
const ProceduralScenery = ({ level }: { level: number }) => {
  const scroll = usePhaserScroll();
  const treeCount = 150;
  
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const leavesRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    
    if (trunkRef.current && leavesRef.current) {
      for (let i = 0; i < treeCount; i++) {
        const x = (Math.random() - 0.5) * 1200;
        const z = -Math.random() * 400 - 80; // Afastado para trás
        
        // Tronco
        dummy.position.set(x, 2, z);
        dummy.rotation.set(0, 0, (Math.random() - 0.5) * 0.1);
        dummy.scale.set(1.5, 8 + Math.random() * 6, 1.5);
        dummy.updateMatrix();
        trunkRef.current.setMatrixAt(i, dummy.matrix);
        
        // Folhas (Copa da árvore)
        dummy.position.set(x, dummy.scale.y * 1.5 + 2, z);
        dummy.rotation.set(0, Math.random() * Math.PI, 0);
        dummy.scale.set(7 + Math.random() * 4, 12 + Math.random() * 6, 7 + Math.random() * 4);
        dummy.updateMatrix();
        leavesRef.current.setMatrixAt(i, dummy.matrix);
      }
      trunkRef.current.instanceMatrix.needsUpdate = true;
      leavesRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [level]);

  useFrame(() => {
    if (groupRef.current) {
      // Parallax para a vegetação
      groupRef.current.position.x = scroll.x * 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={trunkRef} args={[undefined as any, undefined as any, treeCount]}>
        <cylinderGeometry args={[1, 1.5, 1, 8]} />
        <meshStandardMaterial color={level === 1 ? "#5C4033" : level === 2 ? "#4A2E1B" : "#1a1a2e"} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={leavesRef} args={[undefined as any, undefined as any, treeCount]}>
        <coneGeometry args={[1, 1.5, 5]} />
        <meshStandardMaterial color={level === 1 ? "#32CD32" : level === 2 ? "#FFB7C5" : "#00FFFF"} roughness={0.7} />
      </instancedMesh>
    </group>
  );
};

// Ilhas Flutuantes (Green Hill / Angel Island Vibe)
const FloatingIslands = ({ level }: { level: number }) => {
  const scroll = usePhaserScroll();
  const islandCount = 20;
  
  const baseRef = useRef<THREE.InstancedMesh>(null);
  const topRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    if (baseRef.current && topRef.current) {
      for (let i = 0; i < islandCount; i++) {
        const x = (Math.random() - 0.5) * 1500;
        const y = Math.random() * 80 + 30; // Flutuando no alto
        const z = -Math.random() * 500 - 200; // Bem ao fundo
        const scale = 5 + Math.random() * 15;
        
        // Base de terra
        dummy.position.set(x, y, z);
        dummy.rotation.set(Math.PI, 0, 0); // Cone invertido
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        baseRef.current.setMatrixAt(i, dummy.matrix);
        
        // Topo de grama (Checkerboard ou verde vibrante)
        dummy.position.set(x, y + scale / 2, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(scale, scale * 0.2, scale);
        dummy.updateMatrix();
        topRef.current.setMatrixAt(i, dummy.matrix);
      }
      baseRef.current.instanceMatrix.needsUpdate = true;
      topRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [level]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.x = scroll.x * 0.003; // Parallax bem lento
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 2; // Flutuação suave
    }
  });

  if (level >= 3) return null; // Apenas nas fases de dia/tarde

  return (
    <group ref={groupRef}>
      <instancedMesh ref={baseRef} args={[undefined as any, undefined as any, islandCount]}>
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color={level === 1 ? "#8B4513" : "#6B3E2E"} roughness={1} />
      </instancedMesh>
      <instancedMesh ref={topRef} args={[undefined as any, undefined as any, islandCount]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial color={level === 1 ? "#32CD32" : "#FF69B4"} roughness={0.8} />
      </instancedMesh>
    </group>
  );
};

// Cachoeiras ao fundo
const Waterfalls = ({ level }: { level: number }) => {
  const scroll = usePhaserScroll();
  const waterRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.position.x = scroll.x * 0.002;
    }
    if (materialRef.current && materialRef.current.map) {
      materialRef.current.map.offset.y -= 0.02; // Água caindo
    }
  });

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#00F3FF';
      ctx.fillRect(0, 0, 64, 256);
      ctx.fillStyle = '#FFFFFF';
      for(let i=0; i<20; i++) {
        ctx.fillRect(Math.random()*64, Math.random()*256, 2, 20);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    return tex;
  }, []);

  if (level !== 1) return null; // Apenas na fase 1 (Estilo Green Hill)

  return (
    <group ref={waterRef}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[(i - 2) * 400, 20, -350]}>
          <planeGeometry args={[50, 200]} />
          <meshStandardMaterial ref={i===0 ? materialRef : null} map={texture} transparent opacity={0.8} color="#00F3FF" emissive="#0088AA" />
        </mesh>
      ))}
    </group>
  );
};

// Piso Xadrez Aprimorado e Fixo (Bug Resolvido)
const CheckerboardFloor = ({ level }: { level: number }) => {
  const scroll = usePhaserScroll();
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      let c1 = '#2E8B57', c2 = '#3CB371'; 
      if (level === 2) { c1 = '#DDA0DD'; c2 = '#DA70D6'; } // Mystic Pastel Pink/Purple
      if (level === 3) { c1 = '#191970'; c2 = '#483D8B'; } 
      if (level >= 4) { c1 = '#2F4F4F'; c2 = '#1C1C1C'; } 

      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillRect(256, 256, 256, 256);
      ctx.fillStyle = c2;
      ctx.fillRect(256, 0, 256, 256);
      ctx.fillRect(0, 256, 256, 256);
      
      // Detalhes brilhantes no quadriculado
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, 256, 256);
      ctx.strokeRect(256, 0, 256, 256);
      ctx.strokeRect(256, 256, 256, 256);
      ctx.strokeRect(0, 256, 256, 256);
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 16; // Melhor qualidade à distância
    tex.repeat.set(150, 150); 
    return tex;
  }, [level]);

  useFrame(() => {
    if (materialRef.current && materialRef.current.map) {
      // O piso agora SÓ se move quando o personagem anda! Fixo e estável.
      materialRef.current.map.offset.x = scroll.x * 0.0015;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, -150]}>
      <planeGeometry args={[3000, 3000]} />
      <meshStandardMaterial 
        ref={materialRef} 
        map={texture} 
        roughness={0.6}
        metalness={0.2}
      />
    </mesh>
  );
};

// Moedas Gigantes Fixadas e Brilhantes (Bug de movimento infinito resolvido)
const GiantRings = ({ level }: { level: number }) => {
  const scroll = usePhaserScroll();
  const ringsRef = useRef<THREE.Group>(null);
  
  // Guardamos as posições bases INICIAIS, sem acumular
  const initialData = useMemo(() => {
    return Array.from({ length: 30 }).map(() => ({
      x: (Math.random() - 0.5) * 1000,
      y: Math.random() * 50 + 10,
      z: (Math.random() - 0.5) * 400 - 100,
      speed: Math.random() * 2 + 1,
      offset: Math.random() * Math.PI * 2
    }));
  }, []);

  useFrame((state) => {
    if (ringsRef.current) {
      const time = state.clock.elapsedTime;
      ringsRef.current.children.forEach((ring, i) => {
        // Gira perfeitamente baseado no tempo absoluto
        ring.rotation.y = time * initialData[i].speed + initialData[i].offset;
        // Flutua no lugar sem voar embora
        ring.position.y = initialData[i].y + Math.sin(time * 2 + initialData[i].offset) * 2.5;
      });
      // Parallax
      ringsRef.current.position.x = scroll.x * 0.008;
    }
  });

  return (
    <group ref={ringsRef}>
      {initialData.map((data, i) => (
        <mesh key={i} position={[data.x, data.y, data.z]}>
          <torusGeometry args={[10, 1.8, 16, 48]} />
          <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFA500" 
            emissiveIntensity={0.6} 
            metalness={1} 
            roughness={0.1} 
          />
        </mesh>
      ))}
    </group>
  );
};

// Céu Lindo e Detalhado
const BeautifulSky = ({ level }: { level: number }) => {
  const isNight = level >= 3;
  return (
    <>
      <ambientLight intensity={isNight ? 0.3 : 0.7} />
      <directionalLight 
        position={[100, 100, 50]} 
        intensity={isNight ? 0.5 : 2.5} 
        color={isNight ? "#8888ff" : "#ffffff"}
      />
      
      {/* Céu realista */}
      {!isNight && (
        <Sky 
          distance={450000} 
          sunPosition={level === 2 ? [0, 0, -100] : [100, 50, -100]} 
          inclination={level === 2 ? 0.49 : 0} 
          azimuth={0.25} 
          turbidity={level === 2 ? 8 : 1} 
          rayleigh={level === 2 ? 2 : 0.5} 
        />
      )}
      
      {/* Nuvens Animadas */}
      <Clouds material={THREE.MeshStandardMaterial}>
        <Cloud segments={60} bounds={[300, 40, 100]} volume={150} color={level === 2 ? '#FFB6C1' : isNight ? '#4B0082' : '#FFFFFF'} position={[0, 80, -200]} speed={0.2} opacity={0.7} />
      </Clouds>

      {/* Partículas de Cerejeira Místicas (Fase 2) */}
      {level === 2 && (
        <Sparkles count={1500} scale={600} size={8} speed={0.6} opacity={0.9} color="#FF69B4" />
      )}

      {/* Estrelas e Partículas para um efeito Mágico (Fase 3) */}
      {isNight && (
        <>
          <Stars radius={200} depth={50} count={6000} factor={6} saturation={1} fade speed={1} />
          <Sparkles count={2000} scale={600} size={5} speed={0.4} opacity={0.7} color="#00FFFF" />
        </>
      )}
    </>
  );
};

const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ level }) => {
  let bgColor = '#87CEEB'; // Dia
  if (level === 2) bgColor = '#FFC0CB'; // Sakura Sunset
  if (level >= 3) bgColor = '#000022'; // Noite Estrelada

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, backgroundColor: bgColor }}>
      <Canvas camera={{ position: [0, 10, 50], fov: 60 }}>
        {/* Nevoeiro maravilhoso para integrar o piso com o horizonte */}
        <fog attach="fog" args={[bgColor, 80, 500]} />
        
        <DynamicCamera />
        <BeautifulSky level={level} />
        <Waterfalls level={level} />
        <FloatingIslands level={level} />
        <ProceduralScenery level={level} />
        <CheckerboardFloor level={level} />
        <GiantRings level={level} />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
