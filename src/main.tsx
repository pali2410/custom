import React, { Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  Box,
  GitBranch,
  Layers,
  Network,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  ChevronDown,
  ArrowDown,
  ExternalLink,
} from "lucide-react";
import type { Day, GitHubData } from "./github/types";
import type { Mode } from "./components/World";
import { createNetwork, forward, train, loss } from "./utils/network.js";
import "./style.css";
const World = lazy(() => import("./components/World"));
const modes: { id: Mode; title: string; icon: typeof Box; label: string }[] = [
  {
    id: "contributions",
    title: "Contribution landscape",
    icon: Layers,
    label: "01",
  },
  { id: "neural", title: "Neural laboratory", icon: Network, label: "02" },
  { id: "workbench", title: "Physics workbench", icon: Box, label: "03" },
  { id: "projects", title: "Project district", icon: GitBranch, label: "04" },
];
function App() {
  const [data, setData] = useState<GitHubData>();
  const [year, setYear] = useState("rolling");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("contributions");
  const [replay, setReplay] = useState(0);
  const [paused, setPaused] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [quality, setQuality] = useState(() => innerWidth > 700);
  const [day, setDay] = useState<Day>();
  const [info, setInfo] = useState("");
  const [network, setNetwork] = useState(createNetwork);
  const [input, setInput] = useState([0, 1]);
  const [count, setCount] = useState(20);
  const [table, setTable] = useState(false);
  const [repoStatus, setRepoStatus] = useState("");
  const [syncing, setSyncing] = useState(false);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/github.json`)
      .then((r) => {
        if (!r.ok) throw Error("GitHub snapshot unavailable");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  const changeMode = (m: Mode) => {
    setMode(m);
    setInfo("");
    setReplay((r) => r + 1);
  };
  const result = forward(network, input);
  const selectedData = data
    ? {
        ...data,
        calendar: year === "rolling" ? data.calendar : data.calendars[year],
      }
    : undefined;
  const days =
    selectedData?.calendar.weeks.flatMap((w) => w.contributionDays) ?? [];
  const active = days.filter((d) => d.contributionCount > 0).length;
  const peak = days.reduce((m, d) => Math.max(m, d.contributionCount), 0);
  async function refresh() {
    if (!data) return;
    setSyncing(true);
    try {
      const r = await fetch(
        "https://api.github.com/users/pali2410/repos?per_page=100",
      );
      if (!r.ok) throw Error("GitHub API unavailable or rate limited");
      const repos = await r.json();
      setData({
        ...data,
        repos: repos
          .filter((r: any) => !r.fork)
          .map((r: any) => ({
            name: r.name,
            description: r.description,
            language: r.language,
            url: r.html_url,
            stars: r.stargazers_count,
            updatedAt: r.updated_at,
          })),
      });
      setRepoStatus(
        "Repository list refreshed from GitHub. Contribution snapshot refreshes through the daily workflow.",
      );
    } catch (e) {
      setRepoStatus((e as Error).message);
    } finally {
      setSyncing(false);
    }
  }
  return (
    <>
      <header>
        <a className="identity" href="#">
          <span className="mark">
            <Box size={22} />
          </span>
          pali<span className="muted">/</span>2410
          <span className="edition">DEVELOPER UNIVERSE</span>
        </a>
        <nav>
          <a href="#explore">Explore</a>
          <a href="#projects">Projects</a>
          <a
            href="https://github.com/pali2410"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>
      <main>
        <section className="intro">
          <div className="intro-copy">
            <div className="eyebrow">
              <span className="status-dot" /> AN OPEN WORLD OF WORK & CURIOSITY
            </div>
            <h1>
              A world, built
              <br />
              one <em>commit</em> at a time.
            </h1>
            <p>
              I’m {data?.user.name ?? "paramveer sinh zala"}. Welcome to my
              corner of the internet —<br className="desktop" /> a living
              landscape of code, experiments, and things I’m building.
            </p>
            <a className="text-link" href="#explore">
              Step into the universe <ArrowDown size={16} />
            </a>
          </div>
          <div className="intro-side">
            <span className="coordinate">SMALL IDEAS / OPEN POSSIBILITIES</span>
            <div className="mini-bricks" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <span>
              Small pieces.
              <br />
              Endless possibilities.
            </span>
          </div>
        </section>
        <section id="explore" className="explorer">
          <div className="explorer-heading">
            <div>
              <span className="eyebrow">THE INTERACTIVE ATLAS</span>
              <h2>Every contribution leaves a mark.</h2>
            </div>
            <span className="live-label">
              <span className="status-dot" /> REAL GITHUB DATA
            </span>
          </div>
          <div className="world-shell">
            <div
              className="world-nav"
              role="tablist"
              aria-label="Choose a world"
            >
              {modes.map((m) => (
                <button
                  role="tab"
                  aria-label={m.title}
                  aria-selected={mode === m.id}
                  key={m.id}
                  className={mode === m.id ? "selected" : ""}
                  onClick={() => changeMode(m.id)}
                >
                  <m.icon size={16} />
                  <span>{m.title}</span>
                  <small>{m.label}</small>
                </button>
              ))}
            </div>
            <div
              className="viewport"
              role="region"
              aria-label={`${mode} interactive 3D scene. Drag to orbit; scroll to zoom.`}
            >
              <div className="scene-label">
                <span>
                  {mode === "contributions"
                    ? "A YEAR IN BRICKS"
                    : mode === "neural"
                      ? "LEARNING, MADE VISIBLE"
                      : mode === "workbench"
                        ? "BUILD. DROP. REPEAT."
                        : "IDEAS WITH AN ADDRESS"}
                </span>
                <small>
                  {mode === "contributions" && days.length
                    ? `${days[0].date} — ${days[days.length - 1].date}`
                    : "Drag to discover a different perspective"}
                </small>
              </div>
              {mode === "contributions" && (
                <select
                  className="year-select"
                  aria-label="Contribution period"
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    setDay(undefined);
                    setReplay((r) => r + 1);
                  }}
                >
                  <option value="rolling">Last 12 months</option>
                  {Object.keys(data?.calendars ?? {})
                    .reverse()
                    .map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                </select>
              )}
              {selectedData ? (
                <Suspense
                  fallback={
                    <div className="canvas-fallback">
                      Assembling your universe…
                    </div>
                  }
                >
                  <World
                    mode={mode}
                    data={selectedData}
                    replay={replay}
                    paused={paused}
                    quality={quality}
                    network={network}
                    activations={result.hidden}
                    output={result.output}
                    count={count}
                    onDay={setDay}
                    onInfo={setInfo}
                  />
                </Suspense>
              ) : (
                <div className="canvas-fallback">
                  {error || "Retrieving verified GitHub activity…"}
                </div>
              )}
              <div className="scene-info" aria-live="polite">
                {mode === "contributions" ? (
                  day ? (
                    <>
                      <strong>{day.contributionCount} contributions</strong>
                      <span>
                        {new Date(day.date + "T12:00:00Z").toLocaleDateString(
                          "en",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            timeZone: "UTC",
                          },
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <strong>A tiny city of consistency.</strong>
                      <span>Hover or tap a brick to explore a day.</span>
                    </>
                  )
                ) : (
                  <>
                    <strong>{modes.find((m) => m.id === mode)?.title}</strong>
                    <span>
                      {info ||
                        (mode === "neural"
                          ? "Select a neuron. Train the network below."
                          : mode === "workbench"
                            ? "Real gravity, friction, stacking, and collisions."
                            : "Select a building, then explore its repository below.")}
                    </span>
                  </>
                )}
              </div>
              <div className="world-tools">
                <button
                  title={
                    paused
                      ? "Enable animation"
                      : "Reduce motion / pause simulation"
                  }
                  aria-label={paused ? "Enable animation" : "Pause simulation"}
                  onClick={() => setPaused((p) => !p)}
                >
                  {paused ? <Play size={17} /> : <Pause size={17} />}
                </button>
                {(mode === "contributions" || mode === "workbench") && <button
                  title="Replay assembly / reset physics"
                  aria-label="Replay assembly or reset physics"
                  onClick={() => setReplay((r) => r + 1)}
                >
                  <RotateCcw size={17} />
                </button>}
                <button
                  className={quality ? "" : "active"}
                  title="Toggle rendering quality"
                  aria-label={`Rendering quality: ${quality ? "high" : "low"}`}
                  onClick={() => setQuality((q) => !q)}
                >
                  <Settings2 size={17} />
                </button>
              </div>
              <div className="orbit-hint">
                DRAG TO ORBIT <span>·</span> SCROLL TO ZOOM
              </div>
            </div>
            <div className="world-footer">
              <span>
                <i className="legend-dot" /> Less{" "}
                <span className="legend">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>{" "}
                More
              </span>
              <span>One date. Many small building blocks.</span>
              <button onClick={() => setTable((t) => !t)}>
                {table ? "Hide data" : "Explore the data"}{" "}
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
          {mode === "neural" && (
            <div className="lab-controls">
              <div>
                <h3>A network that actually learns.</h3>
                <p>
                  2 inputs → 4 tanh neurons → 1 sigmoid output. Full-batch
                  backpropagation on XOR; lines show learned signed weights.
                </p>
              </div>
              <div className="lab-buttons">
                {input.map((v, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setInput((p) => p.map((x, j) => (j === i ? 1 - x : x)))
                    }
                  >
                    x{i + 1}: {v}
                  </button>
                ))}
                <button
                  className="primary"
                  onClick={() => setNetwork((n) => train(n, 500))}
                >
                  Train 500 steps
                </button>
                <button onClick={() => setNetwork(createNetwork())}>
                  Reset
                </button>
              </div>
              <p className="mono">
                Epoch {network.epoch} · Loss {loss(network).toFixed(4)} ·
                Prediction {result.output.toFixed(4)} · Target{" "}
                {input[0] ^ input[1]}
              </p>
            </div>
          )}
          {mode === "workbench" && (
            <div className="lab-controls">
              <h3>A small playground for real physics.</h3>
              <p>
                Bricks have cuboid collision bodies and cosmetic studs. A
                bounded tray keeps them on the workbench.
              </p>
              <button
                className="primary"
                disabled={count >= 60}
                onClick={() => setCount((c) => Math.min(60, c + 5))}
              >
                Drop 5 bricks ({count}/60)
              </button>
              <button
                onClick={() => {
                  setCount(20);
                  setReplay((r) => r + 1);
                }}
              >
                Rebuild
              </button>
            </div>
          )}
          {table && (
            <div className="data-table">
              <h3>The source behind the landscape</h3>
              <p>
                GitHub’s contribution calendar, captured{" "}
                {data ? new Date(data.fetchedAt).toLocaleString() : ""}.
                Includes only activity visible to the API. Heights use a
                square-root scale, capped at 14 brick layers.
              </p>
              <div className="table-scroll">
                <table>
                  <caption>Daily contributions for pali2410</caption>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Contributions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((d) => (
                      <tr key={d.date}>
                        <td>{d.date}</td>
                        <td>{d.contributionCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="stats">
            <div>
              <span className="stat-number">
                {selectedData?.calendar.totalContributions.toLocaleString() ??
                  "—"}
              </span>
              <span>contributions in this snapshot</span>
            </div>
            <div>
              <span className="stat-number">
                {active || "—"}
                <small> days</small>
              </span>
              <span>with something built</span>
            </div>
            <div>
              <span className="stat-number">{peak || "—"}</span>
              <span>contributions on the busiest day</span>
            </div>
            <div className="stats-note">
              <GitBranch size={20} />
              <span>
                Real activity.
                <br />A different perspective.
              </span>
            </div>
          </div>
        </section>
        <section className="projects" id="projects">
          <div className="section-title">
            <div>
              <span className="eyebrow">OUT OF THE WORKSHOP</span>
              <h2>Things I’ve put into the world.</h2>
            </div>
            <button onClick={refresh} disabled={syncing}>
              {syncing ? "Refreshing…" : "Refresh repositories"}{" "}
              <RotateCcw size={14} />
            </button>
          </div>
          <p role="status" className="repo-status">{repoStatus}</p>
          <p className="section-description">
            Public repositories from my GitHub. Open a project and see what’s
            inside.
          </p>
          <div className="project-grid">
            {data?.repos.map((r, i) => (
              <a
                className="project"
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noreferrer"
              >
                <div className="project-top">
                  <span className="project-index">
                    {String(i + 1).padStart(2, "0")} /
                  </span>
                  <ArrowUpRight size={20} />
                </div>
                <div className="project-model" aria-hidden="true">
                  <div
                    style={
                      {
                        "--brick-color": ["#aabc79", "#c5ad7d", "#7f9b83"][
                          i % 3
                        ],
                      } as React.CSSProperties
                    }
                  >
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <h3>{r.name}</h3>
                <p>
                  {r.description ||
                    "Explore the source, experiments, and project history on GitHub."}
                </p>
                <div className="project-meta">
                  <span>
                    <i />
                    {r.language ?? "Repository"}
                  </span>
                  <span>
                    View source <ExternalLink size={12} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
        <section className="closing">
          <span className="eyebrow">A WORK IN PROGRESS. BY DESIGN.</span>
          <h2>
            Good things start
            <br />
            with a little curiosity.
          </h2>
          <a
            className="primary"
            href="https://github.com/pali2410"
            target="_blank"
            rel="noreferrer"
          >
            Find me on GitHub <ArrowUpRight size={17} />
          </a>
        </section>
      </main>
      <footer>
        <a className="identity" href="#">
          <Box size={18} /> pali2410
        </a>
        <span>Built in small pieces. Connected by code.</span>
        <a href="https://github.com/pali2410/custom">
          Explore this universe’s source <ArrowUpRight size={14} />
        </a>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
