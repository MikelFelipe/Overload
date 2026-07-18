import dotenv from 'dotenv';
import { resolve } from 'path';

// Load the backend-local file first, then support the repository-root .env.
// This module is imported by every backend component that reads environment
// variables during module initialization.
dotenv.config({ path: resolve(process.cwd(), '.env') });
dotenv.config({ path: resolve(process.cwd(), '..', '.env') });
