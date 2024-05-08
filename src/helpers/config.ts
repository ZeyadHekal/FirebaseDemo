require("dotenv").config();
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "";
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "";
export const SESSION_SECRET = process.env.REFRESH_TOKEN_SECRET || "";
export const SESSION_AGE_IN_MINUTES = Number(process.env.SESSION_AGE_IN_MINUTES) || 30;
export const EXPRESS_SERVER_PORT = Number(process.env.EXPRESS_SERVER_PORT) || 4000;