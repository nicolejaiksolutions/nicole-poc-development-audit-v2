const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    const { characterName } = req.params;

    if (!characterName) {
      return res.status(400).json({ error: "No character name received" });
    }

    try {
      const movies = await MovieModel.find({
        "characters.name": { $regex: new RegExp(`^${characterName}$`, "i") },
      });

      if (!movies || movies.length === 0) {
        return res.status(404).json({
          error: "No movie(s) with this Character were found",
        });
      }

      const result = movies.map((movie) => ({
        _id: movie._id,
        title: movie.title,
        releaseYear: movie.releaseYear,
      }));

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
