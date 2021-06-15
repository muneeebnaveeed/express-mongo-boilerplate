const router = require('express').Router();

const {
    getProducts,
    addBulkProducts,
    getProductById,
    editProduct,
    addProduct,
    deleteProducts,
    deleteProductById,
} = require('../controllers/products');

router.route('/').get(getProducts);
router.route('/:id').get(getProductById);
router.route('/').post(addProduct);
router.route('/bulk').post(addBulkProducts);
router.route('/:id').patch(editProduct);
router.route('/:id').delete(deleteProductById);
router.route('/bulk').delete(deleteProducts);

module.exports = router;
