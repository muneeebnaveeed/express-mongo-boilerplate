const router = require('express').Router();

const { getOrders, getOrder, addOrder, deleteOrders, deleteOrder } = require('../controllers/ordersController');

router.route('/').get(getOrders);
router.route('/:id').get(getOrder);
router.route('/').post(addOrder);
router.route('/bulk').delete(deleteOrders);
router.route('/id/:id').delete(deleteOrder);

module.exports = router;
