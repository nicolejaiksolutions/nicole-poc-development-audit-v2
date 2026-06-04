const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const { getJSON } = require("../../../helpers/readFile");

test("MoviesByCharacterNameGet returns movies with _id, title, and releaseYear when character is found", async () => {
  const movieDocuments = getJSON(
    "../api/movies/_test/documents/movies-by-character-name-get-document.json",
  );

  const MovieModel = require("../models/movie");
  MovieModel.find = jest.fn().mockResolvedValue(movieDocuments);

  const req = {
    params: { characterName: "Frodo Baggins" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  const expectedResponse = getJSON(
    "../api/movies/_test/json-responses/movies-by-character-name-get-response.json",
  );

  expect(body.length).toBe(expectedResponse.length);
  body.forEach((movie, i) => {
    expect(movie.title).toBe(expectedResponse[i].title);
    expect(movie.releaseYear).toBe(expectedResponse[i].releaseYear);
    expect(movie.characters).toBeUndefined();
  });
});

test("MoviesByCharacterNameGet is case-insensitive when matching character name", async () => {
  const movieDocuments = getJSON(
    "../api/movies/_test/documents/movies-by-character-name-get-document.json",
  );

  const MovieModel = require("../models/movie");
  MovieModel.find = jest.fn().mockResolvedValue(movieDocuments);

  const req = {
    params: { characterName: "frodo baggins" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  expect(body.length).toBe(3);
  body.forEach((movie) => {
    expect(movie).toHaveProperty("_id");
    expect(movie).toHaveProperty("title");
    expect(movie).toHaveProperty("releaseYear");
    expect(movie.characters).toBeUndefined();
  });
});

test("MoviesByCharacterNameGet returns 404 when no movies are found for the given character name", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.find = jest.fn().mockResolvedValue([]);

  const req = {
    params: { characterName: "Spongebob Squarepants" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    error: "No movie(s) with this Character were found",
  });
});

test("MoviesByCharacterNameGet returns 400 when no character name is received", async () => {
  const MovieModel = require("../models/movie");

  const req = {
    params: { characterName: "" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    error: "No character name received",
  });
});

test("MoviesByCharacterNameGet returns 500 error when database is down", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.find = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = {
    params: { characterName: "Frodo Baggins" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
