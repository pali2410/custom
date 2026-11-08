import {
  Suspense,
  useState,
  useEffect,
  lazy,
  Component,
  type ReactNode,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, AdaptiveDpr } from "@react-three/drei";
import { ContributionWorld } from "../scenes/ContributionWorld";
import { NeuralNetwork } from "../scenes/NeuralNetwork";
import { DeveloperUniverse } from "../scenes/DeveloperUniverse";
import type { Day, GitHubData } from "../github/types";
import type { createNetwork } from "../utils/network.js";
const LegoWorld = lazy(() =>
  import("../scenes/LegoWorld").then((m) => ({ default: m.LegoWorld })),
);
function CameraRig({ mode }: { mode: Mode }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const factor = Math.max(
      1,
      (mode === "contributions" ? 1.7 : 1.1) / (size.width / size.height),
    );
    camera.position.set(
      ...((mode === "contributions"
        ? [15 * factor, 20 * factor, 24 * factor]
        : [15 * factor, 17 * factor, 23 * factor]) as [number, number, number]),
    );
    camera.lookAt(0, 0, 0);
  }, [mode, camera, size.width, size.height]);
  return null;
}
export type Mode = "contributions" | "neural" | "workbench" | "projects";
class Boundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="canvas-fallback">
        The 3D renderer could not start. Your contribution table and project
        links are available below.
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function World({
  mode,
  data,
  replay,
  paused,
  quality,
  network,
  activations,
  output,
  count,
  onDay,
  onInfo,
}: {
  mode: Mode;
  data: GitHubData;
  replay: number;
  paused: boolean;
  quality: boolean;
  network: ReturnType<typeof createNetwork>;
  activations: number[];
  output: number;
  count: number;
  onDay: (d: Day) => void;
  onInfo: (s: string) => void;
}) {
  const [lost, setLost] = useState(false);
  return (
    <Boundary>
      {lost ? (
        <div className="canvas-fallback">
          Graphics context lost. Reload to restore 3D, or explore the accessible
          data below.
        </div>
      ) : (
        <Canvas
          frameloop={paused ? "demand" : "always"}
          shadows={quality}
          dpr={quality ? [1, 1.6] : 1}
          camera={{
            position: mode === "contributions" ? [23, 24, 28] : [15, 17, 23],
            fov: 40,
          }}
          gl={{ antialias: quality, powerPreference: "high-performance" }}
          onCreated={({ gl }) =>
            gl.domElement.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              setLost(true);
            })
          }
        >
          <CameraRig mode={mode} />
          <color attach="background" args={["#141e17"]} />
          <ambientLight intensity={1.15} />
          <hemisphereLight args={["#e5e9d1", "#3f4e37", 1.5]} />
          <directionalLight
            position={[0, 25, 10]}
            intensity={3}
            castShadow={quality}
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-24}
            shadow-camera-right={24}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <directionalLight
            position={[-20, 4, -10]}
            intensity={1.5}
            color="#b6cca0"
          />
          <Suspense fallback={null}>
            {mode === "contributions" ? (
              <ContributionWorld
                days={data.calendar.weeks.flatMap((w) => w.contributionDays)}
                replay={replay}
                paused={paused}
                onSelect={onDay}
              />
            ) : mode === "neural" ? (
              <NeuralNetwork
                network={network}
                activations={activations}
                output={output}
                paused={paused}
                onSelect={onInfo}
              />
            ) : mode === "workbench" ? (
              <LegoWorld key={replay} count={count} paused={paused} />
            ) : (
              <DeveloperUniverse repos={data.repos} onSelect={onInfo} />
            )}
          </Suspense>
          <OrbitControls
            makeDefault
            minDistance={10}
            maxDistance={65}
            maxPolarAngle={Math.PI * 0.48}
            target={mode === "neural" ? [0, 1, 0] : [0, 0, 0]}
          />
          <AdaptiveDpr pixelated />
        </Canvas>
      )}
    </Boundary>
  );
}
