const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

const MOVIE_ID = "69efd1c1b2f8c7327f029fad";
const CHAR_ID = "6a20d07ebc08df2a166c85ca";

function makeMockMovie(characters) {
  return {
    characters,
    save: jest.fn().mockResolvedValue(true),
  };
}

test("CharacterDelete removes a character and returns 204", async () => {
  const MovieModel = require("../models/movie");
  const mockMovie = makeMockMovie([
    { _id: { toString: () => CHAR_ID }, name: "Frodo Baggins", race: "Hobbit" },
  ]);
  MovieModel.findById = jest.fn().mockResolvedValue(mockMovie);

  const req = { body: { movieId: MOVIE_ID, characterId: CHAR_ID }, header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalled();
  expect(mockMovie.characters.length).toBe(0);
  expect(mockMovie.save).toHaveBeenCalledTimes(1);
});

test("CharacterDelete returns 404 when movie is not found", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(null);

  const req = { body: { movieId: MOVIE_ID, characterId: CHAR_ID }, header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharacterDelete returns 404 when movie ID is invalid", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.findById = jest.fn().mockRejectedValue(new Error("Cast Error"));

  const req = {
    body: { movieId: "invalid-id", characterId: CHAR_ID },
    header: {},
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharacterDelete returns 404 when character is not found in movie", async () => {
  const MovieModel = require("../models/movie");
  const mockMovie = makeMockMovie([
    {
      _id: { toString: () => "differentcharacterid" },
      name: "Gandalf",
      race: "Wizard",
    },
  ]);
  MovieModel.findById = jest.fn().mockResolvedValue(mockMovie);

  const req = { body: { movieId: MOVIE_ID, characterId: CHAR_ID }, header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No Character found" });
});
