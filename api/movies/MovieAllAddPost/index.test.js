const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

const MOVIE_1 = {
  _id: "69efd1c1b2f8c7327f029fad",
  title: "The Lord of the Rings: The Fellowship of the Ring",
  releaseYear: 2001,
  characters: [{ name: "Frodo Baggins", race: "Hobbit" }],
};

const MOVIE_2 = {
  _id: "69efd1c1b2f8c7327f029fae",
  title: "The Lord of the Rings: The Two Towers",
  releaseYear: 2002,
  characters: [{ name: "Aragorn", race: "Man" }],
};

test("MovieAllAddPost adds movies that do not exist and skips movies that do", async () => {
  const MovieModel = require("../../movies/models/movie");

  MovieModel.findById = jest
    .fn()
    .mockResolvedValueOnce(MOVIE_1) // MOVIE_1 exists → NOT ADDED
    .mockResolvedValueOnce(null); // MOVIE_2 doesn't exist → ADDED

  MovieModel.create = jest.fn().mockResolvedValue({ ...MOVIE_2 });

  const req = { body: [MOVIE_1, MOVIE_2], header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.length).toBe(2);
  expect(body[0].status).toBe("NOT ADDED");
  expect(body[1].status).toBe("ADDED");
});

test("MovieAllAddPost returns ADDED for a new movie", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(null);
  MovieModel.create = jest.fn().mockResolvedValue({ ...MOVIE_1 });

  const req = { body: [MOVIE_1], header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body[0].status).toBe("ADDED");
  expect(MovieModel.create).toHaveBeenCalledTimes(1);
});

test("MovieAllAddPost returns NOT ADDED for an existing movie", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(MOVIE_1);

  const req = { body: [MOVIE_1], header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body[0].status).toBe("NOT ADDED");
});

test("MovieAllAddPost returns 400 when body is not an array", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = { body: {}, header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: "No movies received" });
});

test("MovieAllAddPost returns 400 when body is an empty array", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = { body: [], header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: "No movies received" });
});
