import Router from 'express'
import {login, signup, logout, refreshToken, getRandomImage} from '../controllers/user.controller.js'
import { authLimiter } from '../middlewares/rate-limiter.js'

const router = Router()

router.route("/login").post(login)
router.route("/signup").post(signup)
router.route("/logout").post(logout)
router.route("/refresh").post(refreshToken)
router.route("/get-random-img").get(getRandomImage)

export default router