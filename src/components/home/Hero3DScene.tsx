'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function Hero3DScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Soft Studio Lighting for Clay look
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x3d6b5c, 0.6); // Pine tint
    dirLight2.position.set(-5, -5, 2);
    scene.add(dirLight2);

    // Clay Materials (warm matte roughness)
    const clayMatPine = new THREE.MeshStandardMaterial({
      color: 0x3d6b5c, // Pine green
      roughness: 0.35,
      metalness: 0.05,
    });

    const clayMatAmber = new THREE.MeshStandardMaterial({
      color: 0xd9822b, // Amber
      roughness: 0.35,
      metalness: 0.05,
    });

    const clayMatBlue = new THREE.MeshStandardMaterial({
      color: 0x3a6ea5, // Dusty blue
      roughness: 0.35,
      metalness: 0.05,
    });

    const clayMatPlum = new THREE.MeshStandardMaterial({
      color: 0x7a5c99, // Muted plum
      roughness: 0.35,
      metalness: 0.05,
    });

    const clayMatBase = new THREE.MeshStandardMaterial({
      color: 0xf5f2ec, // Clay surface
      roughness: 0.4,
      metalness: 0.02,
    });

    // Meshes: rounded geometric forms (like smooth tactile clay blocks)
    // 1. Central rounded cube (toolbox block)
    const boxGeo = new THREE.BoxGeometry(2.0, 2.0, 2.0);
    const mainBox = new THREE.Mesh(boxGeo, clayMatPine);
    mainBox.position.set(0, 0, 0);
    scene.add(mainBox);

    // 2. Torus (smooth ring)
    const torusGeo = new THREE.TorusGeometry(1.4, 0.4, 32, 64);
    const torus = new THREE.Mesh(torusGeo, clayMatAmber);
    torus.position.set(2.4, 1.2, -1);
    scene.add(torus);

    // 3. Smooth sphere
    const sphereGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const sphere = new THREE.Mesh(sphereGeo, clayMatBlue);
    sphere.position.set(-2.2, -1.2, 0.5);
    scene.add(sphere);

    // 4. Cylinder badge
    const cylGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.4, 32);
    const cyl = new THREE.Mesh(cylGeo, clayMatPlum);
    cyl.position.set(-2.0, 1.5, -0.5);
    scene.add(cyl);

    // 5. Small accent sphere
    const smallSphereGeo = new THREE.SphereGeometry(0.4, 24, 24);
    const smallSphere = new THREE.Mesh(smallSphereGeo, clayMatBase);
    smallSphere.position.set(1.8, -1.6, 1.2);
    scene.add(smallSphere);

    // Mouse parallax tracking
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width - 0.5;
      const y = (e.clientY - rect.top) / height - 0.5;
      targetX = x * 1.5;
      targetY = y * 1.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Gentle floating and self-rotation
      mainBox.rotation.x = elapsed * 0.35 + targetY;
      mainBox.rotation.y = elapsed * 0.45 + targetX;
      mainBox.position.y = Math.sin(elapsed * 1.2) * 0.15;

      torus.rotation.x = elapsed * 0.5;
      torus.rotation.y = elapsed * 0.25;
      torus.position.y = 1.2 + Math.cos(elapsed * 1.5) * 0.2;

      sphere.position.y = -1.2 + Math.sin(elapsed * 1.4) * 0.18;
      sphere.position.x = -2.2 + Math.cos(elapsed * 1.1) * 0.1;

      cyl.rotation.z = elapsed * 0.4;
      cyl.rotation.x = elapsed * 0.2;
      cyl.position.y = 1.5 + Math.sin(elapsed * 1.6) * 0.15;

      smallSphere.position.y = -1.6 + Math.cos(elapsed * 2.0) * 0.2;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[320px] sm:min-h-[420px] flex items-center justify-center relative cursor-grab active:cursor-grabbing"
      aria-hidden="true"
    />
  );
}
