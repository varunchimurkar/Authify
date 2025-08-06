import express from 'express'
import { forgetPassword, getMe, login, logout, registerUser, resetPassword, verifyUser } from '../controller/user.controller.js'
import { isLoggedIn } from '../middleware/auth.middleware.js'


const router = express.Router()

router.post("/register", registerUser)

router.get("/verify/:token", verifyUser)

router.post("/login", login)

router.get("/me", isLoggedIn, getMe)

router.get("/logout", isLoggedIn, logout)

router.post("/forgetPassword", forgetPassword)

router.post("/resetPassword/:token", resetPassword)

export default router