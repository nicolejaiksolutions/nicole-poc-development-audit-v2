const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const { getJSON } = require("../../../helpers/readFile");

test("MovieAddPost returns 200 and the newly created movie object", async () => {
  const savedMovie = getJSON(
    "../api/movies/_test/documents/movie-add-post-document.json",
  );

  const MovieModel = require("../../movies/models/movie");
  MovieModel.create = jest.fn().mockResolvedValue(savedMovie);

  const req = {
    body: {
      movieName: "The Lord of the Rings: The War of the Rohirrim",
      releaseYear: 2024,
    },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  const expectedResponse = getJSON(
    "../api/movies/_test/json-responses/movie-add-post-response.json",
  );

  expect(body.name).toBe(expectedResponse.name);
  expect(body.releaseYear).toBe(expectedResponse.releaseYear);
  expect(body.characters).toEqual(expectedResponse.characters);
});

test("MovieAddPost returns 406 when movieName is missing", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    body: { releaseYear: 2024 },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie name found" });
});

test("MovieAddPost returns 406 when movieName is three characters or less", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    body: { movieName: "The", releaseYear: 2024 },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Invalid movie name" });
});

test("MovieAddPost returns 406 when releaseYear is missing", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    body: { movieName: "The War of the Rohirrim" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Invalid release year" });
});

test("MovieAddPost returns 406 when releaseYear is before 1990", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    body: { movieName: "The War of the Rohirrim", releaseYear: 1985 },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Invalid release year" });
});

test("MovieAddPost returns 406 when releaseYear exceeds the current year", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    body: { movieName: "The War of the Rohirrim", releaseYear: 9999 },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Invalid release year" });
});

test("MovieAddPost returns 406 when releaseYear is not a number", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    body: { movieName: "The War of the Rohirrim", releaseYear: "two thousand" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Invalid release year" });
});

test("MovieAddPost returns 500 when the database is down", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.create = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = {
    body: {
      movieName: "The Lord of the Rings: The War of the Rohirrim",
      releaseYear: 2024,
    },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
