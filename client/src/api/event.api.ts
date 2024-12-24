import axios from "axios";

export async function getEventsByUser(creator_id: string) {
  try {
    const response = await axios.get(`/api/event/getEventsByUser?creator_id=${creator_id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to sign in.");
  }
}
