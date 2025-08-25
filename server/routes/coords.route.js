const express = require('express');
const coordsRouter = express.Router();
//* Use for debugging: const {getCoords, getCoordsByCityName, addCoords, updateCoords, deleteCoords} = require('../controllers/coords.controller.js');
const {getCoordsByCityName, addCoords} = require('../controllers/coords.controller.js');

coordsRouter.get('/:cityName', getCoordsByCityName);

coordsRouter.post('/', addCoords);

//* For cleaning up database and debugging
//router.get('/', getCoords);
//coordsRouter.put('/:id', updateCoords);
// coordsRouter.delete('/:id', deleteCoords);

module.exports = coordsRouter;