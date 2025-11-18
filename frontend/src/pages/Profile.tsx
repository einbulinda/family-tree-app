import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import RelationshipManager from "../components/RelationshipManager";

interface Individual {
  id: number;
  user_id?: number;
  first_name: string;
  last_name: string;
  birth_date?: string;
  birth_place?: string;
  death_date?: string;
  death_place?: string;
  is_alive: boolean;
  bio?: string;
  photo_url?: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [individual, setIndividual] = useState<Individual | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Individual>>({});

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await api.get<Individual>(`/individuals/${id}`);
      setIndividual(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.API_URL}/api/individuals/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const updatedIndividual = await response.json();
        setIndividual(updatedIndividual);
        setIsEditing(false);
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!individual) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Profile not found
          </h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
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

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {individual.first_name} {individual.last_name}
                </h3>
                {individual.user_id === user?.id && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="first_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        id="first_name"
                        value={formData.first_name || ""}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="last_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        id="last_name"
                        value={formData.last_name || ""}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="birth_date"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Birth Date
                      </label>
                      <input
                        type="date"
                        name="birth_date"
                        id="birth_date"
                        value={formData.birth_date || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="birth_place"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Birth Place
                      </label>
                      <input
                        type="text"
                        name="birth_place"
                        id="birth_place"
                        value={formData.birth_place || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="death_date"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Death Date
                      </label>
                      <input
                        type="date"
                        name="death_date"
                        id="death_date"
                        value={formData.death_date || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="death_place"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Death Place
                      </label>
                      <input
                        type="text"
                        name="death_place"
                        id="death_place"
                        value={formData.death_place || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_alive"
                        checked={formData.is_alive}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            is_alive: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 block text-sm text-gray-900">
                        Is Alive
                      </span>
                    </label>
                  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Biography
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio || ""}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="photo_url"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Photo URL
                    </label>
                    <input
                      type="url"
                      name="photo_url"
                      id="photo_url"
                      value={formData.photo_url || ""}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        First Name
                      </h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {individual.first_name}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Last Name
                      </h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {individual.last_name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Birth Date
                      </h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {individual.birth_date || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Birth Place
                      </h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {individual.birth_place || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Death Date
                      </h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {individual.death_date || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Death Place
                      </h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {individual.death_place || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Status
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {individual.is_alive ? "Living" : "Deceased"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Biography
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {individual.bio || "No biography available."}
                    </p>
                  </div>

                  {individual.photo_url && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Photo
                      </h4>
                      <img
                        src={individual.photo_url}
                        alt={`${individual.first_name} ${individual.last_name}`}
                        className="mt-2 h-48 w-48 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>

                {/* Add Relationship Manager */}
                <RelationshipManager
                  individual={individual}
                  onRelationshipsUpdate={fetchProfile}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
