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

// Câmera Dinâmica mas Estável
const DynamicCamera = () => {
  const scroll = usePhaserScroll();
  useFrame((state) => {
    const targetX = scroll.x * 0.015;
    const targetY = 12; 
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.1);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.1);
    state.camera.lookAt(state.camera.position.x, targetY - 4, 0);
  });
  return null;
};

// ==========================================
// PISO ÚNICO POR LEVEL (Sem Xadrez!)
// ==========================================
const ThemedFloor = ({ level }: { level: number }) => {
  const scroll = usePhaserScroll();
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (level === 1) {
        // GREEN HILL: Grama natural com variações suaves, sem xadrez
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(0, 0, 512, 512);
        for(let i=0; i<200; i++) {
          ctx.fillStyle = `rgba(46, 204, 113, ${Math.random() * 0.5})`;
          ctx.beginPath();
          ctx.arc(Math.random()*512, Math.random()*512, Math.random()*20+10, 0, Math.PI*2);
          ctx.fill();
        }
      } else if (level === 2) {
        // MARBLE ZONE: Pedras rachadas antigas
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#1a252f';
        ctx.lineWidth = 4;
        for(let i=0; i<8; i++) {
          for(let j=0; j<8; j++) {
            ctx.strokeRect(i*64, j*64, 64, 64);
          }
        }
        // Runas brilhantes espalhadas
        ctx.fillStyle = 'rgba(155, 89, 182, 0.3)';
        ctx.font = '30px monospace';
        ctx.fillText('⚡', 32, 32);
        ctx.fillText('⚡', 200, 400);
      } else if (level === 3) {
        // STAR LIGHT: Synthwave Grid Metal
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        for(let i=0; i<512; i+=64) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
        }
        ctx.shadowBlur = 0;
      } else if (level === 4) {
        // CASINO: Chão de vidro preto com confetes neon
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 512, 512);
        const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0000'];
        for(let i=0; i<100; i++) {
          ctx.fillStyle = colors[Math.floor(Math.random()*colors.length)];
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(Math.random()*512, Math.random()*512, Math.random()*5+2, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      } else {
        // VOLCANO: Obsidiana com lava
        ctx.fillStyle = '#110000';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#ff3300';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(0, 100); ctx.lineTo(200, 300); ctx.lineTo(512, 200);
        ctx.moveTo(300, 0); ctx.lineTo(200, 300); ctx.lineTo(250, 512);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 16; 
    tex.repeat.set(150, 150); 
    return tex;
  }, [level]);

  useFrame(() => {
    if (materialRef.current && materialRef.current.map) {
      materialRef.current.map.offset.x = scroll.x * 0.0015;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, -150]}>
      <planeGeometry args={[3000, 3000]} />
      <meshStandardMaterial 
        ref={materialRef} 
        map={texture} 
        roughness={level === 4 ? 0.1 : 0.7} // Casino é super reflexivo
        metalness={level === 3 || level === 4 ? 0.8 : 0.1} // Metalico no starlight/casino
      />
    </mesh>
  );
};

// ==========================================
// OBJETOS FLUTUANTES ÚNICOS POR MAPA
// ==========================================
const ThemedFloatingObjects = ({ level }: { level: number }) => {
  const scroll = usePhaserScroll();
  const objCount = 25;
  const meshRef1 = useRef<THREE.InstancedMesh>(null);
  const meshRef2 = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    if (meshRef1.current) {
      for (let i = 0; i < objCount; i++) {
        const x = (Math.random() - 0.5) * 1500;
        const y = Math.random() * 80 + 30; 
        const z = -Math.random() * 500 - 150; 
        const scale = 5 + Math.random() * 15;
        
        dummy.position.set(x, y, z);
        dummy.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
        
        if (level === 1) { // Ilhas flutuantes com cone e grama em cima
           dummy.rotation.set(Math.PI, 0, 0);
           dummy.scale.set(scale, scale, scale);
        } else if (level === 2) { // Pilares antigos flutuando
           dummy.rotation.set(0, 0, 0);
           dummy.scale.set(scale*0.5, scale*3, scale*0.5);
        } else if (level === 3) { // Cubos neon gigantes
           dummy.scale.set(scale, scale, scale);
        } else if (level === 4) { // Cartas de baralho gigantes ou dados
           dummy.scale.set(scale*2, scale*0.1, scale*1.5);
        } else { // Pedras vulcânicas escuras
           dummy.scale.set(scale*1.2, scale*0.8, scale*1.1);
        }
        
        dummy.updateMatrix();
        meshRef1.current.setMatrixAt(i, dummy.matrix);
        
        // Secondary meshes (Grama para lv1, detalhes para lv3, etc)
        if (meshRef2.current && level === 1) {
          dummy.position.set(x, y + scale / 2, z);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(scale, scale * 0.2, scale);
          dummy.updateMatrix();
          meshRef2.current.setMatrixAt(i, dummy.matrix);
        }
      }
      meshRef1.current.instanceMatrix.needsUpdate = true;
      if (meshRef2.current) meshRef2.current.instanceMatrix.needsUpdate = true;
    }
  }, [level]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.x = scroll.x * 0.003; 
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 2; 
      
      // Rotação lenta para blocos no casino/starlight/vulcao
      if (level >= 3 && meshRef1.current) {
         // Atualizar instancias seria custoso por frame, então giramos o grupo um pouco
         groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Mesh Principal */}
      <instancedMesh ref={meshRef1} args={[undefined as any, undefined as any, objCount]}>
        {level === 1 ? <coneGeometry args={[1, 1, 8]} /> : 
         level === 2 ? <cylinderGeometry args={[1, 1, 1, 6]} /> : 
         level === 3 ? <boxGeometry args={[1, 1, 1]} /> : 
         level === 4 ? <boxGeometry args={[1, 1, 1]} /> : 
         <dodecahedronGeometry args={[1, 0]} />}
         
        <meshStandardMaterial 
          color={
            level === 1 ? "#8B4513" : 
            level === 2 ? "#2c3e50" : 
            level === 3 ? "#00ffff" : 
            level === 4 ? "#ff00ff" : 
            "#110000"
          } 
          roughness={level >= 3 ? 0.2 : 0.9} 
          emissive={level === 3 ? "#00aaaa" : level === 4 ? "#aa00aa" : "#000000"}
          emissiveIntensity={0.5}
        />
      </instancedMesh>
      
      {/* Mesh Secundária (Grama Green Hill) */}
      {level === 1 && (
        <instancedMesh ref={meshRef2} args={[undefined as any, undefined as any, objCount]}>
          <cylinderGeometry args={[1, 1, 1, 8]} />
          <meshStandardMaterial color="#2ecc71" roughness={0.8} />
        </instancedMesh>
      )}
    </group>
  );
};

// ==========================================
// CÉUS COMPLETAMENTE ÚNICOS E DRAMÁTICOS
// ==========================================
const ThemedSky = ({ level }: { level: number }) => {
  return (
    <>
      {level === 1 && (
        <>
          <ambientLight intensity={0.7} />
          <directionalLight position={[100, 100, 50]} intensity={2.5} color="#ffffff" />
          <Sky distance={450000} sunPosition={[100, 50, -100]} inclination={0} azimuth={0.25} turbidity={1} rayleigh={0.5} />
        </>
      )}

      {level === 2 && (
        <>
          <ambientLight intensity={0.5} color="#ffb6c1" />
          <directionalLight position={[-100, 20, -50]} intensity={3} color="#ff4500" /> {/* Sunset Light */}
          <Sky distance={450000} sunPosition={[-100, 5, -100]} inclination={0.49} azimuth={0.25} turbidity={8} rayleigh={2} />
          {/* Petalas magicas ao vento */}
          <Sparkles count={1000} scale={800} size={8} speed={0.8} opacity={0.9} color="#FF69B4" noise={1} />
        </>
      )}

      {level === 3 && (
        <>
          <ambientLight intensity={0.3} color="#0000ff" />
          <directionalLight position={[0, 100, -100]} intensity={1.5} color="#00ffff" />
          <Stars radius={300} depth={50} count={8000} factor={6} saturation={1} fade speed={1.5} />
          {/* Particulas tecnologicas verticais */}
          <Sparkles count={2000} scale={600} size={4} speed={0.4} opacity={0.8} color="#00FFFF" />
        </>
      )}

      {level === 4 && (
        <>
          <ambientLight intensity={0.4} color="#ff00ff" />
          <directionalLight position={[100, -50, -100]} intensity={2} color="#ffff00" /> {/* Luzes de baixo */}
          <Stars radius={200} depth={100} count={3000} factor={8} saturation={1} fade speed={2} />
          {/* Chuva de dinheiro/confete brilhante */}
          <Sparkles count={3000} scale={600} size={6} speed={1} opacity={1} color="#FFD700" noise={10} />
          <Sparkles count={3000} scale={600} size={6} speed={1.2} opacity={1} color="#FF00FF" noise={10} />
        </>
      )}

      {level === 5 && (
        <>
          <ambientLight intensity={0.3} color="#ff0000" />
          <directionalLight position={[0, -100, -100]} intensity={4} color="#ff3300" /> {/* Glow de lava vindo de baixo */}
          <fog attach="fog" args={['#2a0000', 50, 400]} />
          {/* Brasas subindo */}
          <Sparkles count={3000} scale={[800, 300, 800]} position={[0, 0, -200]} size={10} speed={2} opacity={1} color="#ff6600" noise={2} />
        </>
      )}
    </>
  );
};

// ==========================================
// BACKGROUND PRINCIPAL
// ==========================================
const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ level }) => {
  let bgColor = '#87CEEB'; 
  if (level === 2) bgColor = '#ff7f50'; // Por do sol laranja/rosa
  if (level === 3) bgColor = '#050510'; // Espaço noturno azul escuro
  if (level === 4) bgColor = '#000000'; // Void escuro do casino
  if (level === 5) bgColor = '#1a0000'; // Vermelho escuro infernal

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, backgroundColor: bgColor }}>
      <Canvas camera={{ position: [0, 10, 50], fov: 60 }}>
        {level !== 5 && <fog attach="fog" args={[bgColor, 80, 500]} />}
        
        <DynamicCamera />
        <ThemedSky level={level} />
        <ThemedFloatingObjects level={level} />
        <ThemedFloor level={level} />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
