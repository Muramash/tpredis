const router = require('express').Router()

/* Page d'accueil */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Mon super projet' })
})

module.exports = router
