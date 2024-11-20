const express = require('express')
const router = express.Router()
const {sendResetToken,resetPassword,checkUserActiveStatus,loginUser,addUser, getUser, getUsers,updateUser, deleteUser} = require('../controllers/userController')

router.post('/reset/token', sendResetToken)
router.post('/reset/password', resetPassword)
router.post('/isactive', checkUserActiveStatus)
router.post('/login', loginUser)
router.get('/:id', getUser)
router.get('/get/users', getUsers)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)
router.post('/', addUser)



module.exports = router