import dotenv from 'dotenv'

dotenv.config()

const getEnvVariable = (name: string): string => {
  const value = process.env[name]

  if (!value) {
    throw new Error(
      `CRITICAL CONFIGURATION ERROR: ${name} environment variable is missing.`,
    )
  }

  return value
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DATABASE_URL: getEnvVariable('DATABASE_URL'),
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  API_URL: getEnvVariable('API_URL'),
  JWT_EXPIRES_IN: getEnvVariable('JWT_EXPIRES_IN'),
} as const