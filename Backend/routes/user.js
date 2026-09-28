import express from "express";
import passport from "passport";

import userController from "../controllers/users.js";
import isLoggedIn from "../middleware/auth.js";

const router = express.Router();


// SIGNUP
router
    .route("/signup")
    .post(userController.signup);


// LOGIN
router.post("/login", (req, res, next) => {

    passport.authenticate("local", (err, user, info) => {

        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json({
                error: "Invalid username or password"
            });
        }

        req.logIn(user, (err) => {

            if (err) {
                return next(err);
            }

            return userController.login(req, res);
        });

    })(req, res, next);
});


// LOGOUT
router
    .route("/logout")
    .get(userController.logout);


// PROTECTED
router.get(
    "/protected",
    isLoggedIn,
    (req, res) => {

        res.json({
            message: "You are authenticated",
            user: req.user
        });

    }
);

export default router;