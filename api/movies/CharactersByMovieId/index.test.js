const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const { getJSON } = require("../../../helpers/readFile");

test("CharactersByMovieId returns an array of character names when a matching movieId is found", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/characters-by-movie-id-get-document.json",
  );

  const MovieModel = require("../models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(movieDocument);

  const req = {
    params: { movieId: "69efd1c1b2f8c7327f029fb0" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  const expectedResponse = getJSON(
    "../api/movies/_test/json-responses/characters-by-movie-id-get-response.json",
  );

  expect(body).toEqual(expectedResponse);
});

test("CharactersByMovieId returns 404 when no movie is found with the given movieId", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(null);

  const req = {
    params: { movieId: "000000000000000000000000" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharactersByMovieId returns 500 error when database is down", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.findById = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = {
    params: { movieId: "69efd1c1b2f8c7327f029fb0" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
