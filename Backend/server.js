import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import dns from "dns";
import chatRoutes from "./routes/chat.js";
import userRoutes from "./routes/user.js";
import codeRoutes from "./routes/code.js";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "./models/User.js";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const PORT = 8080;

app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

app.use("/api", chatRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/code", codeRoutes);

app.listen(PORT,()=>{
   console.log(`server running on ${PORT}`);
    connectDB();
})

const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected With Database");
    }catch(err){
        console.log("Failed to connect with DB",err);
    }
}

// app.post("/test", async (req, res) => {

//     const options = {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
//         },
//         body: JSON.stringify({
//             model: "openai/gpt-oss-120b",
//             messages: [
//                 {
//                     role: "user",
//                     content: req.body.message
//                 }
//             ]
//         })
//     };

//   try {

//     const response = await fetch(
//         "https://api.groq.com/openai/v1/chat/completions",
//         options
//     );

//     const data = await response.json();

//     // console.log(data.choices[0].message.content);

//     res.send(data.choices[0].message.content);

// } catch (err) {

//     console.log(err);
//     throw err;

// }
// });