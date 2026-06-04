const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    const { raceName } = req.params;

    try {
      const movies = await MovieModel.find({
        "characters.race": { $regex: new RegExp(`^${raceName}$`, "i") },
      });

      if (!movies || movies.length === 0) {
        return res.status(404).json({
          error: "No character with that race was found in a movie.",
        });
      }

      const characterMap = new Map();

      for (const movie of movies) {
        for (const character of movie.characters) {
          if (
            character.race &&
            character.race.toLowerCase() === raceName.toLowerCase()
          ) {
            if (!characterMap.has(character.name)) {
              characterMap.set(character.name, []);
            }
            characterMap.get(character.name).push(movie.title);
          }
        }
      }

      const result = Array.from(characterMap.entries()).map(
        ([name, movieTitles]) => ({ name, movies: movieTitles }),
      );

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
