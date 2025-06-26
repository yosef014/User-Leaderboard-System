import { Router } from 'express'
import userController from "../controllers/UserController"
const router = Router()

router.post('/create', userController.createUser)
router.put('/:id/score', userController.updateScore)
router.get('/top', userController.getTopN)
router.get('/:id/rank', userController.getUserRank)

export default router
