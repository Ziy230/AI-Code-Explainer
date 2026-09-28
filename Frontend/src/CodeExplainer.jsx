import {
    useContext,
    useEffect,
    useRef,
    useState
} from "react";

import "./CodeExplainer.css";
import { MyContext } from "./MyContext.jsx";

function CodeExplainer() {
    const {
        currThreadId,
        setCurrThreadId,
        setAllThreads,
        prevChats,
        setPrevChats
    } = useContext(MyContext);

    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("Python");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [selectedAnalysisId, setSelectedAnalysisId] =
        useState(null);

    const [selectedAnalysisTitle, setSelectedAnalysisTitle] =
        useState("");

    const submittingRef = useRef(false);

    // Used to automatically scroll to the analysis
    const resultRef = useRef(null);


    // AUTO SCROLL TO SELECTED ANALYSIS
    useEffect(() => {
        if (!selectedAnalysisId) {
            return;
        }

        if (!resultRef.current) {
            return;
        }

        resultRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, [selectedAnalysisId]);


    // LOAD SELECTED THREAD
    useEffect(() => {

        if (!currThreadId) {

            setCode("");
            setLanguage("Python");
            setResult(null);
            setError("");
            setSelectedAnalysisId(null);
            setSelectedAnalysisTitle("");

            return;
        }


        if (
            !prevChats ||
            prevChats.length === 0
        ) {

            setCode("");
            setResult(null);
            setError("");
            setSelectedAnalysisId(null);
            setSelectedAnalysisTitle("");

            return;
        }


        const latest =
            prevChats[
                prevChats.length - 1
            ];


        setCode(
            latest.code || ""
        );


        setLanguage(
            latest.language ||
            "Python"
        );


        setSelectedAnalysisId(
            latest._id
        );


        setSelectedAnalysisTitle(
            latest.title ||
            latest.codeType ||
            "Code Analysis"
        );


        setResult({

            language:
                latest.language,

            threadId:
                latest.threadId,

            analysisId:
                latest._id,

            analysis: {

                title:
                    latest.title ||
                    latest.codeType,

                codeType:
                    latest.codeType,

                overview:
                    latest.overview,

                howItWorks:
                    latest.howItWorks || [],

                algorithm:
                    latest.algorithm,

                timeComplexity:
                    latest.timeComplexity,

                spaceComplexity:
                    latest.spaceComplexity,

                issues:
                    latest.issues || [],

                suggestions:
                    latest.suggestions || []

            }

        });


        setError("");

    }, [
        currThreadId,
        prevChats
    ]);


    // EXPLAIN CODE
    const handleExplain = async () => {

        if (submittingRef.current) {
            return;
        }


        if (!code.trim()) {

            setError(
                "Please enter some code first."
            );

            return;
        }


        submittingRef.current = true;

        setLoading(true);
        setError("");


        let activeThreadId =
            currThreadId;


        try {

            // CREATE THREAD ONLY WHEN NEEDED
            if (!activeThreadId) {

                const threadResponse =
                    await fetch(
                        "http://localhost:8080/api/code/thread",
                        {
                            method: "POST",
                            credentials: "include",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );


                const threadData =
                    await threadResponse.json();


                if (!threadResponse.ok) {

                    throw new Error(
                        threadData.error ||
                        "Failed to create code thread"
                    );
                }


                activeThreadId =
                    threadData.threadId;


                setCurrThreadId(
                    activeThreadId
                );


                setAllThreads(prev => [

                    {
                        threadId:
                            threadData.threadId,

                        title:
                            threadData.title
                    },

                    ...prev.filter(
                        thread =>
                            thread.threadId !==
                            threadData.threadId
                    )

                ]);


                console.log(
                    "Code thread created:",
                    threadData
                );
            }


            // REQUEST AI ANALYSIS
            const response =
                await fetch(
                    "http://localhost:8080/api/code/explain",
                    {
                        method: "POST",

                        credentials:
                            "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            threadId:
                                activeThreadId,

                            language:
                                language,

                            code:
                                code

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to explain code"
                );
            }


            setResult(data);


            setSelectedAnalysisId(
                data.analysisId
            );


            setSelectedAnalysisTitle(
                data.analysis?.title ||
                data.analysis?.codeType ||
                "Code Analysis"
            );


            console.log(
                "Code explanation:",
                data
            );


            // LOAD ALL ANALYSES
            const analysesResponse =
                await fetch(
                    `http://localhost:8080/api/code/thread/${activeThreadId}`,
                    {
                        credentials:
                            "include"
                    }
                );


            if (analysesResponse.ok) {

                const analysesData =
                    await analysesResponse.json();


                setPrevChats(
                    analysesData.analyses ||
                    []
                );

            }


            // REFRESH SIDEBAR
            const threadsResponse =
                await fetch(
                    "http://localhost:8080/api/code/threads",
                    {
                        credentials:
                            "include"
                    }
                );


            if (threadsResponse.ok) {

                const threadsData =
                    await threadsResponse.json();


                setAllThreads(
                    threadsData.threads.map(
                        thread => ({

                            threadId:
                                thread.threadId,

                            title:
                                thread.title

                        })
                    )
                );

            }


        } catch (err) {

            console.error(
                "Code explanation error:",
                err
            );


            setError(
                err.message
            );


        } finally {

            submittingRef.current =
                false;

            setLoading(false);

        }

    };


    // OPEN PREVIOUS ANALYSIS
    const openPreviousAnalysis =
        (analysis) => {

            setCode(
                analysis.code || ""
            );


            setLanguage(
                analysis.language ||
                "Python"
            );


            setSelectedAnalysisId(
                analysis._id
            );


            setSelectedAnalysisTitle(
                analysis.title ||
                analysis.codeType ||
                "Code Analysis"
            );


            setResult({

                language:
                    analysis.language,

                threadId:
                    analysis.threadId,

                analysisId:
                    analysis._id,

                analysis: {

                    title:
                        analysis.title ||
                        analysis.codeType,

                    codeType:
                        analysis.codeType,

                    overview:
                        analysis.overview,

                    howItWorks:
                        analysis.howItWorks || [],

                    algorithm:
                        analysis.algorithm,

                    timeComplexity:
                        analysis.timeComplexity,

                    spaceComplexity:
                        analysis.spaceComplexity,

                    issues:
                        analysis.issues || [],

                    suggestions:
                        analysis.suggestions || []

                }

            });


            setError("");

        };


    return (

        <div className="codeExplainer">


            {/* HEADER */}

            <div className="codeExplainerHeader">

                <h1>
                    AI Code Explainer
                </h1>


                <p>
                    Understand, analyze and improve
                    your code with AI.
                </p>

            </div>


            {/* CODE EDITOR */}

            <div className="codeEditorBox">

                <div className="codeEditorToolbar">

                    <span className="editorLabel">
                        Code
                    </span>


                    <select

                        value={language}

                        onChange={(e) =>
                            setLanguage(
                                e.target.value
                            )
                        }

                        disabled={loading}

                    >

                        <option value="Python">
                            Python
                        </option>

                        <option value="JavaScript">
                            JavaScript
                        </option>

                        <option value="Java">
                            Java
                        </option>

                        <option value="C">
                            C
                        </option>

                        <option value="C++">
                            C++
                        </option>

                        <option value="TypeScript">
                            TypeScript
                        </option>

                        <option value="HTML">
                            HTML
                        </option>

                        <option value="CSS">
                            CSS
                        </option>

                    </select>

                </div>


                <div className="editorArea">

                    <div className="lineNumbers">

                        {(code
                            ? code.split("\n")
                            : [""]
                        ).map(
                            (_, index) => (

                                <div
                                    key={index}
                                >
                                    {index + 1}
                                </div>

                            )
                        )}

                    </div>


                    <textarea

                        value={code}

                        onChange={(e) =>
                            setCode(
                                e.target.value
                            )
                        }

                        placeholder="Paste or write your code here..."

                        spellCheck={false}

                        disabled={loading}

                    />

                </div>

            </div>


            {/* EXPLAIN BUTTON */}

            <button

                className="explainButton"

                onClick={
                    handleExplain
                }

                disabled={loading}

            >

                {loading
                    ? "Analyzing..."
                    : "Explain Code"}

            </button>


            {/* ERROR */}

            {error && (

                <div className="codeError">

                    {error}

                </div>

            )}


            {/* CURRENTLY VIEWING */}

            {selectedAnalysisTitle && (

                <div className="currentlyViewing">

                    <span>
                        Currently Viewing
                    </span>

                    <strong>
                        {selectedAnalysisTitle}
                    </strong>

                </div>

            )}


            {/* CURRENT ANALYSIS */}

            {result?.analysis && (

                <div
                    className="codeResult"
                    ref={resultRef}
                >

                    <AnalysisResult
                        analysis={
                            result.analysis
                        }
                    />

                </div>

            )}


            {/* PREVIOUS ANALYSES */}

            {prevChats &&
                prevChats.length > 1 && (

                    <div className="threadAnalyses">

                        <h2>
                            Previous Analyses
                        </h2>


                        {prevChats

                            .slice(0, -1)

                            .reverse()

                            .map(
                                (
                                    analysis,
                                    index
                                ) => (

                                    <div

                                        className={
                                            `previousAnalysis ${
                                                selectedAnalysisId ===
                                                analysis._id
                                                    ? "selected"
                                                    : ""
                                            }`
                                        }

                                        key={
                                            analysis._id ||
                                            index
                                        }

                                        onClick={() =>
                                            openPreviousAnalysis(
                                                analysis
                                            )
                                        }

                                    >

                                        <div className="previousAnalysisHeader">

                                            <span>
                                                {
                                                    analysis.language
                                                }
                                            </span>


                                            <span>
                                                {
                                                    analysis.title ||
                                                    analysis.codeType
                                                }
                                            </span>

                                        </div>


                                        <p>
                                            {
                                                analysis.overview
                                            }
                                        </p>

                                    </div>

                                )
                            )}

                    </div>

                )}

        </div>

    );
}


// ANALYSIS RESULT

function AnalysisResult({
    analysis
}) {

    return (

        <>

            <div className="analysisSection codeTypeSection">

                <h2>
                    🧩 Code Type
                </h2>


                <div className="codeTypeValue">

                    {analysis.codeType}

                </div>

            </div>


            <div className="analysisSection">

                <h2>
                    🧠 Overview
                </h2>


                <p>
                    {analysis.overview}
                </p>

            </div>


            <div className="analysisSection">

                <h2>
                    ⚙️ How It Works
                </h2>


                <ol>

                    {(analysis.howItWorks || [])
                        .map(
                            (
                                step,
                                index
                            ) => (

                                <li
                                    key={index}
                                >
                                    {step}
                                </li>

                            )
                        )}

                </ol>

            </div>


            <div className="analysisSection">

                <h2>
                    🔄 Algorithm
                </h2>


                <p>
                    {analysis.algorithm}
                </p>

            </div>


            <div className="analysisSection">

                <h2>
                    ⏱️ Time Complexity
                </h2>


                <p>
                    {analysis.timeComplexity}
                </p>

            </div>


            <div className="analysisSection">

                <h2>
                    💾 Space Complexity
                </h2>


                <p>
                    {analysis.spaceComplexity}
                </p>

            </div>


            <div className="analysisSection">

                <h2>
                    🐛 Potential Issues
                </h2>


                {analysis.issues?.length > 0 ? (

                    <ul>

                        {analysis.issues.map(
                            (
                                issue,
                                index
                            ) => (

                                <li
                                    key={index}
                                >
                                    {issue}
                                </li>

                            )
                        )}

                    </ul>

                ) : (

                    <p>
                        No obvious issues detected.
                    </p>

                )}

            </div>


            <div className="analysisSection">

                <h2>
                    🚀 Suggestions
                </h2>


                {analysis.suggestions?.length > 0 ? (

                    <ul>

                        {analysis.suggestions.map(
                            (
                                suggestion,
                                index
                            ) => (

                                <li
                                    key={index}
                                >
                                    {suggestion}
                                </li>

                            )
                        )}

                    </ul>

                ) : (

                    <p>
                        No additional suggestions.
                    </p>

                )}

            </div>

        </>

    );
}


export default CodeExplainer;