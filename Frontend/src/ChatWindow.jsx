import "./ChatWindow.css";

import Chat from "./Chat.jsx";

import { MyContext } from "./MyContext.jsx";

import {
    useContext,
    useState,
    useEffect
} from "react";

import { ScaleLoader } from "react-spinners";

import API_URL from "./api.js";

function ChatWindow({ onLogout }) {

    const {
        prompt,
        setPrompt,
        setReply,
        currThreadId,
        setPrevChats,
        setNewChat,
        theme,
        setTheme
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);

    // Human icon dropdown
    const [isProfileOpen, setIsProfileOpen] =
        useState(false);

    // SigmaGPT dropdown
    const [isSigmaOpen, setIsSigmaOpen] =
        useState(false);

    const [isSettingsOpen, setIsSettingsOpen] =
        useState(false);


    const getReply = async () => {

        if (!prompt.trim()) {
            return;
        }

        setLoading(true);
        setNewChat(false);

        console.log(
            "message",
            prompt,
            "threadId",
            currThreadId
        );

        const options = {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: prompt,
                threadId: currThreadId
            })
        };

        try {

            const response = await fetch(
                `${API_URL}/api/chat`,
                options
            );

            const res =
                await response.json();

            console.log(res);

            if (response.ok) {
                setReply(res.reply);
            } else {
                console.log(
                    "Chat error:",
                    res
                );
            }

        } catch (err) {

            console.log(err);

        }

        setLoading(false);
    };


    // Add new messages to previous chats
    useEffect(() => {

        // This effect is intentionally kept
        // for the existing chat functionality.

    }, [setPrevChats]);


    // Human profile menu
    const handleProfileClick = () => {

        setIsProfileOpen(
            !isProfileOpen
        );

        setIsSigmaOpen(false);
    };


    // SigmaGPT menu
    const handleSigmaClick = () => {

        setIsSigmaOpen(
            !isSigmaOpen
        );

        setIsProfileOpen(false);
    };


    return (

        <div className="chatWindow">

            {/* NAVBAR */}

            <div className="navbar">

                {/* SIGMAGPT */}

                <div
                    className="sigmaTitle"
                    onClick={handleSigmaClick}
                >

                    <span>
                        AI Code Explainer
                    </span>

                    <i className="fa-solid fa-chevron-down"></i>


                    {/* SIGMAGPT DROPDOWN */}

                    {isSigmaOpen && (

                        <div className="sigmaDropDown">

                            <div className="sigmaDropDownTitle">
                                AI Code Explainer
                            </div>

                            <div
                                className="sigmaDropDownItem"
                                onClick={() => {

                                    setNewChat(true);
                                    setPrevChats([]);
                                    setReply(null);
                                    setPrompt("");
                                    setIsSigmaOpen(false);

                                }}
                            >

                                <i className="fa-solid fa-plus"></i>

                                New Chat

                            </div>

                            <div className="sigmaDropDownItem">

                                <i className="fa-solid fa-circle-question"></i>

                                Help

                            </div>

                        </div>

                    )}

                </div>


                {/* HUMAN PROFILE ICON */}

                <div
                    className="userIconDiv"
                    onClick={handleProfileClick}
                >

                    <span className="userIcon">

                        <i className="fa-solid fa-user"></i>

                    </span>

                </div>

            </div>


            {/* PROFILE DROPDOWN */}

            {isProfileOpen && (

                <div className="dropDown">

                    <div
                        className="dropDownItem"
                        onClick={() => {

                            setIsSettingsOpen(true);
                            setIsProfileOpen(false);
                            setIsSigmaOpen(false);

                        }}
                    >

                        <i className="fa-solid fa-gear"></i>

                        Settings

                    </div>


                    <div className="dropDownItem">

                        <i className="fa-solid fa-cloud-arrow-up"></i>

                        Upgrade plan

                    </div>


                    <div
                        className="dropDownItem"
                        onClick={onLogout}
                    >

                        <i className="fa-solid fa-arrow-right-from-bracket"></i>

                        Log out

                    </div>

                </div>

            )}


            {/* SETTINGS PANEL */}

            {isSettingsOpen && (

                <div className="settingsPanel">

                    <div className="settingsHeader">

                        <h2>
                            Settings
                        </h2>

                        <button
                            onClick={() =>
                                setIsSettingsOpen(false)
                            }
                        >

                            <i className="fa-solid fa-xmark"></i>

                        </button>

                    </div>


                    <div className="settingsContent">

                        <div
                            className="settingsItem"
                            onClick={() => {

                                setTheme(
                                    theme === "dark"
                                        ? "light"
                                        : "dark"
                                );

                            }}
                            style={{
                                cursor: "pointer"
                            }}
                        >

                            <span>
                                Appearance
                            </span>

                            <span className="settingsValue">

                                {theme === "dark"
                                    ? "Dark"
                                    : "Light"}

                            </span>

                        </div>


                        <div className="settingsItem">

                            <span>
                                Language
                            </span>

                            <span className="settingsValue">
                                English
                            </span>

                        </div>


                        <div className="settingsItem">

                            <span>
                                Chat preferences
                            </span>

                            <span className="settingsValue">
                                Default
                            </span>

                        </div>

                    </div>

                </div>

            )}


            {/* CHAT */}

            <Chat />


            {/* LOADING */}

            <ScaleLoader
                color="#ffff"
                loading={loading}
            />


            {/* CHAT INPUT */}

            <div className="chatInput">

                <div className="inputBox">

                    <input
                        placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) =>
                            setPrompt(
                                e.target.value
                            )
                        }
                        onKeyDown={(e) => {

                            if (e.key === "Enter") {
                                getReply();
                            }

                        }}
                    />


                    <div
                        id="submit"
                        onClick={getReply}
                    >

                        <i className="fa-solid fa-paper-plane"></i>

                    </div>

                </div>


                <p className="info">

                    SigmaGPT can make mistakes.
                    Check important info.
                    See Cookie Preferences.

                </p>

            </div>

        </div>

    );
}

export default ChatWindow;