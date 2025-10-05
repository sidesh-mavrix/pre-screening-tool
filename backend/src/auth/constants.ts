// IMPORTANT: In a real application, NEVER hardcode your JWT secret.
// Use environment variables (e.g., process.env.JWT_SECRET) and a robust
// secret management solution (e.g., AWS Secrets Manager, Google Secret Manager).

export const jwtConstants = {
  // This is a placeholder secret. CHANGE THIS FOR PRODUCTION!
  secret: 'superSecretKeyThatShouldBeStoredInEnvironmentVariablesAndBeVeryLong',
  expiresIn: '24h', // Token expires in 24 hours
};