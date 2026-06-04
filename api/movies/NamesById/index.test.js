const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const { getJSON } = require("../../../helpers/readFile");

test("NamesById returns movie, character name, and race when matching movieId and characterName are found", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/names-by-id-document.json",
  );

  const MovieModel = require("../models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(movieDocument);

  const req = {
    params: { movieId: "69efd1c1b2f8c7327f029faf", characterName: "aragorn" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  const expectedResponse = getJSON(
    "../api/movies/_test/json-responses/names-by-id-response.json",
  );

  expect(body.movie).toBe(expectedResponse.movie);
  expect(body.name).toBe(expectedResponse.name);
  expect(body.race).toBe(expectedResponse.race);
});

test("NamesById returns 404 when no movie is found with the given movieId", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(null);

  const req = {
    params: { movieId: "000000000000000000000000", characterName: "aragorn" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("NamesById returns 404 when the character name is not found in the movie", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/names-by-id-document.json",
  );

  const MovieModel = require("../models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(movieDocument);

  const req = {
    params: {
      movieId: "69efd1c1b2f8c7327f029faf",
      characterName: "Saruman",
    },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No character found" });
});

test("NamesById returns 500 error when database is down", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.findById = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = {
    params: { movieId: "69efd1c1b2f8c7327f029faf", characterName: "aragorn" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
