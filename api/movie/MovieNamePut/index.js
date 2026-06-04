const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../../movies/models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    const { movieId, movieName } = req.body;

    if (!movieName || movieName.length < 3) {
      return res.status(406).json({
        error: "Movie Name is not valid. It must be at least three characters.",
      });
    }

    try {
      const movie = await MovieModel.findById(movieId);
      if (!movie) {
        return res.status(404).json({ error: "No movie found" });
      }

      await MovieModel.findByIdAndUpdate(movieId, { title: movieName });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
