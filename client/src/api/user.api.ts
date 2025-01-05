import axios from "axios";

export async function getUserData(userId: string) {
  return axios.get(`/api/user/getUserDataById?uuid=${userId}`);
}

export async function signIn(email: string, password: string) {
  try {
    const response = await axios.post("/api/auth/signin", { email, password });
    return response.data; // Return the user data (including userId)
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to sign in."); // Throw an error with a message
  }
}

export async function signUp(email: string, password: string, name? : string, surname?: string,) {
  try {
    const response = await axios.post("/api/auth/signup", { name, surname, email, password });
    return response.data; // Return the user data (including userId)
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to sign up."); // Throw an error with a message
  }
  
}
