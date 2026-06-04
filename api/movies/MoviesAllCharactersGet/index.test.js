const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON(
  "../api/movies/_test/documents/movies-get-document.json",
);
const expectedResponse = getJSON(
  "../api/movies/_test/json-responses/movies-all-characters-get-response.json",
);

beforeEach(() => {
  mockingoose.resetAll();
});

test("MoviesAllCharactersGet returns a flat array of unique characters with name and race", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  const req = { header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  expect(body).toEqual(expectedResponse);
});

test("MoviesAllCharactersGet each character object has only name and race fields", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  const req = { header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  body.forEach((character) => {
    expect(Object.keys(character)).toEqual(["name", "race"]);
  });
});

test("MoviesAllCharactersGet returns no duplicate characters", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  const req = { header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];
  const names = body.map((c) => c.name);
  const uniqueNames = [...new Set(names)];

  expect(names).toEqual(uniqueNames);
});

test("MoviesAllCharactersGet returns characters ordered by earliest movie release date first", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  const req = { header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  // First character should be from the earliest movie (2001 - Fellowship)
  expect(body[0].name).toBe("Frodo Baggins");
  // First Hobbit character should appear before any character exclusive to later films
  const bilboIndex = body.findIndex((c) => c.name === "Bilbo Baggins");
  const smaugIndex = body.findIndex((c) => c.name === "Smaug");
  expect(bilboIndex).toBeLessThan(smaugIndex);
});

test("MoviesAllCharactersGet returns empty array when no movies found", async () => {
  const MovieModel = require("../models/movie");
  mockingoose(MovieModel).toReturn([], "find");

  const req = { header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json.mock.calls[0][0]).toEqual([]);
});

test("MoviesAllCharactersGet returns 500 error when database is down", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.find = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = { header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
