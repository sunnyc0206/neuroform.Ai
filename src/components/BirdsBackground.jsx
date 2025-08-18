import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

const BirdsBackground = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Particle system for birds
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Random positions
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
      
      // Random velocities
      velocities[i3] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
      
      // Theme-based colors
      const color = new THREE.Color(
        theme === 'dark' ? '#818cf8' : '#6366f1'
      );
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create bird-like shapes using sprites
    const loader = new THREE.TextureLoader();
    const birdTexture = createBirdTexture();
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      map: birdTexture,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: theme === 'dark' ? 0.8 : 0.6
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse interaction
    const mouse = new THREE.Vector2();
    const handleMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const clock = new THREE.Clock();
    let animationId;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const time = clock.getElapsedTime();
      const positions = geometry.attributes.position.array;
      
      // Update particle positions
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Flocking behavior simulation
        positions[i3] += velocities[i3] + Math.sin(time + i) * 0.001;
        positions[i3 + 1] += velocities[i3 + 1] + Math.cos(time + i) * 0.001;
        positions[i3 + 2] += velocities[i3 + 2] + Math.sin(time * 0.5 + i) * 0.001;
        
        // Mouse influence
        positions[i3] += mouse.x * 0.001;
        positions[i3 + 1] += mouse.y * 0.001;
        
        // Boundary wrapping
        if (positions[i3] > 5) positions[i3] = -5;
        if (positions[i3] < -5) positions[i3] = 5;
        if (positions[i3 + 1] > 5) positions[i3 + 1] = -5;
        if (positions[i3 + 1] < -5) positions[i3 + 1] = 5;
        if (positions[i3 + 2] > 5) positions[i3 + 2] = -5;
        if (positions[i3 + 2] < -5) positions[i3 + 2] = 5;
      }
      
      geometry.attributes.position.needsUpdate = true;
      
      // Rotate the entire particle system slowly
      particles.rotation.y += 0.0005;
      particles.rotation.x = Math.sin(time * 0.2) * 0.1;
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Store scene reference for theme updates
    sceneRef.current = { particles, material, geometry, colors };

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []); // Run once on mount

  // Update colors when theme changes
  useEffect(() => {
    if (sceneRef.current) {
      const { geometry, material, colors } = sceneRef.current;
      
      // Update particle colors
      for (let i = 0; i < colors.length; i += 3) {
        const color = new THREE.Color(
          theme === 'dark' ? '#818cf8' : '#6366f1'
        );
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }
      
      geometry.attributes.color.needsUpdate = true;
      material.opacity = theme === 'dark' ? 0.8 : 0.6;
      material.needsUpdate = true;
    }
  }, [theme]);

  return (
    <div 
      ref={mountRef}
      className="birds-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: theme === 'dark'
          ? 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 100%)'
          : 'radial-gradient(ellipse at center, #ffffff 0%, #f8fafc 100%)',
        pointerEvents: 'none'
      }}
    />
  );
};

// Create a simple bird-like texture
function createBirdTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Draw a simple bird shape
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(16, 8);
  ctx.lineTo(8, 16);
  ctx.lineTo(16, 14);
  ctx.lineTo(24, 16);
  ctx.closePath();
  ctx.fill();
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  return texture;
}

export default BirdsBackground; 