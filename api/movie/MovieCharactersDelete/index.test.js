const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

const MOVIE_ID = "69efd1c1b2f8c7327f029fad";

function makeMockMovie() {
  return {
    characters: [
      {
        _id: "6a20d07ebc08df2a166c85ca",
        name: "Frodo Baggins",
        race: "Hobbit",
      },
      {
        _id: "6a20d07ebc08df2a166c85cb",
        name: "Gandalf the Grey",
        race: "Maia (Wizard)",
      },
    ],
    save: jest.fn().mockResolvedValue(true),
  };
}

test("MovieCharactersDelete clears all characters and returns 204", async () => {
  const MovieModel = require("../../movies/models/movie");
  const mockMovie = makeMockMovie();
  MovieModel.findById = jest.fn().mockResolvedValue(mockMovie);

  const req = { params: { movieId: MOVIE_ID }, header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalled();
  expect(mockMovie.characters.length).toBe(0);
  expect(mockMovie.save).toHaveBeenCalledTimes(1);
});

test("MovieCharactersDelete returns 404 when movie is not found", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(null);

  const req = { params: { movieId: MOVIE_ID }, header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieCharactersDelete returns 404 when movie ID is invalid", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockRejectedValue(new Error("Cast Error"));

  const req = { params: { movieId: "invalid-id" }, header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});
