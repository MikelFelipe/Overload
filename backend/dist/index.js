"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
const supabase_1 = require("./config/supabase");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const workout_routes_1 = __importDefault(require("./routes/workout.routes"));
// Prefer a backend-specific environment file, while supporting the repository
// root `.env` for the existing development setup.
dotenv_1.default.config({ path: (0, path_1.resolve)(process.cwd(), '.env') });
dotenv_1.default.config({ path: (0, path_1.resolve)(process.cwd(), '..', '.env') });
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Auth routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/workouts', workout_routes_1.default);
// Verify Supabase connectivity then start the server.
(0, supabase_1.initDatabase)().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Backend running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});
