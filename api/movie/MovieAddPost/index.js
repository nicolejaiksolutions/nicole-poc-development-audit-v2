const mongoose = require("mongoose");
const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../../movies/models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    const { movieName, releaseYear } = req.body;

    if (!movieName) {
      return res.status(406).json({ error: "No movie name found" });
    }

    if (movieName.length <= 3) {
      return res.status(406).json({ error: "Invalid movie name" });
    }

    const currentYear = new Date().getFullYear();
    if (
      releaseYear == null ||
      typeof releaseYear !== "number" ||
      releaseYear < 1990 ||
      releaseYear > currentYear
    ) {
      return res.status(406).json({ error: "Invalid release year" });
    }

    try {
      const savedMovie = await MovieModel.create({
        _id: new mongoose.Types.ObjectId(),
        name: movieName,
        releaseYear,
        characters: [],
      });
      return res.status(200).json(savedMovie);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
