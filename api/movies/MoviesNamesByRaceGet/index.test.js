const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const { getJSON } = require("../../../helpers/readFile");

test("MoviesNamesByRaceGet returns character names with movies array when race is found", async () => {
  const movieDocuments = getJSON(
    "../api/movies/_test/documents/movies-names-by-race-get-document.json",
  );

  const MovieModel = require("../models/movie");
  MovieModel.find = jest.fn().mockResolvedValue(movieDocuments);

  const req = { params: { raceName: "Man" }, header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  const expected = getJSON(
    "../api/movies/_test/json-responses/movies-names-by-race-get-response.json",
  );

  expect(body.length).toBe(expected.length);
  body.forEach((item, i) => {
    expect(item.name).toBe(expected[i].name);
    expect(item.movies).toEqual(expected[i].movies);
  });
});

test("MoviesNamesByRaceGet each character is only listed once even if they appear in multiple movies", async () => {
  const movieDocuments = getJSON(
    "../api/movies/_test/documents/movies-names-by-race-get-document.json",
  );

  const MovieModel = require("../models/movie");
  MovieModel.find = jest.fn().mockResolvedValue(movieDocuments);

  const req = { params: { raceName: "Man" }, header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];
  const names = body.map((item) => item.name);
  const uniqueNames = [...new Set(names)];

  expect(names.length).toBe(uniqueNames.length);
});

test("MoviesNamesByRaceGet is case-insensitive when matching race", async () => {
  const movieDocuments = getJSON(
    "../api/movies/_test/documents/movies-names-by-race-get-document.json",
  );

  const MovieModel = require("../models/movie");
  MovieModel.find = jest.fn().mockResolvedValue(movieDocuments);

  const req = { params: { raceName: "man" }, header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.length).toBeGreaterThan(0);
});

test("MoviesNamesByRaceGet returns 404 when no movies found for that race", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.find = jest.fn().mockResolvedValue([]);

  const req = { params: { raceName: "Oompa Loompa" }, header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    error: "No character with that race was found in a movie.",
  });
});

test("MoviesNamesByRaceGet returns 500 when database is down", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.find = jest
    .fn()
    .mockRejectedValue(new Error("DB connection failed"));

  const req = { params: { raceName: "Man" }, header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
