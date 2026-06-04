const mongoose = require("mongoose");
const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    const movies = req.body;

    if (!Array.isArray(movies) || movies.length === 0) {
      return res.status(400).json({ error: "No movies received" });
    }

    const result = [];

    for (const movie of movies) {
      let existing = null;
      try {
        existing = await MovieModel.findById(movie._id);
      } catch (_) {
        // invalid id format — treat as not found, attempt to add
      }

      if (existing) {
        result.push({ ...movie, status: "NOT ADDED" });
      } else {
        try {
          await MovieModel.create({
            ...movie,
            _id: new mongoose.Types.ObjectId(movie._id),
          });
          result.push({ ...movie, status: "ADDED" });
        } catch (error) {
          result.push({ ...movie, status: "NOT ADDED" });
        }
      }
    }

    return res.status(200).json(result);
  },
);
