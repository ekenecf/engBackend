import express from 'express'
import { getOneUser, deleteUser } from '../controllers/users.js'
import { checkUser } from '../utils/verifyToken.js'
import { verify } from '../controllers/auth.js'
import { forgotpassword } from '../controllers/auth.js'
import { resetpassword } from '../controllers/auth.js'
import { getpasswordLink } from '../controllers/auth.js'

const router = express.Router()

router.route('/:Id').get(checkUser, getOneUser).delete(checkUser, deleteUser)
router.route("/verifyuser/:id").get(verify);
router.route("/forgotPassword").post(forgotpassword);
router.route("/resetpassword/:resetToken").post(resetpassword).get(getpasswordLink);

export default router;
