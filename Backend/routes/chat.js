import express from "express";
import Thread from "../models/Thread.js";
import getGroqAIAPIResponse from "../utils/groq.js";
import isLoggedIn from "../middleware/auth.js";

const router = express.Router();
// Get all threads
router.get("/thread", isLoggedIn, async (req, res) => {

    try {

        const threads = await Thread.find({
            user: req.user._id
        }).sort({ updatedAt: -1 });

        res.json(threads);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Failed to fetch threads"
        });

    }

});
router.get("/thread/:threadId", isLoggedIn, async (req, res) => {

    const {threadId} = req.params;

    try {

        const thread = await Thread.findOne({
            threadId,
            user: req.user._id
        });

        if(!thread) {

            return res.status(404).json({error: "Thread not found"});

        }

        res.json(thread.message);

    } catch(err) {

        console.log(err);

        res.status(500).json({error: "Failed to fetch chat"});

    }

});

router.delete("/thread/:threadId", async (req, res) => {

    const {threadId} = req.params;

    try {

        const deletedThread = await Thread.findOneAndDelete({threadId});

        if(!deletedThread) {

            return res.status(404).json({error: "Thread not found"});

        }

        res.status(200).json({success : "Thread deleted successfully"});

    } catch(err) {

        console.log(err);

        res.status(500).json({error: "Failed to delete thread"});

    }

});

router.post("/chat", isLoggedIn, async (req, res) => {

    const {threadId, message} = req.body;

    if(!threadId || !message) {

        return res.status(400).json({error: "missing required fields"});

    }

    try {

        let thread = await Thread.findOne({
            threadId,
            user: req.user._id
        });

        if(!thread) {

            //create a new thread in Db

            thread = new Thread({
                threadId,
                title: message,
                message: [{role: "user", content: message}],
                user: req.user._id
            });

        } else {

            thread.message.push({role: "user", content: message});

        }

        const assistantReply = await getGroqAIAPIResponse(message);

        thread.message.push({role: "assistant", content: assistantReply});

        thread.updatedAt = new Date();

        await thread.save();

        res.json({reply: assistantReply});

    } catch(err) {

        console.log(err);

        res.status(500).json({error: "something went wrong"});

    }

});

export default router;