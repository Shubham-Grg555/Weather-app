const Coords = require('../models/coords.model.js');

const getCoordsByCityName = async (req, res) => {
  try{
    const { cityName } = req.params;
    const coords = await Coords.findOne({cityName});
    res.status(200).json(coords);
  }
  catch (error){
    res.status(500).json({message: error.message});
  }
};

const addCoords = async (req, res) => {
  try{
    const coords = await Coords.create(req.body);
    res.status(200).json(coords);
  }
  catch (error){
    res.status(500).json({message: error.message});
  }
};

//* For cleaning up database and debugging

// const getCoords = async (req, res) => {
//   try{
//     const coords = await Coords.find({});
//     res.status(200).json(coords);
//   }
//   catch (error){
//     res.status(500).json({message: error.message});
//   }
// };

// const updateCoords = async (req, res) => {
//    const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid ID format" });
//     }

//   try{
//     const updatedCoords = await Coords.findByIdAndUpdate(id, req.body, {
//       new: true,
//       runValidators: true
//     });

//     if (!updatedCoords){
//       return res.status(404).json({message: "City not found"});
//     }

//     res.status(200).json(updatedCoords);
//   }
//   catch (error){
//     res.status(500).json({message: error.message});
//   }
// };

// const deleteCoords = async (req, res) => {
//    const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid ID format" });
//     }
  
//   try{
//     const deletedCoords = await Coords.findByIdAndDelete(id, {
//       runValidators: true
//     });

//     if (!deletedCoords){
//       return res.status(404).json({message: "Coords not found"});
//     }

//     res.status(200).json({message: "City and coordinates successfully deleted"});
//   }
//   catch (error){
//     res.status(500).json({message: error.message});
//   }
// };

module.exports = {
  getCoordsByCityName,
  addCoords,
  // getCoords,
  // updateCoords,
  // deleteCoords
};