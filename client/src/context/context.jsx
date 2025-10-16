import { createContext, useContext, useState } from "react";
import axios from "axios";

export const AppContext = createContext();

// API Base URL - Update this based on your gateway URL
const API_BASE_URL = "http://localhost:5000"; // Change to your gateway URL
// const API_BASE_URL = "https://rapp-battle-bot-main-gateway.onrender.com"; // Change to your gateway URL

// API Routes Configuration
const API_ROUTES = {
    // Auth Service Routes
    auth: {
        register: "/api/auth/register",
        login: "/api/auth/login",
        getMe: "/api/auth/me",
    },
    // Battle Service Routes
    battles: {
        startBattle: "/api/battles/start",
        continueBattle: (id) => `/api/battles/${id}/continue`,
        endBattle: (id) => `/api/battles/${id}/end`,
        getBattles: "/api/battles",
        getBattleById: (id) => `/api/battles/${id}`,
        updateScore: (id) => `/api/battles/${id}/score`,
        deleteBattle: (id) => `/api/battles/${id}`,
        getUserStats: "/api/battles/stats/me",
    },
    // AI Service Routes
    ai: {
        generateRap: "/api/ai/generate",
        generateResponse: "/api/ai/generate-response",
        judgeRapBattle: "/api/ai/judge",
        testAI: "/api/ai/test",
    },
    // Health Check Routes
    health: {
        gateway: "/health",
        services: "/services/health",
    },
};

// Axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - clear token and redirect to login
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState("light");
    const [loading, setLoading] = useState(false);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    // Auth API Methods
    const authAPI = {
        register: async (userData) => {
            setLoading(true);
            try {
                const response = await apiClient.post(API_ROUTES.auth.register, userData);
                if (response.data.token) {
                    localStorage.setItem("token", response.data.token);
                    setUser(response.data.user);
                }
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            } finally {
                setLoading(false);
            }
        },
        login: async (credentials) => {
            setLoading(true);
            try {
                const response = await apiClient.post(API_ROUTES.auth.login, credentials);
                if (response.data.token) {
                    localStorage.setItem("token", response.data.token);
                    setUser(response.data.user);
                }
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            } finally {
                setLoading(false);
            }
        },
        getMe: async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(API_ROUTES.auth.getMe);
                setUser(response.data.user);
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            } finally {
                setLoading(false);
            }
        },
        logout: () => {
            localStorage.removeItem("token");
            setUser(null);
        },
    };

    // Battle API Methods
    const battleAPI = {
        startBattle: async (battleData) => {
            setLoading(true);
            try {
                const response = await apiClient.post(API_ROUTES.battles.startBattle, battleData);
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            } finally {
                setLoading(false);
            }
        },
        continueBattle: async (battleId, turnData) => {
            setLoading(true);
            try {
                const response = await apiClient.post(
                    API_ROUTES.battles.continueBattle(battleId),
                    turnData
                );
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            } finally {
                setLoading(false);
            }
        },
        endBattle: async (battleId) => {
            setLoading(true);
            try {
                const response = await apiClient.post(API_ROUTES.battles.endBattle(battleId));
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            } finally {
                setLoading(false);
            }
        },
        getBattles: async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(API_ROUTES.battles.getBattles);
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            } finally {
                setLoading(false);
            }
        },
        getBattleById: async (battleId) => {
            setLoading(true);
            try {
                const response = await apiClient.get(API_ROUTES.battles.getBattleById(battleId));
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            } finally {
                setLoading(false);
            }
        },
        updateScore: async (battleId, scoreData) => {
            setLoading(true);
            try {
                const response = await apiClient.put(
                    API_ROUTES.battles.updateScore(battleId),
                    scoreData
                );
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            } finally {
                setLoading(false);
            }
        },
        deleteBattle: async (battleId) => {
            setLoading(true);
            try {
                const response = await apiClient.delete(API_ROUTES.battles.deleteBattle(battleId));
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            } finally {
                setLoading(false);
            }
        },
        getUserStats: async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(API_ROUTES.battles.getUserStats);
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            } finally {
                setLoading(false);
            }
        },
    };

    // AI API Methods
    const aiAPI = {
        generateRap: async (rapData) => {
            setLoading(true);
            try {
                const response = await apiClient.post(API_ROUTES.ai.generateRap, rapData);
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            } finally {
                setLoading(false);
            }
        },
        generateResponse: async (conversationData) => {
            setLoading(true);
            try {
                const response = await apiClient.post(
                    API_ROUTES.ai.generateResponse,
                    conversationData
                );
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            } finally {
                setLoading(false);
            }
        },
        judgeRapBattle: async (battleData) => {
            setLoading(true);
            try {
                const response = await apiClient.post(API_ROUTES.ai.judgeRapBattle, battleData);
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            } finally {
                setLoading(false);
            }
        },
        testAI: async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(API_ROUTES.ai.testAI);
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            } finally {
                setLoading(false);
            }
        },
    };

    // Health Check Methods
    const healthAPI = {
        checkGateway: async () => {
            try {
                const response = await apiClient.get(API_ROUTES.health.gateway);
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            }
        },
        checkServices: async () => {
            try {
                const response = await apiClient.get(API_ROUTES.health.services);
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            }
        },
    };

    return (
        <AppContext.Provider
            value={{
                user,
                setUser,
                theme,
                toggleTheme,
                loading,
                setLoading,
                authAPI,
                battleAPI,
                aiAPI,
                healthAPI,
                API_ROUTES,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

// Custom hook for easy access
export const useAppContext = () => useContext(AppContext);
