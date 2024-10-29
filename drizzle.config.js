/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./utils/schema.js",
  dialect: 'postgresql',
  dbCredentials: {
    url: "postgresql://ai-interview-mockup_owner:mvS4XwM5WVsI@ep-royal-shadow-a5marznp.us-east-2.aws.neon.tech/ai-interview-mockup?sslmode=require",
  }
};