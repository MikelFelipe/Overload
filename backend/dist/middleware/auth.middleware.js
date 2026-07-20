"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const supabase_1 = require("../config/supabase");
const authenticate = async (req, res, next) => {
    const authorization = req.header('authorization');
    const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    const token = bearerToken || req.cookies?.session;
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    const { data, error } = await (0, supabase_1.getSupabase)().auth.getUser(token);
    if (error || !data.user)
        return res.status(401).json({ error: 'Unauthorized' });
    req.userId = data.user.id;
    req.user = data.user;
    return next();
};
exports.authenticate = authenticate;
