// FIX: The reference to "vite/client" is removed to resolve a TypeScript error.
// Type definitions have been updated to align with @google/genai guidelines, which mandate using process.env.API_KEY.

declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
  }
}
