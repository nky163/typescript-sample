"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const env_1 = __importDefault(require("../config/env"));
const account_routes_1 = __importDefault(require("./routes/account.routes"));
const app = (0, express_1.default)();
const port = env_1.default.PORT || 3000;
// Middleware
app.use((0, body_parser_1.json)());
// Routes
app.use('/api', account_routes_1.default);
// Server start
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
