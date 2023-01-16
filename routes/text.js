import express from 'express'
import { getAllText, createText, updateText, deleteText } from '../controllers/text.js'
import { checkUser } from '../utils/verifyToken.js'


const router = express.Router()

router.route('/:Id').post(checkUser, createText).get(checkUser, getAllText)
router.route('/:Id/:textId').patch(checkUser, updateText).delete(checkUser, deleteText)

export default router;
