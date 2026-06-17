const router = require('express').Router();
const { auth } = require('../middleware/auth');
const templateController = require('../controllers/template.controller');

router.get('/', auth, templateController.getTemplates);
router.get('/:id', auth, templateController.getTemplate);
router.post('/', auth, templateController.createTemplate);
router.put('/:id', auth, templateController.updateTemplate);
router.delete('/:id', auth, templateController.deleteTemplate);

module.exports = router;