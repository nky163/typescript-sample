"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const account_routes_1 = __importDefault(require("./infrastructure/web/routes/account.routes"));
const env_1 = __importDefault(require("./infrastructure/config/env"));
const app = (0, express_1.default)();
const PORT = env_1.default.PORT || 3000;
app.use(express_1.default.json());
app.use('/api', account_routes_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
