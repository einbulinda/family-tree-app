import React, { useState, useMemo } from "react";
import { Individual } from "../types";

interface TreeNode {
  individual: Individual;
  children: TreeNode[];
  isExpanded: boolean;
  depth: number;
  parent?: TreeNode;
}

interface CustomTreeProps {
  rootIndividual: Individual;
  allIndividuals: Individual[];
  relationships: {
    source: number;
    target: number;
    type: string;
  }[];
  selectedIndividual?: Individual;
  onIndividualClick?: (individual: Individual) => void;
  onAddChild?: (parent: Individual) => void;
}

const CustomTree: React.FC<CustomTreeProps> = ({
  rootIndividual,
  allIndividuals,
  relationships,
  selectedIndividual,
  onIndividualClick,
  onAddChild,
}) => {
  // Build the tree structure from root individual and relationships
  const buildTree = (
    individual: Individual,
    depth: number = 0,
    parent?: TreeNode
  ): TreeNode => {
    // Find direct children of this individual (where this individual is the parent)
    const childRelationships = relationships.filter(
      (rel) => rel.source === individual.id && rel.type === "child"
    );

    const children = childRelationships
      .map((rel) => {
        const child = allIndividuals.find((ind) => ind.id === rel.target);
        return child
          ? buildTree(child, depth + 1, {
              individual,
              children: [],
              isExpanded: true,
              depth,
            })
          : null;
      })
      .filter(Boolean) as TreeNode[];

    return {
      individual,
      children,
      isExpanded: true,
      depth,
      parent,
    };
  };

  // Build the tree structure
  const tree = useMemo(() => {
    if (rootIndividual) {
      return buildTree(rootIndividual);
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootIndividual, allIndividuals, relationships]);

  // Toggle expand/collapse state
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>(
    {}
  );

  const toggleNode = (nodeId: number) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Render a single node
  const renderNode = (node: TreeNode) => {
    const isExpanded = expandedNodes[node.individual.id] ?? node.isExpanded;
    const isSelected = selectedIndividual?.id === node.individual.id;

    return (
      <div key={node.individual.id} className="flex flex-col items-center">
        {/* Connection line from parent (if not root) */}
        {node.depth > 0 && <div className="w-px h-8 bg-gray-300"></div>}

        {/* Node container */}
        <div
          className={`relative w-48 p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 ${
            isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "bg-white"
          } hover:shadow-lg`}
          onClick={() => onIndividualClick?.(node.individual)}
        >
          {/* Profile icon */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 mx-auto ${
              node.individual.is_alive ? "bg-blue-100" : "bg-pink-100"
            }`}
          >
            {node.individual.photo_url ? (
              <img
                src={node.individual.photo_url}
                alt={`${node.individual.first_name} ${node.individual.last_name}`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-lg ${
                  node.individual.is_alive ? "bg-blue-500" : "bg-pink-500"
                }`}
              >
                {node.individual.first_name.charAt(0)}
                {node.individual.last_name.charAt(0)}
              </div>
            )}
          </div>

          {/* Name */}
          <div className="text-center font-medium text-gray-900 text-sm">
            {node.individual.first_name} {node.individual.last_name}
          </div>

          {/* Birth/Death dates */}
          <div className="text-xs text-gray-500 mt-1 text-center">
            {node.individual.birth_date && node.individual.death_date
              ? `${new Date(
                  node.individual.birth_date
                ).getFullYear()}–${new Date(
                  node.individual.death_date
                ).getFullYear()}`
              : node.individual.birth_date
              ? `${new Date(node.individual.birth_date).getFullYear()}–`
              : "–"}
          </div>

          {/* Status */}
          <div
            className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
              node.individual.is_alive
                ? "bg-blue-100 text-blue-800"
                : "bg-pink-100 text-pink-800"
            }`}
          >
            {node.individual.is_alive ? "Living" : "Deceased"}
          </div>

          {/* Add button */}
          <div className="absolute top-2 right-2">
            <button
              className="w-6 h-6 bg-white rounded-full flex items-center justify-center border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild?.(node.individual);
              }}
              title="Add child"
            >
              +
            </button>
          </div>

          {/* Expand/Collapse button */}
          {node.children.length > 0 && (
            <div className="absolute bottom-2 right-2">
              <button
                className="w-6 h-6 bg-white rounded-full flex items-center justify-center border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.individual.id);
                }}
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? "▼" : "▲"}
              </button>
            </div>
          )}
        </div>

        {/* Children container */}
        {node.children.length > 0 && isExpanded && (
          <div className="flex flex-wrap justify-center gap-6 mt-4 w-full">
            {node.children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (!tree) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Building family tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Family Tree</h3>
      <div className="flex justify-center">{renderNode(tree)}</div>
    </div>
  );
};

export default CustomTree;
