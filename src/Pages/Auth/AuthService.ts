import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "../../API/apiConfig";
import { jwtDecode } from "jwt-decode";

export interface AuthResponse {
  message: string;
  token: string;
  isSuccess: boolean;  // <-- lowercase i
}


interface DecodedToken {
  email?: string;
  userName?: string;
  [key: string]: unknown;
}

interface UserData {
  roleId: number | undefined;
  profilePicture: string;
  email: string;
  userName: string;
  token: string;
  authProvider: string;
}

export const login = async (email: string, password: string): Promise<UserData> => {
  try {
       delete axios.defaults.headers.common['Authorization'];

    const response = await axios.post(API_ENDPOINTS.Login, { email, password });
    console.log("Login API raw response:", response.data);

    const data = response.data;

    if (data.isSuccess && data.token) {
      const decodedToken = jwtDecode<DecodedToken>(data.token);

      const userData: UserData = {
        email: decodedToken.email || email,
        userName: decodedToken.userName || email.split("@")[0],
        token: data.token,
        authProvider: "Email",
        roleId: data.roleId, 
        profilePicture: ""
      };

      sessionStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.setItem("token", data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      return userData;
    } else {
      throw new Error(data.message || "Login failed");
    }
  } catch (error: any) {
    console.error("Login error:", error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        (axiosError.response?.status === 401
          ? "Invalid credentials"
          : "Login failed");
      throw new Error(errorMessage);
    } else {
      throw new Error("Something went wrong. Please try again later.");
    }
  }
};


export const getCurrentUser = (): UserData | null => {
  const user = sessionStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = (): boolean => {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded: { exp: number } = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();  
  } catch {
    return false;
  }
};

export const logout = (): void => {
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("token");
  delete axios.defaults.headers.common['Authorization'];
};

export const getAuthProvider = (): string | null => {
  const user = getCurrentUser();
  return user ? user.authProvider : null;
};

export const getUserEmail = (): string | null => {
  const user = getCurrentUser();
  return user ? user.email : null;
};

export const getUserName = (): string | null => {
  const user = getCurrentUser();
  return user ? user.userName : null;
};

