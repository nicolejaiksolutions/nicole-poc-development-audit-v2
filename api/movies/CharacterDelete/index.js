const mongoose = require("mongoose");
const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    const { movieId, characterId } = req.body;

    let movie;
    try {
      movie = await MovieModel.findById(movieId);
    } catch (_) {
      return res.status(404).json({ error: "No movie found" });
    }

    if (!movie) {
      return res.status(404).json({ error: "No movie found" });
    }

    const characterIndex = movie.characters.findIndex(
      (c) => c._id.toString() === characterId,
    );

    if (characterIndex === -1) {
      return res.status(404).json({ error: "No Character found" });
    }

    movie.characters.splice(characterIndex, 1);

    try {
      await movie.save();
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }

    return res.status(204).send();
  },
);
