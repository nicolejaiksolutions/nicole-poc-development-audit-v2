const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    const { race } = req.params;

    if (!race) {
      return res.status(400).json({ error: "No race received" });
    }

    try {
      const movies = await MovieModel.find({
        "characters.race": { $regex: new RegExp(`^${race}$`, "i") },
      });

      if (!movies || movies.length === 0) {
        return res.status(404).json({
          error: `No movie(s) with characters of the ${race} race were found`,
        });
      }

      const result = movies.map((movie) => ({
        _id: movie._id,
        title: movie.title,
        releaseYear: movie.releaseYear,
        characters: movie.characters.filter(
          (c) => c.race.toLowerCase() === race.toLowerCase(),
        ),
      }));

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
