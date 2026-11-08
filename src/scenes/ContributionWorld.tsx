import { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { Day } from "../github/types";
const dummy = new THREE.Object3D();
const colors = ["#303d35", "#6d8848", "#a2b75c", "#d2d88b", "#e1bb70"];
export function ContributionWorld({
  days,
  replay,
  paused,
  onSelect,
}: {
  days: Day[];
  replay: number;
  paused: boolean;
  onSelect: (d: Day) => void;
}) {
  const bodies = useRef<THREE.InstancedMesh>(null!),
    studs = useRef<THREE.InstancedMesh>(null!);
  const age = useRef(0);
  const bricks = useMemo(
    () =>
      days.flatMap((d, index) => {
        const offset = new Date(days[0].date + "T12:00:00Z").getUTCDay();
        const x = (Math.floor((index + offset) / 7) - 26) * 0.64,
          z = (((index + offset) % 7) - 3) * 0.68;
        const levels = d.contributionCount
          ? Math.min(14, 1 + Math.ceil(Math.sqrt(d.contributionCount) * 1.15))
          : 1;
        return Array.from({ length: levels }, (_, level) => ({
          x,
          z,
          y: level * 0.29 + 0.17,
          color:
            colors[
              d.contributionCount === 0
                ? 0
                : Math.min(4, Math.ceil(d.contributionCount / 20))
            ],
          day: d,
          index,
        }));
      }),
    [days],
  );
  useLayoutEffect(() => {
    age.current = 0;
    bricks.forEach((b, i) => {
      bodies.current.setColorAt(i, new THREE.Color(b.color));
      studs.current.setColorAt(i * 2, new THREE.Color(b.color));
      studs.current.setColorAt(i * 2 + 1, new THREE.Color(b.color));
    });
    bodies.current.instanceColor!.needsUpdate = true;
    studs.current.instanceColor!.needsUpdate = true;
  }, [bricks, replay]);
  useFrame((_, delta) => {
    if (age.current > 2.3) return;
    age.current += delta;
    const time = paused ? 100 : age.current;
    for (let i = 0; i < bricks.length; i++) {
      const b = bricks[i],
        p = THREE.MathUtils.smoothstep(time - b.index * 0.002, 0, 1.3);
      const y = b.y * p;
      dummy.position.set(b.x, y, b.z);
      dummy.scale.set(0.58, 0.25 * Math.max(0.01, p), 0.6);
      dummy.updateMatrix();
      bodies.current.setMatrixAt(i, dummy.matrix);
      for (let s = 0; s < 2; s++) {
        dummy.position.set(b.x + (s - 0.5) * 0.28, y + 0.15 * p, b.z);
        dummy.scale.set(1, Math.max(0.01, p), 1);
        dummy.updateMatrix();
        studs.current.setMatrixAt(i * 2 + s, dummy.matrix);
      }
    }
    bodies.current.instanceMatrix.needsUpdate = true;
    studs.current.instanceMatrix.needsUpdate = true;
  });
  const select = (e: ThreeEvent<PointerEvent> | ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined) onSelect(bricks[e.instanceId].day);
  };
  return (
    <group>
      <mesh position={[0, -0.17, 0]} receiveShadow>
        <boxGeometry args={[35.2, 0.3, 6.1]} />
        <meshStandardMaterial
          color="#202d26"
          roughness={0.65}
          metalness={0.25}
        />
      </mesh>
      <instancedMesh
        ref={bodies}
        args={[undefined, undefined, bricks.length]}
        castShadow
        receiveShadow
        onPointerMove={select}
        onClick={select}
      >
        <boxGeometry />
        <meshStandardMaterial roughness={0.38} metalness={0.12} />
      </instancedMesh>
      <instancedMesh
        ref={studs}
        args={[undefined, undefined, bricks.length * 2]}
        castShadow
      >
        <cylinderGeometry args={[0.09, 0.09, 0.07, 10]} />
        <meshStandardMaterial roughness={0.38} metalness={0.12} />
      </instancedMesh>
      {days
        .filter((d, i) => i === 0 || d.date.endsWith("-01"))
        .map((d) => {
          const i = days.indexOf(d),
            offset = new Date(days[0].date + "T12:00:00Z").getUTCDay();
          return (
            <Text
              font={`${import.meta.env.BASE_URL}fonts/dm-sans.ttf`}
              key={d.date}
              position={[(Math.floor((i + offset) / 7) - 26) * 0.64, 0.01, 3.7]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.23}
              color="#899b89"
            >
              {new Date(d.date + "T12:00:00Z")
                .toLocaleDateString("en", { month: "short", timeZone: "UTC" })
                .toUpperCase()}
            </Text>
          );
        })}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.34, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#111b15" roughness={1} />
      </mesh>
    </group>
  );
}
