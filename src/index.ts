import app from './app.js';
import { connectDB } from "./config/db.config.js";
import { PORT } from "./config/dotenv.config.js";

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("❌ Server startup failed:", error);
});