import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/openai.js";

const router = express.Router();

// Configuration
const MAX_MESSAGE_LENGTH = 4000;
const MAX_THREAD_ID_LENGTH = 100;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Utility: Sanitize error messages for production
const sanitizeError = (err) => {
  if (IS_PRODUCTION) {
    // Hide sensitive details in production
    return { error: "An error occurred. Please try again." };
  }
  // Show detailed errors in development
  return { error: err?.message || "An error occurred" };
};

// Optional dev-only endpoint (disabled by default)
router.post("/test", async(req, res) => {
    if(process.env.ENABLE_TEST_ENDPOINT !== "true") {
        return res.status(404).json({error: "Not found"});
    }

    try {
        const thread = new Thread({
            threadId: `test-${Date.now()}`,
            title: "Testing New Thread"
        });

        const response = await thread.save();
        return res.json(response);
    } catch(err) {
        console.error(`[ERROR] Test endpoint: ${err.message}`);
        return res.status(500).json(sanitizeError(err));
    }
});

// Get all threads
router.get("/thread", async(req, res) => {
    try {
        const threads = await Thread.find({}).sort({updatedAt: -1}).limit(100);
        // Limit to 100 most recent threads for performance
        return res.json(threads);
    } catch(err) {
        console.error(`[ERROR] Get threads: ${err.message}`);
        return res.status(500).json(sanitizeError(err));
    }
});

// Get messages in a specific thread
router.get("/thread/:threadId", async(req, res) => {
    const {threadId} = req.params;

    // Validate threadId
    if (!threadId || typeof threadId !== "string" || threadId.length > MAX_THREAD_ID_LENGTH) {
        return res.status(400).json({error: "Invalid thread ID"});
    }

    try {
        const thread = await Thread.findOne({threadId});

        if(!thread) {
            return res.status(404).json({error: "Thread not found"});
        }

        return res.json(thread.messages);
    } catch(err) {
        console.error(`[ERROR] Get thread ${threadId}: ${err.message}`);
        return res.status(500).json(sanitizeError(err));
    }
});

// Delete a thread
router.delete("/thread/:threadId", async (req, res) => {
    const {threadId} = req.params;

    // Validate threadId
    if (!threadId || typeof threadId !== "string" || threadId.length > MAX_THREAD_ID_LENGTH) {
        return res.status(400).json({error: "Invalid thread ID"});
    }

    try {
        const deletedThread = await Thread.findOneAndDelete({threadId});

        if(!deletedThread) {
            return res.status(404).json({error: "Thread not found"});
        }

        return res.status(200).json({success: "Thread deleted successfully"});

    } catch(err) {
        console.error(`[ERROR] Delete thread ${threadId}: ${err.message}`);
        return res.status(500).json(sanitizeError(err));
    }
});

// Send message and get AI response
router.post("/chat", async(req, res) => {
    const {threadId, message} = req.body;

    // Input validation
    if(!threadId || typeof threadId !== "string" || !message || typeof message !== "string") {
        return res.status(400).json({error: "Missing required fields: threadId and message"});
    }

    if (threadId.length > MAX_THREAD_ID_LENGTH) {
        return res.status(400).json({error: "Thread ID too long"});
    }

    const trimmedMessage = message.trim();
    if(!trimmedMessage) {
        return res.status(400).json({error: "Message cannot be empty"});
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
        return res.status(400).json({error: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`});
    }

    try {
        let thread = await Thread.findOne({threadId});

        if(!thread) {
            // Create a new thread
            thread = new Thread({
                threadId,
                title: trimmedMessage.substring(0, 100), // Use first 100 chars as title
                messages: [{role: "user", content: trimmedMessage}]
            });
        } else {
            // Add message to existing thread
            thread.messages.push({role: "user", content: trimmedMessage});
        }

        let assistantReply;
        try {
            assistantReply = await getOpenAIAPIResponse(thread.messages);
        } catch (err) {
            console.error(`[ERROR] OpenAI API: ${err.message}`);
            // Provide user-friendly error message
            const isQuotaError = err.message?.includes("quota") || err.message?.includes("429");
            const errorMsg = isQuotaError 
              ? "Request limit reached. Please try again later." 
              : "Failed to get AI response";
            return res.status(502).json({error: errorMsg});
        }

        // Add assistant response to thread
        thread.messages.push({role: "assistant", content: assistantReply});
        thread.updatedAt = new Date();

        await thread.save();
        return res.json({reply: assistantReply});
    } catch(err) {
        console.error(`[ERROR] Chat: ${err.message}`);
        return res.status(500).json(sanitizeError(err));
    }
});

export default router;