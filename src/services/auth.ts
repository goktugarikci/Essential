// src/services/auth.ts

// Backend URL'nizi buraya girin (Geliştirme aşaması için localhost)
const API_URL = "http://localhost:8080/api/auth"; 

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Giriş başarısız oldu.");
    }

    const data = await response.json();
    
    // Backend'den dönen JWT token'ı kaydediyoruz
    if (data.token) {
      localStorage.setItem("jwt_token", data.token);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const getToken = () => localStorage.getItem("jwt_token");
export const logoutUser = () => localStorage.removeItem("jwt_token");