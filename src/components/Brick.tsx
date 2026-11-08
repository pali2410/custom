export function Brick({ color = "#bac887" }: { color?: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.5, 0.62]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} position={[x, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.12, 12]} />
          <meshStandardMaterial color={color} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}
