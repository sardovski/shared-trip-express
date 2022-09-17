const homeController = require('../controllers/homeController');
const authController = require('../controllers/authController');
const tripsController = require('../controllers/tripsController');
const notFoundController = require('../controllers/notFoundController');

module.exports = (app) => {
    app.use('/', homeController);
    app.use('/auth', authController);
    app.use('/trips', tripsController);
    app.all('*', notFoundController);
}