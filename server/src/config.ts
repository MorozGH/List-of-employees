export const config = {
  port: Number(process.env.PORT) || 3001,
  jwtSecret: process.env.JWT_SECRET ?? "dev-only-secret-change-in-production",
  jwtExpiresIn: "7d" as const,
};