import User from "../models/User.js";

const userController = {

    signup: async (req, res) => {
        try {

            const { username, email, password } = req.body;

            const user = new User({
                username,
                email
            });

            const registeredUser = await User.register(
                user,
                password
            );

            res.status(201).json({
                message: "User registered successfully",
                user: {
                    id: registeredUser._id,
                    username: registeredUser.username,
                    email: registeredUser.email
                }
            });

        } catch (err) {

            console.log(err);

            res.status(500).json({
                error: "Signup failed"
            });
        }
    },

    login: (req, res) => {

        res.json({
            message: "Login successful",
            user: req.user
        });

    },

    logout: (req, res) => {

        req.logout((err) => {

            if (err) {
                return res.status(500).json({
                    error: "Logout failed"
                });
            }

            res.json({
                message: "Logout successful"
            });

        });

    }

};

export default userController;