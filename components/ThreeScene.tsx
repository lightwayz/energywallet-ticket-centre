"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef, useState } from "react";

function GlowBall({ position = [0, 0, 0], color = "#ff9944" }) {
    const mesh = useRef<any>(null);
    useFrame((state) => {
        if (!mesh.current) return;
        mesh.current.rotation.y += 0.004;
        mesh.current.position.y =
            position[1] + Math.sin(state.clock.getElapsedTime()) * 0.15;
    });
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.4}>
            <mesh ref={mesh} position={position as any}>
                <icosahedronGeometry args={[0.8, 1]} />
                <meshStandardMaterial
                    emissive={color}
                    emissiveIntensity={1.2}
                    color="#111111"
                    roughness={0.4}
                    metalness={0.3}
                />
            </mesh>
        </Float>
    );
}

function Lights() {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[2, 2, 2]} intensity={1.3} />
            <pointLight position={[-2, -1, -3]} intensity={0.8} color="#66ccff" />
        </>
    );
}

export default function ThreeScene() {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="relative h-[360px] w-full overflow-hidden rounded-3xl transition-transform duration-700 ease-out"
            style={{
                transform: hovered ? "scale(1.05)" : "scale(1)",
                boxShadow: hovered
                    ? "0 0 40px rgba(255,153,68,0.3)"
                    : "0 0 20px rgba(0,0,0,0.3)",
            }}
        >
            {/* aurora gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(255,153,68,0.15),transparent),radial-gradient(50%_50%_at_70%_30%,rgba(102,204,255,0.12),transparent)]" />

            <Canvas
                camera={{ position: [0, 0, hovered ? 3.3 : 4], fov: 55 }}
                dpr={[1, 1.8]}
                className="transition-transform duration-700 ease-out"
            >
                <Lights />
                <GlowBall position={[-1.1, 0.1, 0]} color="#ff9944" />
                <GlowBall position={[1.2, -0.2, 0]} color="#66ccff" />
                <GlowBall position={[0, 0.8, -0.6]} color="#ffaa88" />
            </Canvas>
        </div>
    );
}
