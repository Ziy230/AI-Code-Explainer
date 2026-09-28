import mongoose from "mongoose";

const { Schema } = mongoose;

const codeAnalysisSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        threadId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },

        language: {
            type: String,
            required: true
        },

        code: {
            type: String,
            required: true
        },

        codeType: {
            type: String,
            required: true
        },

        overview: {
            type: String,
            required: true
        },

        howItWorks: {
            type: [String],
            default: []
        },

        algorithm: {
            type: String,
            default: ""
        },

        timeComplexity: {
            type: String,
            default: ""
        },

        spaceComplexity: {
            type: String,
            default: ""
        },

        issues: {
            type: [String],
            default: []
        },

        suggestions: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const CodeAnalysis = mongoose.model(
    "CodeAnalysis",
    codeAnalysisSchema
);

export default CodeAnalysis;