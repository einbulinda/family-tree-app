import React, { useEffect, useState } from "react";
import { Individual } from "../types";
import { logger } from "../utils/logger";
import {
  Relationship,
  relationshipService,
} from "../services/relationshipService";

interface RelationshipManagerProps {
  individual: Individual;
  onRelationshipsUpdate?: () => void;
}

const RelationshipManager: React.FC<RelationshipManagerProps> = ({
  individual,
  onRelationshipsUpdate,
}) => {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRelationship, setNewRelationship] = useState({
    related_individual_id: "",
    relationship_type: "spouse",
  });
  const [error, setError] = useState("");
  const [allIndividuals, setAllIndividuals] = useState<Individual[]>([]);

  useEffect(() => {
    loadRelationships();
    loadAllIndividuals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [individual.id]);

  const loadRelationships = async () => {
    try {
      setLoading(true);
      const data = await relationshipService.getRelationships(individual.id);
      setRelationships(data);
    } catch (err) {
      logger.error("Error loading relationships", { error: err });
      setError("Failed to load relationships");
    } finally {
      setLoading(false);
    }
  };

  const loadAllIndividuals = async () => {
    try {
      // For now, we'll need to fetch all individuals
      // This would be implemented in a future API endpoint
      // For now, we'll just show a placeholder
    } catch (err) {
      logger.error("Error loading individuals for relationships", {
        error: err,
      });
    }
  };

  const handleAddRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (!newRelationship.related_individual_id) {
        setError("Please select a related individual");
        return;
      }

      await relationshipService.createRelationship(
        individual.id,
        Number.parseInt(newRelationship.related_individual_id),
        newRelationship.relationship_type
      );

      setNewRelationship({
        related_individual_id: "",
        relationship_type: "spouse",
      });

      loadRelationships(); // Refresh the list
      if (onRelationshipsUpdate) onRelationshipsUpdate();
    } catch (err) {
      logger.error("Error adding relationship", { error: err });
      setError("Failed to add relationship");
    }
  };

  const handleDeleteRelationship = async (relationshipId: number) => {
    if (
      !globalThis.confirm("Are you sure you want to delete this relationship?")
    ) {
      return;
    }

    try {
      await relationshipService.deleteRelationship(relationshipId);
      loadRelationships(); // Refresh the list
      if (onRelationshipsUpdate) onRelationshipsUpdate();
    } catch (err) {
      logger.error("Error deleting relationship", { error: err });
      setError("Failed to delete relationship");
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading relationships...</div>;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Relationships</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add Relationship Form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">
          Add New Relationship
        </h4>
        <form onSubmit={handleAddRelationship} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Related Individual ID
            </label>
            <input
              type="number"
              value={newRelationship.related_individual_id}
              onChange={(e) =>
                setNewRelationship({
                  ...newRelationship,
                  related_individual_id: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter individual ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship Type
            </label>
            <select
              value={newRelationship.relationship_type}
              onChange={(e) =>
                setNewRelationship({
                  ...newRelationship,
                  relationship_type: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="parent">Parent</option>
              <option value="child">Child</option>
              <option value="spouse">Spouse</option>
              <option value="sibling">Sibling</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Add Relationship
          </button>
        </form>
      </div>

      {/* Relationships List */}
      {relationships.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Related To
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {relationships.map((relationship) => (
                <tr key={relationship.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {relationship.individual_id === individual.id
                      ? `${relationship.related_first_name} ${relationship.related_last_name}`
                      : `${relationship.individual_first_name} ${relationship.individual_last_name}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {relationship.relationship_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteRelationship(relationship.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No relationships found.</p>
      )}
    </div>
  );
};

export default RelationshipManager;
