import { useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function Earth() {
  const earthRef = useRef<THREE.Group>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const targetRotation = useRef(0);

  // Load high-res textures for photorealism
  const [colorMap, bumpMap, specularMap, cloudsMap] = useTexture([
    "/textures/earth-night.jpg",
    "/textures/earth-topology.png",
    "/textures/earth-water.png",
    "/textures/earth-clouds.png"
  ]);

  useEffect(() => {
    const handleScroll = () => {
      // Determine how far down the page we've scrolled
      const scrollY = window.scrollY;
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const scrollProgress = scrollY / maxScroll;
      
      // Rotate the earth fully based on scroll percentage
      targetRotation.current = scrollProgress * Math.PI * 2;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((_, delta) => {
    if (earthRef.current) {
      // Smoothly interpolate current rotation to target rotation on scroll
      earthRef.current.rotation.y += (targetRotation.current - earthRef.current.rotation.y) * 5 * delta;
      
      // Slow continuous auto-rotation if the user isn't scrolling
      earthRef.current.rotation.y += delta * 0.05;
      targetRotation.current += delta * 0.05;
    }
    if (cloudsRef.current) {
      // Clouds rotate slightly faster/independently for realism
      cloudsRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <group ref={earthRef} position={[0, -2.5, 0]}>
      {/* Base Earth Sphere with Photorealistic Materials */}
      <mesh rotation={[0, -Math.PI / 2, 0]}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial 
          map={colorMap}
          emissiveMap={colorMap}
          emissive={new THREE.Color(0xffffff)}
          emissiveIntensity={1.5}
          bumpMap={bumpMap}
          bumpScale={0.02}
          metalnessMap={specularMap}
          metalness={0.6}
          roughness={0.7}
        />
      </mesh>

      {/* Cloud Layer */}
      <mesh ref={cloudsRef} rotation={[0, -Math.PI / 2, 0]}>
        <sphereGeometry args={[3.03, 64, 64]} />
        <meshStandardMaterial 
          map={cloudsMap}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Deep Blue Atmosphere Glow */}
      <mesh>
        <sphereGeometry args={[3.12, 64, 64]} />
        <meshBasicMaterial 
          color="#1e40af" 
          transparent 
          opacity={0.3} 
          blending={THREE.AdditiveBlending} 
          side={THREE.BackSide}
        />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[3.15, 64, 64]} />
        <meshBasicMaterial 
          color="#3b82f6" 
          transparent 
          opacity={0.15} 
          blending={THREE.AdditiveBlending} 
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

export default function EarthScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      {/* Deep space background color */}
      <color attach="background" args={["#010308"]} />

      <ambientLight intensity={0.15} />
      {/* Sun-like directional light to catch the bump map mountains and water specular */}
      <directionalLight position={[10, 5, 2]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-10, -5, -2]} intensity={0.5} color="#3b82f6" />
      
      {/* Starfield background */}
      <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={0.5} />
      
      <Suspense fallback={null}>
        <Earth />
      </Suspense>

      {/* Post-processing Bloom for vibrant glowing city lights */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.15} 
          mipmapBlur 
          intensity={1.0} 
        />
      </EffectComposer>
    </Canvas>
  );
}
