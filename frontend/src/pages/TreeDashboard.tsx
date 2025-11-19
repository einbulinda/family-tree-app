import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Individual } from "../types";
import { logger } from "../utils/logger";
import api from "../services/api";
import CustomTree from "../components/CustomTree";

const TreeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [selectedIndividual, setSelectedIndividual] = useState<
    Individual | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTreeData();
  }, []);

  const loadTreeData = async () => {
    try {
      setLoading(true);

      // Fetch all individuals for the tree
      const individualsResponse = await api.get<Individual[]>(
        "/tree/individuals"
      );
      setIndividuals(individualsResponse.data);

      // Fetch all relationships for the tree
      const relationshipsResponse = await api.get<any>("/tree/relationships");
      setRelationships(relationshipsResponse.data);
    } catch (error) {
      logger.error("Error loading tree data", { error });
    } finally {
      setLoading(false);
    }
  };

  // Find the root individual (someone who is not anyone's child)
  const findRootIndividual = (): Individual | null => {
    if (individuals.length === 0) return null;

    // Find all individuals who are targets (children) in child relationships
    const childIds = new Set(
      relationships
        .filter((rel) => rel.type === "child")
        .map((rel) => rel.target)
    );

    // Find the first individual who is not a child (i.e., has no parent relationship)
    const root = individuals.find((ind) => !childIds.has(ind.id));

    // If no root found, return the first individual as fallback
    return root || individuals[0] || null;
  };

  const handleIndividualClick = (individual: Individual) => {
    setSelectedIndividual(individual);
    navigate(`/profile/${individual.id}`);
  };

  const handleAddChild = (parent: Individual) => {
    navigate("/create-profile");
    logger.info("Add child clicked", {
      parent: parent.id,
      name: `${parent.first_name} ${parent.last_name}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading family tree...</p>
        </div>
      </div>
    );
  }

  const rootIndividual = findRootIndividual();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Family Tree
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Family Tree Visualization
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Interactive view of your family connections
              </p>
            </div>

            <div className="px-4 py-5 sm:p-6">
              {individuals.length > 0 && rootIndividual ? (
                <CustomTree
                  rootIndividual={rootIndividual}
                  allIndividuals={individuals}
                  relationships={relationships}
                  selectedIndividual={selectedIndividual}
                  onIndividualClick={handleIndividualClick}
                  onAddChild={handleAddChild}
                />
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No family data available
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create some profiles and relationships to see your family
                    tree
                  </p>
                  <button
                    onClick={() => navigate("/create-profile")}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Create Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TreeDashboard;
