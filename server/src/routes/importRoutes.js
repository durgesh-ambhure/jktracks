const express = require('express');
const importController = require('../controllers/importController');
const { authenticate, requirePermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authenticate);

router.get('/:key', requirePermission('import.read'), importController.listImports);
router.post('/:key', requirePermission('import.create'), upload.single('file'), importController.uploadImport);

module.exports = router;
