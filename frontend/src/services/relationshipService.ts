import api from "./api";

export interface Relationship {
  id: number;
  individual_id: number;
  related_individual_id: number;
  relationship_type: string; // 'parent', 'child', 'spouse', 'sibling'
  individual_first_name: string;
  individual_last_name: string;
  related_first_name: string;
  related_last_name: string;
}

export const relationshipService = {
  // Get relationships for an individual
  getRelationships: async (individualId: number): Promise<Relationship[]> => {
    const response = await api.get<Relationship[]>(
      `/relationships/individual/${individualId}`
    );
    return response.data;
  },

  // Create a new relationship
  createRelationship: async (
    individualId: number,
    relatedIndividualId: number,
    relationshipType: string
  ): Promise<Relationship> => {
    const response = await api.post<Relationship>("/relationships", {
      individual_id: individualId,
      related_individual_id: relatedIndividualId,
      relationship_type: relationshipType,
    });
    return response.data;
  },

  // Delete a relationship
  deleteRelationship: async (relationshipId: number): Promise<void> => {
    await api.delete(`/relationships/${relationshipId}`);
  },
};
