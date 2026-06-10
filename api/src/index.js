import "dotenv/config";
import app from "./app.js";
import connectDB from "./DB/connectDB.js";
const PORT = 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
