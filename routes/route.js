// --- Initialization --- //
const express = require('express')
const controller = require('../controllers/controller')
const router = express.Router()

// --- Routes --- //
// Phase 1 - Index
router.get('/', controller.renderPhase_1)
// Phase 2 - Account
router.get('/login', controller.renderPhase_2)

router.get('/signup', controller.renderPhase_2_1)

router.get('/editprof', controller.renderPhase_2_2)

// Phase 3 - Dashboard
router.get('/dashboard', controller.renderPhase_3)

// --- Errors --- //
// 404 - Page not found
router.use((req, res, next) => {
  return res.status(404).send('Error 404 : Page Not Found')
})
// 500 - Any server error
router.use((req, res, next) => {
  return res.status(500).send('Error 500 : Internal Server Error')
})

module.exports = router
