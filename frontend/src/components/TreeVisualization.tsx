import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Individual } from "../types";

// Define the correct type for D3 nodes
interface SimulationNodeDatum {
  id: number;
  name: string;
  is_alive: boolean;
  birth_date?: string;
  death_date?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimulationLinkDatum {
  source: number | SimulationNodeDatum;
  target: number | SimulationNodeDatum;
  type: string;
}

interface TreeVisualizationProps {
  individuals: Individual[];
  relationships: {
    source: number;
    target: number;
    type: string;
  }[];
  selectedIndividual?: Individual;
  onIndividualClick?: (individual: Individual) => void;
}

const TreeVisualization: React.FC<TreeVisualizationProps> = ({
  individuals,
  relationships,
  selectedIndividual,
  onIndividualClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || individuals.length === 0) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 800;
    const height = 600;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(40,0)");

    // Create nodes with proper types
    const nodes: SimulationNodeDatum[] = individuals.map((ind) => ({
      id: ind.id,
      name: `${ind.first_name} ${ind.last_name}`,
      is_alive: ind.is_alive,
      birth_date: ind.birth_date,
      death_date: ind.death_date,
      x: 0,
      y: 0,
      fx: null,
      fy: null,
    }));

    // Create links with proper types
    const links: SimulationLinkDatum[] = relationships.map((rel) => ({
      source: rel.source,
      target: rel.target,
      type: rel.type,
    }));

    // Create a force simulation with proper typing
    const simulation = d3
      .forceSimulation<SimulationNodeDatum>(nodes)
      .force(
        "link",
        d3
          .forceLink<SimulationNodeDatum, SimulationLinkDatum>(links) // Fixed: Added second type parameter
          .id((d) => d.id.toString())
          .distance(100)
      )
      .force("charge", d3.forceManyBody<SimulationNodeDatum>().strength(-300))
      .force(
        "center",
        d3.forceCenter<SimulationNodeDatum>(width / 2, height / 2)
      );

    // Add links
    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);

    // Add nodes
    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 20)
      .attr("fill", (d) => {
        if (selectedIndividual && d.id === selectedIndividual.id)
          return "#4f46e5";
        return d.is_alive ? "#10b981" : "#9ca3af";
      })
      .on("click", (event, d) => {
        const individual = individuals.find((ind) => ind.id === d.id);
        if (individual && onIndividualClick) {
          onIndividualClick(individual);
        }
      })
      .call(drag(simulation) as any);

    // Add labels
    const label = svg
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("dx", 12)
      .attr("dy", 4)
      .text((d) => d.name)
      .attr("font-size", "12px")
      .attr("fill", "#374151");

    // Update positions on each tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => {
          const source =
            typeof d.source === "object"
              ? d.source
              : nodes.find((n) => n.id === d.source);
          return source?.x || 0;
        })
        .attr("y1", (d) => {
          const source =
            typeof d.source === "object"
              ? d.source
              : nodes.find((n) => n.id === d.source);
          return source?.y || 0;
        })
        .attr("x2", (d) => {
          const target =
            typeof d.target === "object"
              ? d.target
              : nodes.find((n) => n.id === d.target);
          return target?.x || 0;
        })
        .attr("y2", (d) => {
          const target =
            typeof d.target === "object"
              ? d.target
              : nodes.find((n) => n.id === d.target);
          return target?.y || 0;
        });

      node.attr("cx", (d) => d.x || 0).attr("cy", (d) => d.y || 0);

      label.attr("x", (d) => d.x || 0).attr("y", (d) => d.y || 0);
    });

    // Drag functions
    function drag(simulation: d3.Simulation<SimulationNodeDatum, undefined>) {
      function dragstarted(
        event: d3.D3DragEvent<
          SVGCircleElement,
          SimulationNodeDatum,
          SimulationNodeDatum
        >
      ) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(
        event: d3.D3DragEvent<
          SVGCircleElement,
          SimulationNodeDatum,
          SimulationNodeDatum
        >
      ) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(
        event: d3.D3DragEvent<
          SVGCircleElement,
          SimulationNodeDatum,
          SimulationNodeDatum
        >
      ) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3
        .drag<SVGCircleElement, SimulationNodeDatum>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    // Cleanup function
    return () => {
      simulation.stop();
    };
  }, [individuals, relationships, selectedIndividual, onIndividualClick]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Family Tree Visualization
      </h3>
      <svg
        ref={svgRef}
        className="w-full h-96 border border-gray-200 rounded"
      />
      <div className="mt-4 flex space-x-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Living</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-400 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Deceased</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-indigo-600 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Selected</span>
        </div>
      </div>
    </div>
  );
};

export default TreeVisualization;
