---
name: advanced-3d-gamedev
description: >-
  Use this skill when developing or improving 3D backgrounds, rendering, and game loop logic using React Three Fiber or Phaser. It provides strict rules for performance and aesthetic quality.
---

# Advanced 3D & Game Dev Skill

This skill configures the agent to act as an expert Technical Artist and Game Developer.

## Core Directives

1. **Prioritize Performance (60fps Target):**
   - When using `@react-three/fiber`, always try to minimize draw calls. Use `InstancedMesh` if rendering many identical objects (like rings or trees).
   - Avoid instantiating new `THREE.Vector3` or `THREE.Color` inside `useFrame`. Reuse variables or use `useMemo`.

2. **Aesthetics and Immersion:**
   - Never settle for flat colors. Always use post-processing (bloom, depth of field) or emissive materials to give a "neon" or "dreamy" look.
   - For skies, use `@react-three/drei`'s `<Sky>` or `<Environment>` to create realistic or highly stylized lighting.

3. **Hybrid Architecture (React + Phaser):**
   - Never put React UI elements inside the Phaser canvas directly unless using Phaser DOM elements. Keep React UI on a `z-index` layer above Phaser.
   - Use custom events (`window.dispatchEvent(new CustomEvent(...))`) to communicate seamlessly between Phaser (Game Logic) and React (UI/3D Background).

## Suggested Workflow
- When asked to create a new visual effect, first plan the shader or material needed.
- Write the logic, verify performance, and test resizing.
