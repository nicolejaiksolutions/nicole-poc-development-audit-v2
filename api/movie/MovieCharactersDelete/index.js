const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../../movies/models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    const { movieId } = req.params;

    let movie;
    try {
      movie = await MovieModel.findById(movieId);
    } catch (_) {
      return res.status(404).json({ error: "No movie found" });
    }

    if (!movie) {
      return res.status(404).json({ error: "No movie found" });
    }

    movie.characters = [];

    try {
      await movie.save();
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }

    return res.status(204).send();
  },
);
