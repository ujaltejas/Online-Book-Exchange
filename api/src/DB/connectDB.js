import mongoose from "mongoose";

const connectDB = async () => {
  const uri =
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/book-exchange";

  try {
    const res = await mongoose.connect(uri);
    console.log(`Connected to MongoDB: ${res.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
