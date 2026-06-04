const mongoose = require("mongoose");
const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../../movies/models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    const { _id, characters } = req.body;

    if (!_id) {
      return res.status(400).json({ error: "No movie ID received" });
    }

    if (!Array.isArray(characters) || characters.length === 0) {
      return res.status(400).json({ error: "No characters received" });
    }

    let movie;
    try {
      movie = await MovieModel.findById(_id);
    } catch (_) {
      return res.status(404).json({ error: "No movie found" });
    }

    if (!movie) {
      return res.status(404).json({ error: "No movie found" });
    }

    const resultCharacters = [];

    for (const inputChar of characters) {
      const existingChar = movie.characters.find(
        (c) => c._id.toString() === inputChar._id,
      );

      if (!existingChar) {
        movie.characters.push({
          _id: new mongoose.Types.ObjectId(inputChar._id),
          name: inputChar.name,
          race: inputChar.race,
        });
        resultCharacters.push({ ...inputChar, status: "ADDED" });
      } else if (
        existingChar.name === inputChar.name &&
        existingChar.race === inputChar.race
      ) {
        resultCharacters.push({ ...inputChar, status: "NOT ADDED" });
      } else {
        existingChar.name = inputChar.name;
        existingChar.race = inputChar.race;
        resultCharacters.push({ ...inputChar, status: "UPDATED" });
      }
    }

    try {
      await movie.save();
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }

    return res.status(200).json({ _id, characters: resultCharacters });
  },
);
