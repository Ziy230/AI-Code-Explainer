import { useState } from "react";
import "./Signup.css";
import API_URL from "./api.js";

function Signup({ onSignupSuccess, onGoToLogin }) {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignup = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await fetch(
                `${API_URL}/api/auth/signup`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            console.log(data);

            if (response.ok) {

                alert(
                    "Signup successful! Please login."
                );

                onSignupSuccess();

            } else {

                setError(
                    data.error ||
                    "Signup failed"
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
                    Create your account
                </h1>

                <p className="authSubtitle">
                    Join SigmaGPT and start chatting
                </p>

                {error && (
                    <div className="authError">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup}>

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
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(
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
                            ? "Creating account..."
                            : "Sign Up"}
                    </button>

                </form>

                <div className="authSwitch">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        onClick={onGoToLogin}
                    >
                        Login
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Signup;