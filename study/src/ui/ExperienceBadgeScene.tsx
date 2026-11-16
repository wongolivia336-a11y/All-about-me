import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export interface BadgeItem {
  title: string;
  role: string;
  accent: string;
  placeholder?: boolean;
  illustration?: string;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}

function makeBadgeTexture(item: BadgeItem, index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 840;
  const ctx = canvas.getContext("2d")!;
  const inset = 12;
  const x = inset;
  const y = inset;
  const w = canvas.width - inset * 2;
  const h = canvas.height - inset * 2;

  ctx.fillStyle = "#f7f5ef";
  roundedRect(ctx, x, y, w, h, 36);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 36);
  ctx.clip();

  ctx.fillStyle = item.accent;
  ctx.globalAlpha = 0.18;
  ctx.fillRect(x, y, w, 18);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#27363a";
  ctx.font = "600 25px ui-monospace, SFMono-Regular, Consolas, monospace";
  ctx.fillText("FOUR HEARTS", 48, 66);
  ctx.textAlign = "right";
  ctx.fillStyle = item.accent;
  ctx.fillText(String(index + 1).padStart(2, "0"), canvas.width - 48, 66);
  ctx.textAlign = "left";

  ctx.strokeStyle = "rgba(39,54,58,.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, 92);
  ctx.lineTo(canvas.width - 48, 92);
  ctx.stroke();

  ctx.fillStyle = item.accent;
  ctx.globalAlpha = 0.16;
  ctx.beginPath();
  ctx.arc(canvas.width - 130, 238, 92, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#253438";
  ctx.font = item.title.length > 13 ? "600 46px Georgia, serif" : "600 58px Georgia, serif";
  const words = item.title.split(" ");
  if (words.length > 1 && item.title.length > 15) {
    ctx.fillText(words.slice(0, Math.ceil(words.length / 2)).join(" "), 48, 242);
    ctx.fillText(words.slice(Math.ceil(words.length / 2)).join(" "), 48, 301);
  } else {
    ctx.fillText(item.title, 48, 270);
  }

  ctx.fillStyle = "#63706e";
  ctx.font = "500 25px ui-monospace, SFMono-Regular, Consolas, monospace";
  ctx.fillText(item.placeholder ? "A NEW CHAPTER" : "DESIGN PRACTICE", 50, 365);
  ctx.fillStyle = "#313e40";
  ctx.font = "400 32px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  const roleWords = item.role.split(" ");
  let line = "";
  let lineY = 430;
  for (const word of roleWords) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > 520 && line) {
      ctx.fillText(line, 50, lineY);
      line = word;
      lineY += 45;
    } else line = next;
  }
  if (line) ctx.fillText(line, 50, lineY);

  ctx.strokeStyle = item.accent;
  ctx.globalAlpha = 0.72;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(50, 635);
  ctx.lineTo(166, 635);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#73807c";
  ctx.font = "500 20px ui-monospace, SFMono-Regular, Consolas, monospace";
  ctx.fillText("OLIVIA WONG  ·  EXPERIENCE", 50, 684);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  if (item.illustration) {
    const illustration = new Image();
    illustration.onload = () => {
      ctx.save();
      ctx.globalAlpha = 0.96;
      ctx.drawImage(illustration, 402, 118, 190, 238);
      ctx.restore();
      texture.needsUpdate = true;
    };
    illustration.src = item.illustration;
  }
  return texture;
}

function SwingingBadge({
  item,
  index,
  selected,
  reducedMotion,
  onSelect,
}: {
  item: BadgeItem;
  index: number;
  selected: boolean;
  reducedMotion: boolean;
  onSelect: () => void;
}) {
  const pivot = useRef<THREE.Group>(null);
  const angle = useRef(0);
  const velocity = useRef(0);
  const [hovered, setHovered] = useState(false);
  const invalidate = useThree((state) => state.invalidate);
  const texture = useMemo(() => makeBadgeTexture(item, index), [index, item]);
  const strapGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.27, 0.04, 0.08),
      new THREE.Vector3(-0.29, -0.24, 0.08),
      new THREE.Vector3(0, -0.43, 0.08),
      new THREE.Vector3(0.29, -0.24, 0.08),
      new THREE.Vector3(0.27, 0.04, 0.08),
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.047, 8, false);
  }, []);

  useEffect(() => () => {
    texture.dispose();
    strapGeometry.dispose();
  }, [strapGeometry, texture]);

  useFrame((_, delta) => {
    if (!pivot.current) return;
    if (reducedMotion) {
      pivot.current.rotation.z = 0;
      return;
    }
    const target = hovered ? (index % 2 === 0 ? -0.12 : 0.12) : selected ? 0.035 : 0;
    const dt = Math.min(delta, 0.04);
    velocity.current += (target - angle.current) * dt * 14;
    velocity.current *= Math.exp(-dt * (hovered ? 3.7 : 4.8));
    angle.current += velocity.current * dt;
    pivot.current.rotation.z = angle.current;
    if (Math.abs(target - angle.current) > 0.001 || Math.abs(velocity.current) > 0.001) invalidate();
  });

  return (
    <group ref={pivot} position={[0, 1.48, 0]}>
      <mesh geometry={strapGeometry}>
        <meshStandardMaterial color={item.accent} roughness={0.72} />
      </mesh>
      <RoundedBox args={[0.5, 0.11, 0.11]} radius={0.035} smoothness={4} position={[0, -0.48, 0.1]} castShadow>
        <meshStandardMaterial color="#c5a66d" metalness={0.7} roughness={0.28} />
      </RoundedBox>
      <group position={[0, -1.72, 0]}>
        <RoundedBox
          args={[2.18, 2.9, 0.11]}
          radius={0.09}
          smoothness={6}
          castShadow
          receiveShadow
          onPointerOver={(event) => { event.stopPropagation(); setHovered(true); invalidate(); }}
          onPointerOut={(event) => { event.stopPropagation(); setHovered(false); invalidate(); }}
          onPointerDown={(event) => {
            event.stopPropagation();
            velocity.current += index % 2 === 0 ? -0.72 : 0.72;
            invalidate();
          }}
          onClick={(event) => { event.stopPropagation(); onSelect(); invalidate(); }}
        >
          <meshStandardMaterial color="#f7f5ef" roughness={0.58} metalness={0.02} />
        </RoundedBox>
        <mesh position={[0, 0, 0.061]}>
          <planeGeometry args={[2.04, 2.76]} />
          <meshBasicMaterial map={texture} transparent toneMapped={false} />
        </mesh>
        {selected && (
          <mesh position={[0, 0, 0.066]}>
            <planeGeometry args={[2.2, 2.92]} />
            <meshBasicMaterial color="#f6e7db" transparent opacity={0.075} depthWrite={false} />
          </mesh>
        )}
      </group>
    </group>
  );
}

function BadgeLineup({ items, selectedIndex, onSelect, reducedMotion }: {
  items: BadgeItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  reducedMotion: boolean;
}) {
  const viewportWidth = useThree((state) => state.viewport.width);
  const cardWidth = Math.min(2.18, viewportWidth * 0.265);
  const spacing = Math.max(cardWidth + 0.36, viewportWidth * 0.305);
  return (
    <>
      <ambientLight intensity={1.05} />
      <directionalLight position={[-3, 5, 5]} intensity={2.1} castShadow shadow-mapSize={[512, 512]} />
      <directionalLight position={[4, 2, -2]} intensity={0.65} color="#ffe7d4" />
      {items.map((item, index) => (
        <group key={`${item.title}-${index}`} position={[(index - 1) * spacing, 0, 0]} scale={cardWidth / 2.18}>
          <SwingingBadge
            item={item}
            index={index}
            selected={selectedIndex === index}
            reducedMotion={reducedMotion}
            onSelect={() => onSelect(index)}
          />
        </group>
      ))}
    </>
  );
}

export function ExperienceBadgeScene({ items, selectedIndex, onSelect, reducedMotion }: {
  items: BadgeItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  reducedMotion: boolean;
}) {
  return (
    <Canvas
      className="quick-read-page__badge-canvas"
      frameloop="demand"
      orthographic
      camera={{ position: [0, 0, 10], zoom: 86, near: 0.1, far: 40 }}
      dpr={[1, 1.2]}
      shadows
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      aria-label="Three swinging internship badges"
      fallback={<div className="quick-read-page__badge-fallback" aria-hidden="true">Choose a badge from the archive below</div>}
    >
      <BadgeLineup items={items} selectedIndex={selectedIndex} onSelect={onSelect} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
