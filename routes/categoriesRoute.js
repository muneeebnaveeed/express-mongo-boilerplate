const router = require('express').Router();

const {
    getCategories,
    addCategory,
    editCategory,
    getCategory,
    deleteCategory,
    deleteCategories,
} = require('../controllers/categoriesController');

router.route('/').get(getCategories);
router.route('/:id').get(getCategory);
router.route('/').post(addCategory);
router.route('/:id').patch(editCategory);
router.route('/bulk').delete(deleteCategories);
router.route('/id/:id').delete(deleteCategory);

module.exports = router;
