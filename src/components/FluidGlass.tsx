import { useRef, useState, useEffect, memo, Suspense } from "react";
import * as THREE from "three";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { useFBO, useGLTF, MeshTransmissionMaterial } from "@react-three/drei";
import { easing } from "maath";

export default function FluidGlass() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 20], fov: 15 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <GlassLens />
        </Suspense>
      </Canvas>
    </div>
  );
}

const GlassLens = memo(function GlassLens() {
  const ref = useRef<THREE.Mesh>(null!);
  const { nodes } = useGLTF("/assets/3d/lens.glb") as any;
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState(() => new THREE.Scene());
  const geoWidthRef = useRef(1);
  const mouseNDC = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const geo = nodes?.Cylinder?.geometry;
    if (geo) {
      geo.computeBoundingBox();
      geoWidthRef.current = geo.boundingBox.max.x - geo.boundingBox.min.x || 1;
    }
  }, [nodes]);

  // Track mouse globally since canvas has pointer-events: none
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseNDC.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const { gl, viewport, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    // Smooth follow mouse
    const destX = (mouseNDC.current.x * v.width) / 2;
    const destY = (mouseNDC.current.y * v.height) / 2;
    easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

    // Auto-scale to fit viewport
    const maxWorld = v.width * 0.9;
    const desired = maxWorld / geoWidthRef.current;
    ref.current.scale.setScalar(Math.min(0.15, desired));

    // Render scene to FBO for refraction
    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    gl.setClearColor(0x000000, 0);
  });

  return (
    <>
      {createPortal(<GlassBackground />, scene)}
      {/* Fullscreen FBO texture plane */}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent />
      </mesh>
      {/* Glass lens mesh */}
      <mesh
        ref={ref}
        scale={0.15}
        rotation-x={Math.PI / 2}
        geometry={nodes?.Cylinder?.geometry}
      >
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={1.15}
          thickness={5}
          anisotropy={0.01}
          chromaticAberration={0.1}
          transmission={1}
          roughness={0}
          toneMapped={false}
        />
      </mesh>
    </>
  );
});

/** Subtle dark background inside the FBO for the glass to refract */
function GlassBackground() {
  return (
    <group>
      <mesh scale={[200, 200, 1]} position={[0, 0, -10]}>
        <planeGeometry />
        <meshBasicMaterial color="#0a0a0f" />
      </mesh>
      {/* Subtle purple glow in center */}
      <mesh scale={[30, 30, 1]} position={[0, 0, -9]}>
        <planeGeometry />
        <meshBasicMaterial color="#2d1b69" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}
