const mongoose = require('mongoose');

const coordsSchema = mongoose.Schema(
  {
    cityName: {
      type: String,
      required: true,
      unique: true
    },

    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },

    lon: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
);

const Coords = mongoose.model("Coord", coordsSchema);

module.exports = Coords;