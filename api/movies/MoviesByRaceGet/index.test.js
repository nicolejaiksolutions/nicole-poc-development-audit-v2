const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const { getJSON } = require("../../../helpers/readFile");

test("MoviesByRaceGet returns movies with only matching race characters when race is found", async () => {
  const movieDocuments = getJSON(
    "../api/movies/_test/documents/movies-by-race-get-document.json",
  );

  const MovieModel = require("../models/movie");
  MovieModel.find = jest.fn().mockResolvedValue(movieDocuments);

  const req = {
    params: { race: "Dwarf" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  const expectedResponse = getJSON(
    "../api/movies/_test/json-responses/movies-by-race-get-response.json",
  );

  expect(body.length).toBe(expectedResponse.length);
  body.forEach((movie, i) => {
    expect(movie.title).toBe(expectedResponse[i].title);
    expect(movie.releaseYear).toBe(expectedResponse[i].releaseYear);
    expect(movie.characters).toEqual(expectedResponse[i].characters);
    movie.characters.forEach((c) => {
      expect(c.race.toLowerCase()).toBe("dwarf");
    });
  });
});

test("MoviesByRaceGet is case-insensitive when matching race", async () => {
  const movieDocuments = getJSON(
    "../api/movies/_test/documents/movies-by-race-get-document.json",
  );

  const MovieModel = require("../models/movie");
  MovieModel.find = jest.fn().mockResolvedValue(movieDocuments);

  const req = {
    params: { race: "dwarf" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  expect(body.length).toBe(4);
  body.forEach((movie) => {
    movie.characters.forEach((c) => {
      expect(c.race.toLowerCase()).toBe("dwarf");
    });
  });
});

test("MoviesByRaceGet returns 404 when no movies are found for the given race", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.find = jest.fn().mockResolvedValue([]);

  const req = {
    params: { race: "oompa loompa" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    error: "No movie(s) with characters of the oompa loompa race were found",
  });
});

test("MoviesByRaceGet returns 400 when no race is received", async () => {
  const MovieModel = require("../models/movie");

  const req = {
    params: { race: "" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: "No race received" });
});

test("MoviesByRaceGet returns 500 error when database is down", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.find = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = {
    params: { race: "Dwarf" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
