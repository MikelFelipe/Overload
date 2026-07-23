"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateBody = void 0;
const validateBody = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: 'Invalid request.', fields: result.error.flatten().fieldErrors });
    }
    req.body = result.data;
    return next();
};
exports.validateBody = validateBody;
const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success)
        return res.status(400).json({ error: 'Invalid query.', fields: result.error.flatten().fieldErrors });
    req.query = result.data;
    return next();
};
exports.validateQuery = validateQuery;
