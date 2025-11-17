import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Invitation {
  id: number;
  email: string;
  invited_by_user_id: number;
  status: string;
  created_at: string;
  invited_by_name: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchPendingInvitations();
  }, [user, navigate]);

  const fetchPendingInvitations = async () => {
    try {
      const response = await api.get<Invitation[]>("/invitations/pending");
      setPendingInvitations(response.data);
    } catch (error) {
      console.error("Error fetching pending invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInviteEmail) return;

    setInviteLoading(true);
    try {
      await api.post("/invitations", { email: newInviteEmail });
      setNewInviteEmail("");

      // Refresh the list
      fetchPendingInvitations();
    } catch (error) {
      console.error("Error inviting user:", error);
      alert("Failed to invite user");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleApprove = async (email: string) => {
    try {
      await api.put(`/invitations/approve/${email}`);
      // Refresh the list
      fetchPendingInvitations();
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Failed to approve user");
    }
  };

  const handleReject = async (email: string) => {
    if (
      //changed from window to globalThis since window points to the window object itself ::einbulinda 14/11/2025
      !globalThis.confirm("Are you sure you want to reject this invitation?")
    ) {
      return;
    }

    try {
      await api.put(`/invitations/reject/${email}`);
      // Refresh the list
      fetchPendingInvitations();
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      alert("Failed to reject invitation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
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
                Family Tree Admin
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
          {/* Invite New Member Form */}
          <div className="mb-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Invite New Family Member
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleInvite} className="flex gap-4">
                <input
                  type="email"
                  value={newInviteEmail}
                  onChange={(e) => setNewInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {inviteLoading ? "Sending..." : "Send Invite"}
                </button>
              </form>
            </div>
          </div>

          {/* Pending Invitations */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Pending Invitations ({pendingInvitations.length})
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {pendingInvitations.length === 0 ? (
                <p className="text-gray-500">No pending invitations.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Invited By
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date Invited
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
                      {pendingInvitations.map((invitation) => (
                        <tr key={invitation.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {invitation.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {invitation.invited_by_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(
                              invitation.created_at
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleApprove(invitation.email)}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(invitation.email)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
