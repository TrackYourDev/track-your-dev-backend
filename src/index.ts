import app from './app';
import { connectDB } from "./config/db.config";
import { PORT } from "./config/dotenv.config";
import { startScheduler } from './scheduler';

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        startScheduler();
    });
}).catch((error) => {
    console.error("❌ Server startup failed:", error);
});