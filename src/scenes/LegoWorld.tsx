import { RigidBody, Physics, CuboidCollider } from "@react-three/rapier";
import { Brick } from "../components/Brick";
export function LegoWorld({
  count,
  paused,
}: {
  count: number;
  paused: boolean;
}) {
  return (
    <Physics paused={paused} gravity={[0, -9.81, 0]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[8, 0.3, 5]} position={[0, -0.3, 0]} />
        <mesh receiveShadow position={[0, -0.3, 0]}>
          <boxGeometry args={[16, 0.6, 10]} />
          <meshStandardMaterial color="#334337" roughness={0.7} />
        </mesh>
        {[-1, 1].map((s) => (
          <CuboidCollider key={s} args={[0.2, 6, 5]} position={[s * 8, 5, 0]} />
        ))}
        {[-1, 1].map((s) => (
          <CuboidCollider key={s} args={[8, 6, 0.2]} position={[0, 5, s * 5]} />
        ))}
      </RigidBody>
      {Array.from({ length: count }, (_, i) => (
        <RigidBody
          key={i}
          colliders="cuboid"
          position={[
            ((i % 5) - 2) * 1.3,
            2 + Math.floor(i / 5) * 1.3,
            ((i % 3) - 1) * 0.9,
          ]}
          rotation={[0, i * 0.35, 0.1]}
          restitution={0.22}
          friction={0.8}
        >
          <group onClick={(e) => e.stopPropagation()}>
            <Brick color={["#b7c686", "#d5b77b", "#7b9174"][i % 3]} />
          </group>
        </RigidBody>
      ))}
    </Physics>
  );
}
