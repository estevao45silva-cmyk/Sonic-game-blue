---
name: threejs-3d-models
description: Guidelines for loading, optimizing, and animating 3D models using React Three Fiber.
---

# Three.js & React Three Fiber (R3F) Guide

## 1. Model Loading
- **Always use `useGLTF` or `useFBX` hooks** from `@react-three/drei`.
- Preload models at the end of the file to prevent loading stutters during gameplay:
  ```typescript
  useGLTF.preload('/models/sonic.glb');
  ```
- Wrap your 3D components in `<Suspense fallback={<Loader />}>` so the game doesn't crash while models are downloading.

## 2. Optimization
- Avoid casting/receiving shadows on every single mesh. Only enable `castShadow` and `receiveShadow` on main characters and ground.
- Do not instantiate new objects (e.g., `new THREE.Vector3()`) inside `useFrame`. This creates garbage collection pauses. Instead, reuse a global instance or declare it outside the loop.

## 3. Animations
- Use `useAnimations` from `@react-three/drei` to easily extract and play animations from the `.glb` file.
  ```typescript
  const { actions } = useAnimations(animations, group);
  useEffect(() => {
    actions['Run']?.play();
  }, [actions]);
  ```
