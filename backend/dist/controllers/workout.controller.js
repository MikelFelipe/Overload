"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = exports.removeSplit = exports.activateSplit = exports.updateSplit = exports.createSplit = exports.dashboard = void 0;
const workouts = __importStar(require("../services/workout.service"));
const handle = (action) => async (req, res) => {
    try {
        return res.json(await action(req));
    }
    catch (error) {
        return res.status(400).json({ error: error instanceof Error ? error.message : 'Request failed.' });
    }
};
exports.dashboard = handle((req) => workouts.listDashboard(req.userId));
exports.createSplit = handle((req) => workouts.createSplit(req.userId, req.body));
exports.updateSplit = handle((req) => workouts.updateSplit(req.userId, String(req.params.splitId), req.body));
exports.activateSplit = handle((req) => workouts.setActiveSplit(req.userId, String(req.params.splitId)));
const removeSplit = async (req, res) => { try {
    await workouts.deleteSplit(req.userId, String(req.params.splitId));
    return res.status(204).send();
}
catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Request failed.' });
} };
exports.removeSplit = removeSplit;
exports.createSession = handle((req) => workouts.createSession(req.userId, req.body));
