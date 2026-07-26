/* eslint-disable react/no-unknown-property */
'use client';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame, type ThreeElement, type ThreeEvent } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import {
    BallCollider,
    CuboidCollider,
    Physics,
    RigidBody,
    useRopeJoint,
    useSphericalJoint,
    type RapierRigidBody,
    type RigidBodyProps
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

const cardGLB = '/card.glb';
const lanyard = '/lanyard.jpg';

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
    interface ThreeElements {
        meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
        meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
    }
}

// 1x1 transparent pixel — lets useTexture be called unconditionally when a
// front/back image isn't supplied.
const BLANK_PIXEL =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// The card model's front face is UV-mapped to the LEFT half of the texture
// atlas and the back face to the RIGHT half (measured from card.glb). Each
// custom image is composited into its own half so the two faces render
// independently, aspect-preserving (no stretching).
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

interface LanyardProps {
    position?: [number, number, number];
    gravity?: [number, number, number];
    fov?: number;
    transparent?: boolean;
    frontImage?: string | null;
    backImage?: string | null;
    imageFit?: 'cover' | 'contain';
    lanyardImage?: string | null;
    lanyardWidth?: number;
    className?: string;
    cardX?: number;
    cardY?: number;
}

export default function Lanyard({
    position = [0, 0, 24],
    gravity = [0, -25, 0],
    fov = 20,
    transparent = true,
    frontImage = null,
    backImage = null,
    imageFit = 'cover',
    lanyardImage = null,
    lanyardWidth = 1,
    className,
    cardX = 3.2,
    cardY = 4.8
}: LanyardProps) {
    const [windowWidth, setWindowWidth] = useState<number>(() => typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [webglCrashed, setWebglCrashed] = useState(false);

    useEffect(() => {
        const handleResize = (): void => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isBelow991 = windowWidth < 991;
    const isSmallLaptop = windowWidth >= 991 && windowWidth < 1280;
    const isDesktop = windowWidth >= 1280;

    // Handle WebGL context loss — show a static fallback on mobile crash
    const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
        gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1);
        const canvas = gl.domElement;
        canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            setWebglCrashed(true);
        });
    }, [transparent]);

    // Static fallback when WebGL crashes on mobile
    if (webglCrashed) {
        return (
            <div className={className || "relative z-0 w-full h-full flex justify-center items-center"}>
                <div style={{
                    width: 220,
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                }}>
                    {frontImage && (
                        <img
                            src={frontImage}
                            alt="Card"
                            style={{ width: '100%', borderRadius: 10, objectFit: 'cover', aspectRatio: '3/4' }}
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={className || "relative z-0 w-full h-full flex justify-center items-center transform scale-100 origin-center touch-none select-none"}>
            <Canvas
                camera={{ position, fov }}
                dpr={[1, 2]}
                gl={{
                    alpha: transparent,
                    powerPreference: 'high-performance',
                    antialias: true,
                }}
                style={{ touchAction: 'none' }}
                onCreated={handleCreated}
            >
                <ambientLight intensity={Math.PI} />
                <Suspense fallback={null}>
                    <Physics gravity={gravity} timeStep={1 / 60}>
                        <Band
                            isBelow991={isBelow991}
                            isSmallLaptop={isSmallLaptop}
                            isDesktop={isDesktop}
                            frontImage={frontImage}
                            backImage={backImage}
                            imageFit={imageFit}
                            lanyardImage={lanyardImage}
                            lanyardWidth={lanyardWidth}
                            cardX={cardX}
                            cardY={cardY}
                        />
                    </Physics>
                </Suspense>
                <Environment blur={0.75}>
                    <Lightformer
                        intensity={2}
                        color="white"
                        position={[0, -1, 5]}
                        rotation={[0, 0, Math.PI / 3]}
                        scale={[100, 0.1, 1]}
                    />
                    <Lightformer
                        intensity={3}
                        color="white"
                        position={[-1, -1, 1]}
                        rotation={[0, 0, Math.PI / 3]}
                        scale={[100, 0.1, 1]}
                    />
                    <Lightformer
                        intensity={3}
                        color="white"
                        position={[1, 1, 1]}
                        rotation={[0, 0, Math.PI / 3]}
                        scale={[100, 0.1, 1]}
                    />
                    <Lightformer
                        intensity={10}
                        color="white"
                        position={[-10, 0, 14]}
                        rotation={[0, Math.PI / 2, Math.PI / 3]}
                        scale={[100, 10, 1]}
                    />
                </Environment>
            </Canvas>
        </div>
    );
}

interface BandProps {
    maxSpeed?: number;
    minSpeed?: number;
    isBelow991?: boolean;
    isSmallLaptop?: boolean;
    isDesktop?: boolean;
    frontImage?: string | null;
    backImage?: string | null;
    imageFit?: 'cover' | 'contain';
    lanyardImage?: string | null;
    lanyardWidth?: number;
    cardX?: number;
    cardY?: number;
}

type LanyardRigidBody = RapierRigidBody & {
    lerped?: THREE.Vector3;
};

function Band({
    maxSpeed = 50,
    minSpeed = 10,
    isBelow991 = false,
    isSmallLaptop = false,
    isDesktop = false,
    frontImage = null,
    backImage = null,
    imageFit = 'cover',
    lanyardImage = null,
    lanyardWidth = 1,
    cardX = 3.2,
    cardY = 4.8
}: BandProps) {
    const band = useRef<THREE.Mesh<InstanceType<typeof MeshLineGeometry>, InstanceType<typeof MeshLineMaterial>>>(null!);
    const fixed = useRef<RapierRigidBody>(null!);
    const j1 = useRef<LanyardRigidBody>(null!);
    const j2 = useRef<LanyardRigidBody>(null!);
    const j3 = useRef<RapierRigidBody>(null!);
    const card = useRef<RapierRigidBody>(null!);

    const vec = new THREE.Vector3();
    const ang = new THREE.Vector3();
    const rot = new THREE.Vector3();
    const dir = new THREE.Vector3();

    const segmentProps: RigidBodyProps = {
        type: 'dynamic',
        canSleep: false,
        colliders: false,
        angularDamping: 2,
        linearDamping: 2
    };

    const getLerped = (body: LanyardRigidBody): THREE.Vector3 => {
        if (!body.lerped) {
            body.lerped = new THREE.Vector3().copy(body.translation());
        }

        return body.lerped;
    };

    const { nodes, materials } = useGLTF(cardGLB) as any;
    const texture = useTexture(lanyardImage || lanyard);
    // useTexture must be called unconditionally; use a blank pixel when an image
    // isn't supplied for a given face, then skip compositing it below.
    const frontTex = useTexture(frontImage || BLANK_PIXEL);
    const backTex = useTexture(backImage || BLANK_PIXEL);

    // Composite the front/back images into the card's texture atlas (front = left
    // half, back = right half). Each image is drawn aspect-preserving (no stretch).
    const cardMap = useMemo(() => {
        const baseMap = materials.base.map as THREE.Texture;
        if (!frontImage && !backImage) return baseMap;

        const baseImg = baseMap.image as any;
        const W = baseImg.width;
        const H = baseImg.height;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) return baseMap;
        // Keep the original baked atlas for the card edges and any untouched face.
        ctx.drawImage(baseImg, 0, 0, W, H);

        const drawFitted = (img: any, rect: typeof FRONT_UV_RECT) => {
            const rx = rect.x * W;
            const ry = rect.y * H;
            const rw = rect.w * W;
            const rh = rect.h * H;
            const pick = imageFit === 'contain' ? Math.min : Math.max;
            const scale = pick(rw / img.width, rh / img.height);
            const dw = img.width * scale;
            const dh = img.height * scale;
            const dx = rx + (rw - dw) / 2;
            const dy = ry + (rh - dh) / 2;
            ctx.save();
            ctx.beginPath();
            ctx.rect(rx, ry, rw, rh);
            ctx.clip();
            ctx.drawImage(img, dx, dy, dw, dh);
            ctx.restore();
        };

        if (frontImage && frontTex.image) drawFitted(frontTex.image, FRONT_UV_RECT);
        if (backImage && backTex.image) drawFitted(backTex.image, BACK_UV_RECT);

        const composite = new THREE.CanvasTexture(canvas);
        composite.colorSpace = THREE.SRGBColorSpace;
        composite.flipY = baseMap.flipY;
        composite.anisotropy = 16;
        composite.needsUpdate = true;
        return composite;
    }, [frontImage, backImage, imageFit, frontTex, backTex, materials.base.map]);
    const [curve] = useState(
        () =>
            new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
    );
    const [dragged, drag] = useState<false | THREE.Vector3>(false);
    const [hovered, hover] = useState(false);

    // Track whether the pointer has moved recently — this lets us distinguish
    // a genuine user hover from the card swinging into the pointer ray via physics.
    const pointerMovedRef = useRef(false);
    const pointerMoveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const onMove = () => {
            pointerMovedRef.current = true;
            if (pointerMoveTimerRef.current) clearTimeout(pointerMoveTimerRef.current);
            // Reset the flag after a short idle window — if the pointer hasn't moved
            // for 150ms, the next onPointerOver is likely physics-driven.
            pointerMoveTimerRef.current = setTimeout(() => {
                pointerMovedRef.current = false;
            }, 150);
        };
        window.addEventListener('pointermove', onMove);
        return () => {
            window.removeEventListener('pointermove', onMove);
            if (pointerMoveTimerRef.current) clearTimeout(pointerMoveTimerRef.current);
        };
    }, []);

    let xPos = 0;
    let cardScale = 2.25;
    let colliderArgs: [number, number, number] = [0.8, 1.125, 0.01];

    if (isBelow991) {
        xPos = 0;
        cardScale = 3.3;
        colliderArgs = [1.18, 1.65, 0.01];
    } else if (isSmallLaptop) {
        xPos = cardX * 0.55;
        cardScale = 2.45;
        colliderArgs = [0.88, 1.22, 0.01];
    } else {
        xPos = cardX;
        cardScale = 3.3;
        colliderArgs = [1.18, 1.65, 0.01];
    }

    const scaleFactor = cardScale / 2.25;
    const jointAnchorY = 1.45 * scaleFactor;
    const groupOffsetY = -1.2 * scaleFactor;

    useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
    useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
    useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
    useSphericalJoint(j3, card, [
        [0, 0, 0],
        [0, jointAnchorY, 0]
    ]);

    useEffect(() => {
        if (hovered) {
            document.body.style.cursor = dragged ? 'grabbing' : 'grab';
            return () => {
                document.body.style.cursor = 'auto';
            };
        }
    }, [hovered, dragged]);

    // Safety net: if the pointer is released anywhere (even outside the canvas),
    // always clear the drag state so it never gets stuck.
    useEffect(() => {
        const onPointerUp = () => {
            if (dragged) {
                drag(false);
                card.current?.wakeUp();
            }
        };
        window.addEventListener('pointerup', onPointerUp);
        return () => window.removeEventListener('pointerup', onPointerUp);
    }, [dragged]);

    useFrame((state, delta) => {
        if (dragged && typeof dragged !== 'boolean') {
            vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
            dir.copy(vec).sub(state.camera.position).normalize();
            vec.add(dir.multiplyScalar(state.camera.position.length()));
            [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
            card.current?.setNextKinematicTranslation({
                x: vec.x - dragged.x,
                y: vec.y - dragged.y,
                z: vec.z - dragged.z
            });
        }
        if (fixed.current) {
            [j1, j2].forEach(ref => {
                const lerped = getLerped(ref.current);
                const clampedDistance = Math.max(0.1, Math.min(1, lerped.distanceTo(ref.current.translation())));
                lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
            });
            curve.points[0].copy(j3.current.translation());
            curve.points[1].copy(getLerped(j2.current));
            curve.points[2].copy(getLerped(j1.current));
            curve.points[3].copy(fixed.current.translation());
            band.current.geometry.setPoints(curve.getPoints(32));
            ang.copy(card.current.angvel());
            rot.copy(card.current.rotation());
            card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
        }
    });

    curve.curveType = 'chordal';
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    return (
        <>
            <group position={[xPos, cardY, 0]}>
                <RigidBody ref={fixed} {...segmentProps} type="fixed" />
                <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type="dynamic">
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type="dynamic">
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type="dynamic">
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody
                    position={[2, 0, 0]}
                    ref={card}
                    {...segmentProps}
                    type={dragged ? 'kinematicPosition' : 'dynamic'}
                >
                    <CuboidCollider args={colliderArgs} />
                    <group
                        scale={cardScale}
                        position={[0, groupOffsetY, -0.05]}
                        onPointerOver={() => {
                            // Only show the grab cursor when the user actually moved
                            // the pointer over the card — ignore physics-driven hits.
                            if (pointerMovedRef.current || dragged) hover(true);
                        }}
                        onPointerOut={() => hover(false)}
                        onPointerUp={(e: ThreeEvent<PointerEvent>) => {
                            try {
                                (e.nativeEvent.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
                            } catch {}
                            drag(false);
                            card.current?.wakeUp();
                        }}
                        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
                            try {
                                (e.nativeEvent.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
                            } catch {}
                            drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
                        }}
                        onPointerCancel={() => {
                            drag(false);
                            card.current?.wakeUp();
                        }}
                    >
                        <mesh geometry={nodes.card.geometry}>
                            <meshPhysicalMaterial
                                map={cardMap}
                                map-anisotropy={16}
                                clearcoat={1}
                                clearcoatRoughness={0.15}
                                roughness={0.9}
                                metalness={0.8}
                            />
                        </mesh>
                        <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
                        <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
                    </group>
                </RigidBody>
            </group>
            <mesh ref={band}>
                <meshLineGeometry />
                {/* @ts-ignore */}
                <meshLineMaterial
                    color="white"
                    depthTest={false}
                    resolution={[1000, 1000]}
                    useMap={1}
                    map={texture}
                    repeat={[-4, 1]}
                    lineWidth={lanyardWidth}
                />
            </mesh>
        </>
    );
}
