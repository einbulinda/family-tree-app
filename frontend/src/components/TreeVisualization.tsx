import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Individual } from "../types";

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

    // Create nodes and links for the tree
    const nodes = individuals.map((ind) => ({
      id: ind.id,
      name: `${ind.first_name} ${ind.last_name}`,
      is_alive: ind.is_alive,
      birth_date: ind.birth_date,
      death_date: ind.death_date,
    }));

    // Create links based on relationships
    const links = relationships.map((rel) => ({
      source: rel.source,
      target: rel.target,
      type: rel.type,
    }));

    // Create a force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

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
      .attr("fill", (d: any) => {
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
      .call(drag(simulation));

    // Add labels
    const label = svg
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("dx", 12)
      .attr("dy", 4)
      .text((d: any) => d.name)
      .attr("font-size", "12px")
      .attr("fill", "#374151");

    // Update positions on each tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);

      label.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
    });

    // Drag functions
    function drag(simulation: d3.Simulation<any, undefined>) {
      function dragstarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3
        .drag()
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
