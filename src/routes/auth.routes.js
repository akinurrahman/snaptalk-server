import Router from 'express'
import {login, signup, logout, refreshToken} from '../controllers/user.controller.js'

const router = Router()

router.route("/login").post(login)
router.route("/signup").post(signup)
router.route("/logout").post(logout)
router.route("/refresh").post(refreshToken)

export default router