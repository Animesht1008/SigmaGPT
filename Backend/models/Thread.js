import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ThreadSchema = new mongoose.Schema({
    threadId: {
        type: String,
        required: true,
        unique: true,
        index: true  // Index for faster lookups
    },
    title: {
        type: String,
        default: "New Chat"
    },
    messages: [MessageSchema],
    createdAt: {
        type: Date,
        default: Date.now,
        index: true  // Index for sorting
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        index: true  // Index for sorting recent chats
    }
});

// Auto index on the collection (useful for production)
ThreadSchema.index({ updatedAt: -1 });

export default mongoose.model("Thread", ThreadSchema);