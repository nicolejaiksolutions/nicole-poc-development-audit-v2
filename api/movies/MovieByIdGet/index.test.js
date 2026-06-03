const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const { getJSON } = require("../../../helpers/readFile");

test("MovieByIdGet returns a movie object when a matching _id is found", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/movie-by-id-get-document.json",
  );

  const MovieModel = require("../models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(movieDocument);

  const req = {
    params: { id: "69efd1c1b2f8c7327f029faf" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  const expectedResponse = getJSON(
    "../api/movies/_test/json-responses/movie-by-id-get-response.json",
  );

  expect(body.title).toBe(expectedResponse.title);
  expect(body.releaseYear).toBe(expectedResponse.releaseYear);
  expect(body.characters).toEqual(expectedResponse.characters);
});

test("MovieByIdGet returns 404 when no movie is found with the given _id", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(null);

  const req = {
    params: { id: "000000000000000000000000" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieByIdGet returns 400 when no _id is received", async () => {
  const MovieModel = require("../models/movie");

  const req = {
    params: { id: "" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: "No _id received" });
});

test("MovieByIdGet returns 500 error when database is down", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.findById = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = {
    params: { id: "69efd1c1b2f8c7327f029faf" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
