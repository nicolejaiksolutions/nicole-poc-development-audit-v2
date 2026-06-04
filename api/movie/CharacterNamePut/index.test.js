const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const { getJSON } = require("../../../helpers/readFile");

const MOVIE_ID = "690b9436fb29d9d76b2a0dc2";
const CHARACTER_ID = "690b95fda40dc2c8ce6c1946";

function makeMockMovie(characterFound = true) {
  const baseMovie = getJSON(
    "../api/movies/_test/documents/character-name-put-document.json",
  );
  const mockCharacter = characterFound
    ? { _id: CHARACTER_ID, name: "Helm" }
    : null;

  const characters = [...baseMovie.characters];
  characters.id = jest.fn().mockReturnValue(mockCharacter);

  return {
    ...baseMovie,
    characters,
    save: jest.fn().mockResolvedValue(true),
  };
}

test("CharacterNamePut returns 204 with no body when valid data is provided", async () => {
  const mockMovie = makeMockMovie(true);
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(mockMovie);

  const req = {
    body: { movieId: MOVIE_ID, characterId: CHARACTER_ID, name: "Olwyn" },
    header: {},
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(204);
  expect(mockMovie.save).toHaveBeenCalled();
  expect(res.send).toHaveBeenCalled();
});

test("CharacterNamePut returns 404 when movie is not found", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(null);

  const req = {
    body: {
      movieId: "000000000000000000000000",
      characterId: CHARACTER_ID,
      name: "Olwyn",
    },
    header: {},
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    error: "Movie not found for id 000000000000000000000000",
  });
});

test("CharacterNamePut returns 404 when character is not found", async () => {
  const mockMovie = makeMockMovie(false);
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(mockMovie);

  const req = {
    body: {
      movieId: MOVIE_ID,
      characterId: "000000000000000000000000",
      name: "Olwyn",
    },
    header: {},
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    error: "Character not found for id 000000000000000000000000",
  });
});

test("CharacterNamePut returns 406 when name has fewer than 3 characters", async () => {
  const mockMovie = makeMockMovie(true);
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(mockMovie);

  const req = {
    body: { movieId: MOVIE_ID, characterId: CHARACTER_ID, name: "Hi" },
    header: {},
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Character Name is not valid. It must be at least three characters.",
  });
});

test("CharacterNamePut returns 500 when a database error occurs", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = {
    body: { movieId: MOVIE_ID, characterId: CHARACTER_ID, name: "Olwyn" },
    header: {},
  };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
