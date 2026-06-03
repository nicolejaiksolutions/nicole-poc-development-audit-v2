const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const { getJSON } = require("../../../helpers/readFile");

test("MoviesByReleaseYearsGet returns movies between start and end release year", async () => {
  const movieDocuments = getJSON(
    "../api/movies/_test/documents/movies-by-release-years-get-document.json",
  );

  const MovieModel = require("../models/movie");
  MovieModel.find = jest.fn().mockResolvedValue(movieDocuments);

  const req = {
    params: { startReleaseYear: "2000", endReleaseYear: "2005" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body).toHaveLength(3);
  expect(body[0].releaseYear).toBe(2001);
  expect(body[1].releaseYear).toBe(2002);
  expect(body[2].releaseYear).toBe(2003);
});

test("MoviesByReleaseYearsGet returns 404 when no movies found in range", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.find = jest.fn().mockResolvedValue([]);

  const req = {
    params: { startReleaseYear: "2010", endReleaseYear: "2011" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movies found" });
});

test("MoviesByReleaseYearsGet returns 406 when startReleaseYear is not a number", async () => {
  const MovieModel = require("../models/movie");

  const req = {
    params: { startReleaseYear: "abc", endReleaseYear: "2005" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Starting release year must be a number",
  });
});

test("MoviesByReleaseYearsGet returns 406 when startReleaseYear is out of range", async () => {
  const MovieModel = require("../models/movie");

  const req = {
    params: { startReleaseYear: "1999", endReleaseYear: "2005" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Starting release year must be between 2000 and 2020",
  });
});

test("MoviesByReleaseYearsGet returns 406 when endReleaseYear is not a number", async () => {
  const MovieModel = require("../models/movie");

  const req = {
    params: { startReleaseYear: "2000", endReleaseYear: "xyz" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Ending release year must be a number",
  });
});

test("MoviesByReleaseYearsGet returns 406 when endReleaseYear is out of range", async () => {
  const MovieModel = require("../models/movie");

  const req = {
    params: { startReleaseYear: "2000", endReleaseYear: "2021" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Ending release year must be between 1977 and 2020",
  });
});

test("MoviesByReleaseYearsGet returns 500 when database is down", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.find = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = {
    params: { startReleaseYear: "2000", endReleaseYear: "2005" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
