const express = require('express')
const router = express.Router()
const {createOrder,
    getOrderById,
    updateOrderStatus,
    getUserOrders,
    deleteOrder,
    getAllOrders,getOrdersByStatus,
    getRecentOrders} = require('../controllers/orderController')


router.get('/:id',getOrderById )
router.get('/user/:userId',getUserOrders )
router.get('/', getAllOrders)
router.get('/status/:status', getOrdersByStatus)
router.get('/recent/orders', getRecentOrders)
router.put('/:id/status', updateOrderStatus)
router.post('/remove/item', )
router.post('/', createOrder)
router.delete('/:id', deleteOrder)



module.exports = router