const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    let movies = await MovieModel.find();
    const sortedMovies = (movies || []).sort((a, b) => a.releaseYear - b.releaseYear);
    return res.status(200).json(sortedMovies);
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
