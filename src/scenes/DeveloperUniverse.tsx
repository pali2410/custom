import { useState } from "react";
import { Text } from "@react-three/drei";
import { Brick } from "../components/Brick";
export function DeveloperUniverse({
  repos,
  onSelect,
}: {
  repos: { name: string; language: string | null; url: string }[];
  onSelect: (s: string) => void;
}) {
  const [active, setActive] = useState("");
  return (
    <group>
      {repos.map((r, i) => (
        <group
          key={r.name}
          position={[((i % 4) - 1.5) * 4, 0, (Math.floor(i / 4) - 1) * 4]}
          onClick={() => {
            setActive(r.name);
            onSelect(
              `${r.name} · ${r.language ?? "Unspecified language"} · select its repository card below to open GitHub`,
            );
          }}
        >
          <mesh receiveShadow position={[0, -0.2, 0]}>
            <boxGeometry args={[3.4, 0.3, 3.4]} />
            <meshStandardMaterial
              color={active === r.name ? "#6e8058" : "#2a3a2e"}
            />
          </mesh>
          {Array.from({ length: 3 + (i % 4) }, (_, j) => (
            <group
              key={j}
              position={[
                ((j % 2) - 0.5) * 1.12,
                0.25 + Math.floor(j / 2) * 0.57,
                0,
              ]}
            >
              <Brick color={i % 2 ? "#a2b37e" : "#cbb17a"} />
            </group>
          ))}
          <Text
            font={`${import.meta.env.BASE_URL}fonts/dm-sans.ttf`}
            position={[0, 0.1, 1.4]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.23}
            color="#d7ddcc"
          >
            {r.name}
          </Text>
        </group>
      ))}
    </group>
  );
}
