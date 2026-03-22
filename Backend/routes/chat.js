import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/openai.js";

const router = express.Router();

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
        return res.send(response);
    } catch(err) {
        console.log(err);
        return res.status(500).json({error: "Failed to save in DB"});
    }
});

//Get all threads
router.get("/thread", async(req, res) => {
    try {
        const threads = await Thread.find({}).sort({updatedAt: -1});
        //descending order of updatedAt...most recent data on top
        return res.json(threads);
    } catch(err) {
        console.log(err);
        return res.status(500).json({error: "Failed to fetch threads", details: err?.message ?? String(err)});
    }
});

router.get("/thread/:threadId", async(req, res) => {
    const {threadId} = req.params;

    try {
        const thread = await Thread.findOne({threadId});

        if(!thread) {
            return res.status(404).json({error: "Thread not found"});
        }

        return res.json(thread.messages);
    } catch(err) {
        console.log(err);
        return res.status(500).json({error: "Failed to fetch chat", details: err?.message ?? String(err)});
    }
});

router.delete("/thread/:threadId", async (req, res) => {
    const {threadId} = req.params;

    try {
        const deletedThread = await Thread.findOneAndDelete({threadId});

        if(!deletedThread) {
            return res.status(404).json({error: "Thread not found"});
        }

        return res.status(200).json({success : "Thread deleted successfully"});

    } catch(err) {
        console.log(err);
        return res.status(500).json({error: "Failed to delete thread", details: err?.message ?? String(err)});
    }
});

router.post("/chat", async(req, res) => {
    const {threadId, message} = req.body;

    if(!threadId || typeof threadId !== "string" || !message || typeof message !== "string") {
        return res.status(400).json({error: "missing required fields"});
    }

    const trimmedMessage = message.trim();
    if(!trimmedMessage) {
        return res.status(400).json({error: "message cannot be empty"});
    }

    try {
        let thread = await Thread.findOne({threadId});

        if(!thread) {
            //create a new thread in Db
            thread = new Thread({
                threadId,
                title: trimmedMessage,
                messages: [{role: "user", content: trimmedMessage}]
            });
        } else {
            thread.messages.push({role: "user", content: trimmedMessage});
        }

        let assistantReply;
        try {
            assistantReply = await getOpenAIAPIResponse(trimmedMessage);
        } catch (err) {
            console.log(err);
            return res.status(502).json({error: "AI provider error"});
        }

        thread.messages.push({role: "assistant", content: assistantReply});
        thread.updatedAt = new Date();

        await thread.save();
        return res.json({reply: assistantReply});
    } catch(err) {
        console.log(err);
        return res.status(500).json({error: "something went wrong", details: err?.message ?? String(err)});
    }
});




export default router;