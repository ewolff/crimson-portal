const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const searchController = require('./lib/controllers/search')
const helpController = require('./lib/controllers/help')
const resultController = require('./lib/controllers/result')
const partnersController = require('./lib/controllers/partners')
const offersController = require('./lib/controllers/offers')
const proposalsController = require('./lib/controllers/proposals')
const contractsController = require('./lib/controllers/contracts')
const branchesController = require('./lib/controllers/branches')
const jobsController = require('./lib/controllers/jobs')
const peopleController = require('./lib/controllers/people')
const compression = require('compression')

// Set up Mustache as the view engine
app.engine('mustache', require('./lib/mustache'))
app.set('views', './views')
app.set('view engine', 'mustache')
app.set('layout', 'layout')

app.locals.postbox_url = process.env.POSTBOX_URL || 'http://localhost:9000'
app.locals.letter_url = process.env.LETTER_URL || 'http://localhost:9100'
app.locals.damage_url = process.env.DAMAGE_URL || 'http://localhost:9200'

app.use(require('./lib/render_without_layout'))

app.use(compression())

app.use(bodyParser.urlencoded({ extended: false }))

// If the page is embedded, provide that info to the templates
app.use((req, res, next) => {
  if (req.headers.embedded === 'true') {
    res.locals.isEmbedded = true
  } else {
    res.locals.isEmbedded = false
  }
  next()
})

// Mount the assets
app.use('/assets', express.static('public'))

app.get('/', searchController.get)
app.get('/help/shortcuts', helpController.shortcuts)
app.get('/help/example', helpController.example)
app.get('/result', resultController.get)
app.get('/partners/:id', partnersController.get)
app.get('/partners/:id/branches/:branch', branchesController.show)
app.get('/partners/:id/offers', offersController.index)
app.post('/partners/:id/offers', offersController.create)
app.get('/partners/:id/offers/new', offersController.new)
app.get('/partners/:id/offers/:offer_id', offersController.show)
app.post('/partners/:id/offers/:offer_id/copy', offersController.copy)
app.get('/partners/:id/offers/:offer_id/edit', offersController.edit)
app.post('/partners/:id/offers/calculation', offersController.calc)
app.get('/partners/:id/proposals', proposalsController.index)
app.get('/partners/:id/contracts', contractsController.index)
app.get('/partners/:id/contracts/:contract_id', contractsController.show)
app.get('/partners/:id/contracts/:contract_id/people/:people_id/edit', peopleController.edit)
app.get('/jobs', jobsController.index)
app.get('/jobs/results', jobsController.results)

module.exports = app

// Only run the application if it was invoked directly (e.g. not required by a test)
if (module.parent === null) {
  const backend = require('crimson-backend')

  Promise.all([
    backend.listen(5100),
    app.listen(process.env.PORT || 9400)
  ]).then(() => console.log('Listening on port 9400 !'))
}
