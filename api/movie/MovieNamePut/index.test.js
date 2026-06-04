const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

test("MovieNamePut returns 204 when the movie name is updated successfully", async () => {
  const movie = {
    _id: "abc123",
    name: "The Fellowship of the Ring",
    releaseYear: 2001,
  };
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(movie);
  MovieModel.findByIdAndUpdate = jest.fn().mockResolvedValue(movie);

  const req = {
    body: { movieId: "abc123", movieName: "The Two Towers" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalled();
});

test("MovieNamePut returns 404 when the movieId is not found", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(null);

  const req = {
    body: { movieId: "nonexistent", movieName: "The Two Towers" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieNamePut returns 406 when movieName is missing", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    body: { movieId: "abc123" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Movie Name is not valid. It must be at least three characters.",
  });
});

test("MovieNamePut returns 406 when movieName has less than three characters", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    body: { movieId: "abc123", movieName: "ab" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Movie Name is not valid. It must be at least three characters.",
  });
});

test("MovieNamePut returns 500 when the database is down", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = {
    body: { movieId: "abc123", movieName: "The Two Towers" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
