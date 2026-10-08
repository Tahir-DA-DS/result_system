// Where the backend lives. Set VITE_API_URL in Vercel (or in a local .env file).
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
