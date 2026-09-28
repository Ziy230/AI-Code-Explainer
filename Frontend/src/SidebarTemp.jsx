
import "./Sidebar.css";

import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";

function Sidebar() {
    const {
        allThreads,
        setAllThreads,
        currThreadId,
        setNewChat,
        setPrompt,
        setReply,
        setCurrThreadId,
        setPrevChats
    } = useContext(MyContext);

    // FETCH ALL CODE THREADS
    useEffect(() => {
        const getAllThreads = async () => {
            try {
                const response = await fetch(
                    "http://localhost:8080/api/code/threads",
                    {
                        credentials: "include"
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error || "Failed to fetch code threads"
                    );
                }

                setAllThreads(
                    data.threads.map(thread => ({
                        threadId: thread.threadId,
                        title: thread.title
                    }))
                );
            } catch (err) {
                console.error("Fetch threads error:", err);
            }
        };

        getAllThreads();
    }, [setAllThreads]);

    // NEW CODE: DO NOT CREATE A THREAD YET
    const createNewChat = () => {
        setCurrThreadId(null);
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setPrevChats([]);
    };

    // SELECT AN EXISTING THREAD
    const changeThread = async (threadId) => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/code/thread/${threadId}`,
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to load code thread"
                );
            }

            setCurrThreadId(threadId);
            setNewChat(false);
            setReply(null);
            setPrevChats(data.analyses || []);

            console.log("Selected code thread:", data);
        } catch (err) {
            console.error("Thread loading error:", err);
        }
    };

    // DELETE EMPTY THREAD
    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/code/thread/${threadId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Unable to delete thread");
                return;
            }

            const remainingThreads = allThreads.filter(
                thread => thread.threadId !== threadId
            );

            setAllThreads(remainingThreads);

            if (threadId === currThreadId) {
                // Return to a blank editor rather than
                // creating another empty thread.
                createNewChat();
            }

            console.log("Code thread deleted:", data);
        } catch (err) {
            console.error("Delete thread error:", err);
        }
    };

    return (
        <section className="sidebar">

            {/* NEW CODE BUTTON */}
            <button
                onClick={createNewChat}
                title="New Code"
            >
                <img
                    src="src/assets/blacklogo.png"
                    alt="AI Code Explainer logo"
                    className="logo"
                />

                <span>
                    <i className="fa-solid fa-pen-to-square"></i>
                </span>
            </button>

            {/* CODE THREADS */}
            <ul className="history">
                {allThreads.map(thread => (
                    <li
                        key={thread.threadId}
                        onClick={() =>
                            changeThread(thread.threadId)
                        }
                        className={
                            thread.threadId === currThreadId
                                ? "highlighted"
                                : ""
                        }
                    >
                        <span>{thread.title}</span>

                        <i
                            className="fa-solid fa-trash"
                            title="Delete empty thread"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteThread(thread.threadId);
                            }}
                        ></i>
                    </li>
                ))}
            </ul>

            {/* SIGNATURE */}
            <div className="sign">
                <p>By ZiyaKhurshid &hearts;</p>
            </div>

        </section>
    );
}

export default Sidebar;