import { Timestamp } from "mongodb";
import mongoose from "mongoose";

const MessageSchema= new mongoose.Schema({
    role:{
        type:String,
        enum:["user","assistant"],
        required:true
    },
    content:{
        type:String,
        required:true
    },
    Timestamp:{
        type:Date,
        default:Date.now
    }
});
const threadSchema = new mongoose.Schema({
    threadId: {
        type: String,
        required: true
    },

    title: {
        type: String
    },

    message: [
        {
            role: String,
            content: String
        }
    ],

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

export default mongoose.model("Thread",threadSchema)