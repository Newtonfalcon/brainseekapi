import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDb = async () => {

      try {
            const con = await mongoose.connect(process.env.MONGODB_URI, {
                  useNewUrlParser: true,
                  useUnifiedTopology: true,
            });

      } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw error;
      }
}