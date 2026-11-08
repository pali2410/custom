import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Text } from "@react-three/drei";
import type * as THREE from "three";
type Network = {
  w: number[][];
  b: number[];
  v: number[];
  c: number;
  epoch: number;
};
export function NeuralNetwork({
  network,
  activations,
  output,
  paused,
  onSelect,
}: {
  network: Network;
  activations: number[];
  output: number;
  paused: boolean;
  onSelect: (s: string) => void;
}) {
  const nodes: [number, number, number][][] = [
    [
      [-7, -1.8, 0],
      [-7, 1.8, 0],
    ],
    Array.from(
      { length: 4 },
      (_, i) => [0, (i - 1.5) * 2.3, 0] as [number, number, number],
    ),
    [[7, 0, 0]],
  ];
  const signals = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (!paused && signals.current)
      signals.current.children.forEach((m, i) => {
        const pair =
          i < 8
            ? [nodes[0][i % 2], nodes[1][Math.floor(i / 2)]]
            : [nodes[1][i - 8], nodes[2][0]];
        const t = (clock.elapsedTime * 0.4) % 1;
        m.position.set(
          pair[0][0] + (pair[1][0] - pair[0][0]) * t,
          pair[0][1] + (pair[1][1] - pair[0][1]) * t,
          0,
        );
      });
  });
  return (
    <group rotation={[-0.25, 0, 0]}>
      {nodes[0].flatMap((p, i) =>
        nodes[1].map((q, j) => (
          <Line
            key={`a${i}${j}`}
            points={[p, q]}
            color={network.w[j][i] > 0 ? "#b9cf82" : "#b69277"}
            transparent
            opacity={0.4}
            lineWidth={Math.min(4, Math.abs(network.w[j][i]) + 0.5)}
          />
        )),
      )}
      {nodes[1].map((p, i) => (
        <Line
          key={`b${i}`}
          points={[p, nodes[2][0]]}
          color={network.v[i] > 0 ? "#b9cf82" : "#b69277"}
          lineWidth={Math.min(4, Math.abs(network.v[i]) + 0.5)}
          transparent
          opacity={0.5}
        />
      ))}
      {nodes.map((layer, l) =>
        layer.map((p, i) => (
          <group key={`${l}-${i}`} position={p}>
            <mesh
              onClick={() =>
                onSelect(
                  l === 1
                    ? `Hidden neuron ${i + 1} · tanh activation ${activations[i].toFixed(4)} · bias ${network.b[i].toFixed(3)}`
                    : l === 2
                      ? `Output sigmoid · ${output.toFixed(4)}`
                      : `Input neuron ${i + 1}`,
                )
              }
            >
              <icosahedronGeometry args={[l === 2 ? 0.9 : 0.65, 3]} />
              <meshStandardMaterial
                color={l === 1 ? "#a3bb70" : l === 2 ? "#e4ba79" : "#c6d5ba"}
                metalness={0.4}
                roughness={0.25}
                emissive="#819348"
                emissiveIntensity={
                  l === 1 ? Math.abs(activations[i]) * 0.25 : 0.1
                }
              />
            </mesh>
            <Text
              font={`${import.meta.env.BASE_URL}fonts/dm-sans.ttf`}
              position={[0, -1.1, 0]}
              fontSize={0.3}
              color="#c2ccba"
            >
              {l === 1
                ? activations[i].toFixed(2)
                : l === 2
                  ? output.toFixed(2)
                  : `x${i + 1}`}
            </Text>
          </group>
        )),
      )}
      <group ref={signals}>
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#e4ce8c" />
          </mesh>
        ))}
      </group>
      {["INPUT / 2", "HIDDEN / tanh", "OUTPUT / sigmoid"].map((s, i) => (
        <Text
          font={`${import.meta.env.BASE_URL}fonts/dm-sans.ttf`}
          key={s}
          position={[(i - 1) * 7, 6, 0]}
          fontSize={0.4}
          color="#c0cbb7"
        >
          {s}
        </Text>
      ))}
    </group>
  );
}
