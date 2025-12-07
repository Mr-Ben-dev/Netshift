import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Particle type for the animation
interface Particle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
  duration: number;
}

// Node positions for "Before" chaotic network
const beforeNodes = [
  { x: 80, y: 60 },
  { x: 160, y: 40 },
  { x: 240, y: 80 },
  { x: 320, y: 50 },
  { x: 400, y: 90 },
  { x: 480, y: 60 },
  { x: 120, y: 140 },
  { x: 200, y: 160 },
  { x: 280, y: 130 },
  { x: 360, y: 170 },
  { x: 440, y: 140 },
  { x: 100, y: 220 },
  { x: 180, y: 250 },
  { x: 260, y: 210 },
  { x: 340, y: 260 },
  { x: 420, y: 230 },
  { x: 500, y: 200 },
];

// Chaotic connections (17 payments)
const beforeConnections = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [0, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [11, 12],
  [12, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 11],
  [5, 16],
];

// Node positions for "After" clean network
const afterNodes = [
  { x: 150, y: 100 },
  { x: 300, y: 80 },
  { x: 450, y: 100 },
  { x: 225, y: 200 },
];

// Clean connections (4 payments)
const afterConnections = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
];

export function GraphVisualization() {
  const [phase, setPhase] = useState<"before" | "transitioning" | "after">(
    "before"
  );
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.5 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => {
        if (prev === "before") return "transitioning";
        if (prev === "transitioning") return "after";
        return "before";
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Generate particles for the transition
  useEffect(() => {
    if (phase === "transitioning") {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          startX: Math.random() * 560 + 20,
          startY: Math.random() * 280 + 20,
          endX: 290 + (Math.random() - 0.5) * 100,
          endY: 150 + (Math.random() - 0.5) * 60,
          delay: Math.random() * 0.5,
          duration: 0.8 + Math.random() * 0.4,
        });
      }
      setParticles(newParticles);
    }
  }, [phase]);

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto"
      animate={{
        opacity: isInView ? 1 : 0.4,
        filter: isInView ? "brightness(1)" : "brightness(0.5)",
      }}
      transition={{ duration: 0.5 }}
    >
      {/* Dynamic glow that intensifies when in view */}
      <motion.div
        className="absolute -inset-8 rounded-3xl pointer-events-none"
        animate={{
          background: isInView
            ? "radial-gradient(ellipse at center, rgba(34,211,238,0.15) 0%, rgba(168,85,247,0.08) 40%, transparent 70%)"
            : "radial-gradient(ellipse at center, rgba(34,211,238,0.02) 0%, transparent 50%)",
          opacity: isInView ? 1 : 0.2,
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Labels */}
      <div className="flex justify-between items-center mb-4 px-4">
        <motion.div
          animate={{ opacity: phase === "before" ? 1 : 0.3 }}
          className="text-center"
        >
          <span className="text-2xl font-bold text-red-400">17</span>
          <span className="text-sm text-white/50 ml-2">Payments</span>
        </motion.div>

        <motion.div
          animate={{
            scale: phase === "transitioning" ? [1, 1.2, 1] : 1,
            opacity: phase === "transitioning" ? 1 : 0.5,
          }}
          transition={{
            duration: 0.5,
            repeat: phase === "transitioning" ? Infinity : 0,
          }}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-white/20"
        >
          <span className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            NetShift Magic ✨
          </span>
        </motion.div>

        <motion.div
          animate={{ opacity: phase === "after" ? 1 : 0.3 }}
          className="text-center"
        >
          <span className="text-2xl font-bold text-green-400">4</span>
          <span className="text-sm text-white/50 ml-2">Payments</span>
        </motion.div>
      </div>

      {/* SVG Visualization */}
      <motion.div
        className="relative h-[320px] rounded-2xl bg-gradient-to-b from-slate-900/50 to-slate-950/80 border border-white/10 overflow-hidden"
        animate={{
          borderColor: isInView
            ? "rgba(255,255,255,0.2)"
            : "rgba(255,255,255,0.05)",
          boxShadow: isInView
            ? "0 0 60px rgba(34,211,238,0.15), 0 0 120px rgba(168,85,247,0.1), inset 0 0 60px rgba(34,211,238,0.05)"
            : "0 0 20px rgba(34,211,238,0.02)",
        }}
        transition={{ duration: 0.6 }}
      >
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Glow effects - animated based on view */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-[80px]"
          animate={{
            opacity: isInView ? 1 : 0.2,
            scale: isInView ? 1 : 0.5,
          }}
          transition={{ duration: 0.8 }}
        />
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/15 rounded-full blur-[60px]"
          animate={{
            opacity: isInView ? 1 : 0.1,
            scale: isInView ? 1 : 0.3,
          }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-emerald-500/10 rounded-full blur-[70px]"
          animate={{
            opacity: isInView ? 1 : 0,
            scale: isInView ? 1 : 0.3,
          }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        <svg viewBox="0 0 600 320" className="w-full h-full relative z-10">
          <defs>
            {/* Gradient for connections */}
            <linearGradient
              id="line-gradient-red"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#f87171" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient
              id="line-gradient-green"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.5" />
            </linearGradient>
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Before Network - Chaotic */}
          <g
            style={{
              opacity: phase === "before" ? 1 : 0,
              transition: "opacity 0.5s",
            }}
          >
            {/* Connections */}
            {beforeConnections.map(([from, to], i) => (
              <motion.line
                key={`before-line-${i}`}
                x1={beforeNodes[from].x}
                y1={beforeNodes[from].y}
                x2={beforeNodes[to].x}
                y2={beforeNodes[to].y}
                stroke="url(#line-gradient-red)"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: i * 0.03 }}
              />
            ))}
            {/* Nodes */}
            {beforeNodes.map((node, i) => (
              <motion.g key={`before-node-${i}`}>
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="8"
                  fill="#1e293b"
                  stroke="#f87171"
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                />
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="3"
                  fill="#f87171"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.02 + 0.1 }}
                />
              </motion.g>
            ))}
          </g>

          {/* Transition Particles */}
          {phase === "transitioning" &&
            particles.map((p) => (
              <motion.circle
                key={`particle-${p.id}`}
                r="4"
                fill="#22d3ee"
                filter="url(#glow)"
                initial={{ cx: p.startX, cy: p.startY, opacity: 1 }}
                animate={{ cx: p.endX, cy: p.endY, opacity: 0 }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: "easeInOut",
                }}
              />
            ))}

          {/* Center explosion effect during transition */}
          {phase === "transitioning" && (
            <motion.circle
              cx="300"
              cy="150"
              fill="none"
              stroke="url(#line-gradient-green)"
              strokeWidth="3"
              filter="url(#glow)"
              initial={{ r: 0, opacity: 1 }}
              animate={{ r: 150, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          )}

          {/* After Network - Clean */}
          <g
            style={{
              opacity: phase === "after" ? 1 : 0,
              transition: "opacity 0.5s",
            }}
          >
            {/* Connections */}
            {afterConnections.map(([from, to], i) => (
              <motion.line
                key={`after-line-${i}`}
                x1={afterNodes[from].x}
                y1={afterNodes[from].y}
                x2={afterNodes[to].x}
                y2={afterNodes[to].y}
                stroke="url(#line-gradient-green)"
                strokeWidth="3"
                filter="url(#glow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              />
            ))}
            {/* Nodes */}
            {afterNodes.map((node, i) => (
              <motion.g key={`after-node-${i}`}>
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  fill="#0f172a"
                  stroke="#4ade80"
                  strokeWidth="3"
                  filter="url(#glow)"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.1, type: "spring" }}
                />
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="8"
                  fill="#4ade80"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 + 0.2 }}
                />
                {/* Pulse effect */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="2"
                  initial={{ r: 20, opacity: 0.8 }}
                  animate={{ r: 35, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              </motion.g>
            ))}

            {/* Center label */}
            <motion.text
              x="300"
              y="280"
              textAnchor="middle"
              fill="#4ade80"
              fontSize="14"
              fontWeight="bold"
              initial={{ opacity: 0, y: 290 }}
              animate={{ opacity: 1, y: 280 }}
              transition={{ delay: 0.8 }}
            >
              76% Reduction ✓
            </motion.text>
          </g>
        </svg>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 to-transparent" />
      </motion.div>

      {/* Status indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {["before", "transitioning", "after"].map((p) => (
          <motion.div
            key={p}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              phase === p ? "w-8 bg-cyan-400" : "w-2 bg-white/20"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
