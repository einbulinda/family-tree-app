import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import TreeVisualization from "../components/TreeVisualization";
import { Individual, Relationship } from "../types";
import { logger } from "../utils/logger";
import api from "../services/api";

const TreeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [selectedIndividual, setSelectedIndividual] =
    useState<Individual | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTreeData();
  }, []);

  const loadTreeData = async () => {
    try {
      setLoading(true);
      /// Fetch all individuals for the tree
      const individualsResponse = await api.get("/tree/individuals");
      setIndividuals(individualsResponse.data);

      // Fetch all relationships for the tree
      const relationshipsResponse = await api.get("/tree/relationships");
      setRelationships(relationshipsResponse.data);
    } catch (error) {
      logger.error("Error loading tree data", { error });
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualClick = (individual: Individual) => {
    setSelectedIndividual(individual);
    navigate(`/profile/${individual.id}`);
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
              {individuals.length > 0 ? (
                <TreeVisualization
                  individuals={individuals}
                  relationships={relationships}
                  selectedIndividual={selectedIndividual}
                  onIndividualClick={handleIndividualClick}
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
