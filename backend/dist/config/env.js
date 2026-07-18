"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
// Load the backend-local file first, then support the repository-root .env.
// This module is imported by every backend component that reads environment
// variables during module initialization.
dotenv_1.default.config({ path: (0, path_1.resolve)(process.cwd(), '.env') });
dotenv_1.default.config({ path: (0, path_1.resolve)(process.cwd(), '..', '.env') });
