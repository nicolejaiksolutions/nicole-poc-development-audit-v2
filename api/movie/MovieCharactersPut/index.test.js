const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

function makeMockMovie(characters) {
  return {
    characters,
    save: jest.fn().mockResolvedValue(true),
  };
}

const MOVIE_ID = "69efd1c1b2f8c7327f029fad";
const CHAR_ID_1 = "6a1e03d0a7e982d8b6bc2a82";
const CHAR_ID_2 = "6a1e03d6c1b6526312a05de1";

test("MovieCharactersPut adds a character that does not exist", async () => {
  const MovieModel = require("../../movies/models/movie");
  const mockMovie = makeMockMovie([]);
  MovieModel.findById = jest.fn().mockResolvedValue(mockMovie);

  const req = {
    body: {
      _id: MOVIE_ID,
      characters: [{ _id: CHAR_ID_1, name: "Frodo Baggins", race: "Hobbit" }],
    },
    header: {},
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.characters[0].status).toBe("ADDED");
  expect(mockMovie.save).toHaveBeenCalledTimes(1);
});

test("MovieCharactersPut marks NOT ADDED when _id, name, and race all match", async () => {
  const MovieModel = require("../../movies/models/movie");
  const mockMovie = makeMockMovie([
    {
      _id: { toString: () => CHAR_ID_1 },
      name: "Frodo Baggins",
      race: "Hobbit",
    },
  ]);
  MovieModel.findById = jest.fn().mockResolvedValue(mockMovie);

  const req = {
    body: {
      _id: MOVIE_ID,
      characters: [{ _id: CHAR_ID_1, name: "Frodo Baggins", race: "Hobbit" }],
    },
    header: {},
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.characters[0].status).toBe("NOT ADDED");
});

test("MovieCharactersPut marks UPDATED when _id matches but name or race differs", async () => {
  const MovieModel = require("../../movies/models/movie");
  const mockMovie = makeMockMovie([
    {
      _id: { toString: () => CHAR_ID_1 },
      name: "Frodo Baggins",
      race: "Hobbit",
    },
  ]);
  MovieModel.findById = jest.fn().mockResolvedValue(mockMovie);

  const req = {
    body: {
      _id: MOVIE_ID,
      characters: [
        { _id: CHAR_ID_1, name: "Frodo Baggins Updated", race: "Hobbit" },
      ],
    },
    header: {},
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.characters[0].status).toBe("UPDATED");
});

test("MovieCharactersPut handles mixed ADDED, UPDATED, and NOT ADDED statuses", async () => {
  const MovieModel = require("../../movies/models/movie");
  const mockMovie = makeMockMovie([
    {
      _id: { toString: () => CHAR_ID_1 },
      name: "Frodo Baggins",
      race: "Hobbit",
    },
    { _id: { toString: () => CHAR_ID_2 }, name: "Gandalf", race: "Wizard" },
  ]);
  MovieModel.findById = jest.fn().mockResolvedValue(mockMovie);

  const NEW_CHAR_ID = "6a1e03dc3c961cfb2829658d";
  const req = {
    body: {
      _id: MOVIE_ID,
      characters: [
        { _id: CHAR_ID_1, name: "Frodo Baggins", race: "Hobbit" }, // NOT ADDED
        { _id: CHAR_ID_2, name: "Gandalf the White", race: "Wizard" }, // UPDATED
        { _id: NEW_CHAR_ID, name: "Aragorn", race: "Man" }, // ADDED
      ],
    },
    header: {},
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.characters[0].status).toBe("NOT ADDED");
  expect(body.characters[1].status).toBe("UPDATED");
  expect(body.characters[2].status).toBe("ADDED");
});

test("MovieCharactersPut returns 404 when movie is not found", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(null);

  const req = {
    body: {
      _id: MOVIE_ID,
      characters: [{ _id: CHAR_ID_1, name: "Frodo", race: "Hobbit" }],
    },
    header: {},
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieCharactersPut returns 400 when no movie ID is provided", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    body: { characters: [{ _id: CHAR_ID_1, name: "Frodo", race: "Hobbit" }] },
    header: {},
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie ID received" });
});
