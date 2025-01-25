import Router from 'express'
import {login, signup, logout, refreshToken} from '../controllers/user.controller.js'
import { authLimiter } from '../middlewares/rate-limiter.js'

const router = Router()

router.route("/login").post(authLimiter,login)
router.route("/signup").post(authLimiter,signup)
router.route("/logout").post(authLimiter,logout)
router.route("/refresh").post(authLimiter,refreshToken)

export default router