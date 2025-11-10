import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface Node {
  id: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string | Node;
  target: string | Node;
}

export function GraphVisualization() {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!svgRef.current) return;

    const runAnimation = () => {
      const width = 600;
      const height = 400;
      const svg = d3.select(svgRef.current!);

      svg.selectAll("*").remove();

      // Create gradient definitions
      const defs = svg.append("defs");

      const gradient = defs
        .append("linearGradient")
        .attr("id", "link-gradient")
        .attr("gradientUnits", "userSpaceOnUse");

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "hsl(var(--secondary))")
        .attr("stop-opacity", 0.6);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "hsl(var(--primary))")
        .attr("stop-opacity", 0.6);

      const g = svg.append("g");

      // Complex network (17 nodes)
      const complexNodes: Node[] = Array.from({ length: 17 }, (_, i) => ({
        id: `node-${i}`,
      }));

      const complexLinks: Link[] = [
        { source: "node-0", target: "node-1" },
        { source: "node-1", target: "node-2" },
        { source: "node-2", target: "node-3" },
        { source: "node-3", target: "node-4" },
        { source: "node-4", target: "node-0" },
        { source: "node-5", target: "node-6" },
        { source: "node-6", target: "node-7" },
        { source: "node-7", target: "node-8" },
        { source: "node-8", target: "node-5" },
        { source: "node-9", target: "node-10" },
        { source: "node-10", target: "node-11" },
        { source: "node-11", target: "node-9" },
        { source: "node-0", target: "node-5" },
        { source: "node-5", target: "node-9" },
        { source: "node-9", target: "node-12" },
        { source: "node-12", target: "node-13" },
        { source: "node-13", target: "node-14" },
        { source: "node-14", target: "node-15" },
        { source: "node-15", target: "node-16" },
        { source: "node-16", target: "node-0" },
        { source: "node-2", target: "node-10" },
        { source: "node-6", target: "node-14" },
      ];

      // Simple network (4 nodes)
      const simpleNodes: Node[] = Array.from({ length: 4 }, (_, i) => ({
        id: `simple-${i}`,
      }));

      const simpleLinks: Link[] = [
        { source: "simple-0", target: "simple-1" },
        { source: "simple-1", target: "simple-2" },
        { source: "simple-2", target: "simple-3" },
        { source: "simple-3", target: "simple-0" },
      ];

      // Start with complex network
      const simulation = d3
        .forceSimulation(complexNodes as d3.SimulationNodeDatum[])
        .force(
          "link",
          d3
            .forceLink(complexLinks)
            .id((d: any) => d.id)
            .distance(50)
        )
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(25));

      // Create links
      const link = g
        .append("g")
        .selectAll("line")
        .data(complexLinks)
        .join("line")
        .attr("stroke", "url(#link-gradient)")
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.6);

      // Create nodes
      const node = g
        .append("g")
        .selectAll("circle")
        .data(complexNodes)
        .join("circle")
        .attr("r", 8)
        .attr("fill", "hsl(var(--primary))")
        .attr("stroke", "hsl(var(--secondary))")
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))");

      simulation.on("tick", () => {
        link
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);

        node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
      });

      // Animate to simple network after 3 seconds
      setTimeout(() => {
        // Transition to simple network
        const simpleSimulation = d3
          .forceSimulation(simpleNodes as d3.SimulationNodeDatum[])
          .force(
            "link",
            d3
              .forceLink(simpleLinks)
              .id((d: any) => d.id)
              .distance(120)
          )
          .force("charge", d3.forceManyBody().strength(-300))
          .force("center", d3.forceCenter(width / 2, height / 2));

        // Update links
        link
          .data(simpleLinks)
          .join(
            (enter) =>
              enter
                .append("line")
                .attr("stroke", "url(#link-gradient)")
                .attr("stroke-width", 3)
                .attr("stroke-opacity", 0),
            (update) => update,
            (exit) =>
              exit
                .transition()
                .duration(1000)
                .attr("stroke-opacity", 0)
                .remove()
          )
          .transition()
          .duration(1000)
          .attr("stroke-opacity", 0.8)
          .attr("stroke-width", 3);

        // Update nodes
        node
          .data(simpleNodes)
          .join(
            (enter) =>
              enter
                .append("circle")
                .attr("r", 0)
                .attr("fill", "hsl(var(--success))")
                .attr("stroke", "hsl(var(--primary))")
                .attr("stroke-width", 3),
            (update) => update,
            (exit) => exit.transition().duration(1000).attr("r", 0).remove()
          )
          .transition()
          .duration(1000)
          .attr("r", 16)
          .attr("fill", "hsl(var(--success))")
          .style("filter", "drop-shadow(0 0 12px hsl(var(--success) / 0.6))");

        simpleSimulation.on("tick", () => {
          link
            .attr("x1", (d: any) => d.source.x)
            .attr("y1", (d: any) => d.source.y)
            .attr("x2", (d: any) => d.target.x)
            .attr("y2", (d: any) => d.target.y);

          node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
        });

        // Loop back to complex after 3 more seconds
        animationRef.current = window.setTimeout(() => {
          runAnimation(); // Restart animation instead of page reload
        }, 6000);
      }, 3000);

      return () => {
        simulation.stop();
      };
    };

    runAnimation();

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 400"
      className="w-full h-full"
      style={{ maxHeight: "400px" }}
    />
  );
}
