import { useState } from "react";
import "./Login.css";
import API_URL from "./api.js";

function Login({ onLogin, onGoToSignup }) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                onLogin();

            } else {

                setError(
                    data.error ||
                    "Invalid username or password"
                );

            }

        } catch (err) {

            console.log(err);
            setError(
                "Unable to connect to server"
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className="authPage">

            <div className="authCard">

                <div className="authLogo">

                    <img
                        src="/src/assets/blacklogo.png"
                        alt="SigmaGPT"
                    />

                </div>

                <h1>
                    Welcome to AI Code Explainer
                </h1>

                <p className="authSubtitle">
                    Login to continue AI Code Explainer
                </p>

                {error && (
                    <div className="authError">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>

                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) =>
                            setUsername(
                                e.target.value
                            )
                        }
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(
                                e.target.value
                            )
                        }
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

                <div className="authSwitch">

                    <span>
                        Don't have an account?
                    </span>

                    <button
                        onClick={onGoToSignup}
                    >
                        Sign Up
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Login;