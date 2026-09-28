import express from "express";
import crypto from "crypto";

import getGroqAIAPIResponse from "../utils/groq.js";
import isLoggedIn from "../middleware/auth.js";
import CodeAnalysis from "../models/CodeAnalysis.js";
import Thread from "../models/Thread.js";


const router = express.Router();


// ======================================================
// GET ALL CODE THREADS
// ======================================================

router.get(
    "/threads",
    isLoggedIn,
    async (req, res) => {

        try {

            // Find analyses belonging to
            // the logged-in user

            const analyses =
                await CodeAnalysis.find({
                    user: req.user._id
                })
                .select("threadId");


            const codeThreadIds =
                analyses.map(
                    analysis =>
                        analysis.threadId
                );


            // Get only Code Explainer threads

            const threads =
                await Thread.find({

                    user: req.user._id,

                    $or: [

                        {
                            threadId: {
                                $in: codeThreadIds
                            }
                        },

                        {
                            title:
                                "New Code Analysis"
                        }

                    ]

                })
                .sort({
                    updatedAt: -1
                });


            res.json({
                threads
            });


        } catch (err) {

            console.log(
                "Failed to fetch code threads:",
                err
            );


            res.status(500).json({
                error:
                    "Failed to fetch code threads"
            });

        }

    }
);


// ======================================================
// GET ONE CODE THREAD + ITS ANALYSES
// ======================================================

router.get(
    "/thread/:threadId",
    isLoggedIn,
    async (req, res) => {

        try {

            const {
                threadId
            } = req.params;


            // Make sure the thread belongs
            // to the logged-in user

            const thread =
                await Thread.findOne({

                    threadId:
                        threadId,

                    user:
                        req.user._id

                });


            if (!thread) {

                return res.status(404).json({
                    error:
                        "Thread not found"
                });

            }


            // Get all analyses belonging
            // to this thread

            const analyses =
                await CodeAnalysis.find({

                    threadId:
                        threadId,

                    user:
                        req.user._id

                })
                .sort({
                    createdAt: 1
                });


            res.json({

                thread:
                    thread,

                analyses:
                    analyses

            });


        } catch (err) {

            console.log(
                "Failed to fetch code thread:",
                err
            );


            res.status(500).json({
                error:
                    "Failed to fetch code thread"
            });

        }

    }
);


// ======================================================
// CREATE NEW CODE THREAD
// ======================================================

router.post(
    "/thread",
    isLoggedIn,
    async (req, res) => {

        try {

            const threadId =
                crypto.randomUUID();


            const newThread =
                new Thread({

                    threadId:
                        threadId,

                    user:
                        req.user._id,

                    title:
                        "New Code Analysis",

                    message:
                        []

                });


            await newThread.save();


            console.log(
                "Code thread created:",
                threadId
            );


            res.status(201).json({

                threadId:
                    threadId,

                title:
                    newThread.title

            });


        } catch (err) {

            console.log(
                "Failed to create code thread:",
                err
            );


            res.status(500).json({
                error:
                    "Failed to create code thread"
            });

        }

    }
);


// ======================================================
// DELETE EMPTY CODE THREAD
// ======================================================

router.delete(
    "/thread/:threadId",
    isLoggedIn,
    async (req, res) => {

        try {

            const {
                threadId
            } = req.params;


            // Check whether this thread
            // contains any code analyses

            await CodeAnalysis.deleteMany({
                threadId: threadId,
                user: req.user._id
            });


            const deletedThread =
                await Thread.findOneAndDelete({

                    threadId:
                        threadId,

                    user:
                        req.user._id

                });


            if (!deletedThread) {

                return res.status(404).json({

                    error:
                        "Thread not found"

                });

            }


            res.json({

                message:
                    "Empty code thread deleted"

            });


        } catch (err) {

            console.log(
                "Failed to delete code thread:",
                err
            );


            res.status(500).json({

                error:
                    "Failed to delete code thread"

            });

        }

    }
);


// ======================================================
// GET CODE ANALYSIS HISTORY
// ======================================================

router.get(
    "/history",
    isLoggedIn,
    async (req, res) => {

        try {

            const analyses =
                await CodeAnalysis.find({

                    user:
                        req.user._id

                })
                .sort({
                    createdAt: -1
                });


            res.json({
                analyses
            });


        } catch (err) {

            console.log(
                "Failed to fetch code history:",
                err
            );


            res.status(500).json({

                error:
                    "Failed to fetch code history"

            });

        }

    }
);


// ======================================================
// EXPLAIN CODE
// ======================================================

router.post(
    "/explain",
    isLoggedIn,
    async (req, res) => {

        const {
            threadId,
            language,
            code
        } = req.body;


        // Validate input

        if (
            !threadId ||
            !language ||
            !code ||
            !code.trim()
        ) {

            return res.status(400).json({

                error:
                    "Thread ID, language and code are required"

            });

        }


        try {

            // ------------------------------------------
            // VERIFY THREAD OWNERSHIP
            // ------------------------------------------

            const thread =
                await Thread.findOne({

                    threadId:
                        threadId,

                    user:
                        req.user._id

                });


            if (!thread) {

                return res.status(404).json({

                    error:
                        "Thread not found"

                });

            }


            // ------------------------------------------
            // AI PROMPT
            // ------------------------------------------

            const prompt = `

You are an expert AI Code Explainer.

Analyze the following ${language} code.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.
Do not add any text before or after the JSON.

The JSON must follow this exact structure:

{{
    "title": "A short 2-5 word title describing the code",
    "codeType": "The type of code provided",
    "overview": "A simple explanation of what the code does",
    "howItWorks": [
        "Step 1",
        "Step 2",
        "Step 3"
    ],
    "algorithm": "Name or description of the algorithm or approach used",
    "timeComplexity": "Time complexity with a short reason",
    "spaceComplexity": "Space complexity with a short reason",
    "issues": [
        "Potential issue 1"
    ],
    "suggestions": [
        "Improvement suggestion 1"
    ]
}

Rules:

1. Identify the type of code accurately.
2. Explain the code accurately.
3. Use simple and clear language.
4. If there is no obvious issue, return an empty array for "issues".
5. If there is no useful optimization, return an empty array for "suggestions".
6. Do not invent problems that do not exist.
7. Give the most appropriate time and space complexity.
8. Return valid JSON only.
9. Do not include markdown.
10. Do not include explanations outside the JSON.

Programming Language:
${language}

Code:
${code}

`;


            // ------------------------------------------
            // GET AI RESPONSE
            // ------------------------------------------

            const aiResponse =
                await getGroqAIAPIResponse(
                    prompt
                );


            console.log(
                "Raw Groq response:"
            );

            console.log(
                aiResponse
            );


            // ------------------------------------------
            // PARSE AI JSON
            // ------------------------------------------

            let analysis;


            try {

                analysis =
                    JSON.parse(
                        aiResponse
                    );

            } catch (parseError) {

                console.log(
                    "JSON parsing failed:",
                    parseError
                );


                return res.status(500).json({

                    error:
                        "AI returned an invalid JSON response",

                    rawResponse:
                        aiResponse

                });

            }


            // ------------------------------------------
            // SAVE CODE ANALYSIS
            // ------------------------------------------

            const savedAnalysis =
                new CodeAnalysis({

                    user:
                        req.user._id,

                    threadId:
                        threadId,

                    title:
                         analysis.title,

                    language:
                        language,

                    code:
                        code,

                    codeType:
                        analysis.codeType,

                    overview:
                        analysis.overview,

                    howItWorks:
                        analysis.howItWorks,

                    algorithm:
                        analysis.algorithm,

                    timeComplexity:
                        analysis.timeComplexity,

                    spaceComplexity:
                        analysis.spaceComplexity,

                    issues:
                        analysis.issues,

                    suggestions:
                        analysis.suggestions

                });


            await savedAnalysis.save();


            // ------------------------------------------
            // UPDATE THREAD TITLE
            // ------------------------------------------

            if (
                !thread.message ||
                thread.message.length === 0
            ) {

                thread.title =
                    analysis.title ||
                    "Code Analysis";

            }


            // ------------------------------------------
            // SAVE CODE TO THREAD
            // ------------------------------------------

            if (!thread.message) {

                thread.message = [];

            }


            thread.message.push({

                role:
                    "user",

                content:
                    code

            });


            // ------------------------------------------
            // SAVE AI RESPONSE TO THREAD
            // ------------------------------------------

            thread.message.push({

                role:
                    "assistant",

                content:
                    analysis.overview

            });


            thread.updatedAt =
                new Date();


            await thread.save();


            console.log(
                "Code analysis saved:",
                savedAnalysis._id
            );


            // ------------------------------------------
            // RESPONSE
            // ------------------------------------------

            res.json({

                language:
                    language,

                threadId:
                    threadId,

                analysis:
                    analysis,

                analysisId:
                    savedAnalysis._id

            });


        } catch (err) {

            console.log(
                "Code explanation error:",
                err
            );


            res.status(500).json({

                error:
                    "Failed to explain code"

            });

        }

    }
);


export default router;