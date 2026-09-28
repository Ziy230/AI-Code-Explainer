import "./App.css";

import Sidebar from "./SidebarTemp.jsx";
import CodeExplainer from "./CodeExplainer.jsx";

import { MyContext } from "./MyContext.jsx";

import {
    useState,
    useEffect,
    useRef
} from "react";

import Signup from "./Signup.jsx";
import Login from "./Login.jsx";

import API_URL from "./api.js";

function App() {
    const threadInitializationStarted =
        useRef(false);

    const [isLoggedIn, setIsLoggedIn] =
        useState(false);

    const [checkingSession, setCheckingSession] =
        useState(true);

    const [prompt, setPrompt] =
        useState("");

    const [reply, setReply] =
        useState(null);

    const [currThreadId, setCurrThreadId] =
        useState(null);

    const [prevChats, setPrevChats] =
        useState([]);

    const [newChat, setNewChat] =
        useState(true);

    const [allThreads, setAllThreads] =
        useState([]);

    const [showSignup, setShowSignup] =
        useState(false);

    const [theme, setTheme] =
        useState("dark");

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/auth/protected`,
                    {
                        credentials: "include"
                    }
                );

                if (response.ok) {
                    setIsLoggedIn(true);
                }
            } catch (err) {
                console.log(
                    "Session check error:",
                    err
                );
            } finally {
                setCheckingSession(false);
            }
        };

        checkSession();
    }, []);

    useEffect(() => {
        if (!isLoggedIn) {
            return;
        }

        if (
            threadInitializationStarted.current
        ) {
            return;
        }

        threadInitializationStarted.current =
            true;

        const loadCodeThreads = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/code/threads`,
                    {
                        credentials: "include"
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "Failed to fetch code threads"
                    );
                }

                const threads =
                    data.threads || [];

                console.log(
                    "Existing code threads:",
                    threads
                );

                if (threads.length > 0) {
                    setCurrThreadId(
                        threads[0].threadId
                    );

                    setAllThreads(
                        threads.map(thread => ({
                            threadId:
                                thread.threadId,
                            title:
                                thread.title
                        }))
                    );

                    return;
                }

                const createResponse =
                    await fetch(
                        `${API_URL}/api/code/thread`,
                        {
                            method: "POST",
                            credentials: "include",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );

                const createData =
                    await createResponse.json();

                if (!createResponse.ok) {
                    throw new Error(
                        createData.error ||
                        "Failed to create thread"
                    );
                }

                console.log(
                    "First code thread created:",
                    createData
                );

                setCurrThreadId(
                    createData.threadId
                );

                setAllThreads([
                    {
                        threadId:
                            createData.threadId,
                        title:
                            createData.title
                    }
                ]);
            } catch (err) {
                console.log(
                    "Code thread loading error:",
                    err
                );
            }
        };

        loadCodeThreads();
    }, [isLoggedIn]);

    const providerValues = {
        prompt,
        setPrompt,
        reply,
        setReply,
        currThreadId,
        setCurrThreadId,
        newChat,
        setNewChat,
        prevChats,
        setPrevChats,
        allThreads,
        setAllThreads,
        theme,
        setTheme
    };

    if (checkingSession) {
        return null;
    }

    if (!isLoggedIn) {
        if (showSignup) {
            return (
                <Signup
                    onSignupSuccess={() =>
                        setShowSignup(false)
                    }
                    onGoToLogin={() =>
                        setShowSignup(false)
                    }
                />
            );
        }

        return (
            <Login
                onLogin={() =>
                    setIsLoggedIn(true)
                }
                onGoToSignup={() =>
                    setShowSignup(true)
                }
            />
        );
    }

    return (
        <div
            className={`app ${theme}`}
        >
            <MyContext.Provider
                value={providerValues}
            >
                <Sidebar />
                <CodeExplainer />
            </MyContext.Provider>
        </div>
    );
}

export default App;