"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const webhook_routes_1 = __importDefault(require("./routes/webhook.routes"));
const waitlist_routes_1 = __importDefault(require("./routes/waitlist.routes"));
const userInfo_routes_1 = __importDefault(require("./routes/userInfo.routes"));
const github_route_1 = __importDefault(require("./routes/github.route"));
const dates_routes_1 = __importDefault(require("./routes/dates.routes"));
const repository_routes_1 = __importDefault(require("./routes/repository.routes"));
const tasks_routes_1 = __importDefault(require("./routes/tasks.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    credentials: true,
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://trackyour.dev', 'https://beta.trackyour.dev']
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api', webhook_routes_1.default);
app.use('/api', waitlist_routes_1.default);
app.use('/api', userInfo_routes_1.default);
app.use('/api', github_route_1.default);
app.use('/api', dates_routes_1.default);
app.use('/api', repository_routes_1.default);
app.use('/api/tasks', tasks_routes_1.default);
exports.default = app;
