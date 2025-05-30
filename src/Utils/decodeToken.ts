import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  Id: number;
  Email: string;
  exp: number;
  iat: number;
}

export const getUserInfoFromToken = (token: string): TokenPayload | null => {
  try {
    return jwtDecode<TokenPayload>(token);
  } catch (err) {
    console.error("Token decoding failed:", err);
    return null;
  }
};
