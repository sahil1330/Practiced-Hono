import mongoose from "mongoose";

export default async function dbconnect(){
    await mongoose.connect(String(process.env.MONGODB_URI));
    console.log("MongoDB connected successfully...");
}