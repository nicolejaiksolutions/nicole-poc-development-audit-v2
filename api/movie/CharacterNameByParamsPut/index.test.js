const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const { getJSON } = require("../../../helpers/readFile");

const MOVIE_ID = "69efd1c1b2f8c7327f029fae";
const CHARACTER_ID = "6a15b4f20a41fb7270ce2f3e";

function buildMockMovie({ charactersIdFn } = {}) {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/character-name-by-params-put-document.json",
  );

  const character = { _id: CHARACTER_ID, name: "Gollum" };

  const characters = [character];
  characters.id = charactersIdFn ?? jest.fn((id) => (String(id) === String(CHARACTER_ID) ? character : null));

  return {
    ...movieDocument,
    characters,
    save: jest.fn().mockResolvedValue(true),
  };
}

test("CharacterNameByParamsPut updates character name and returns 204 with no body", async () => {
  const mockMovie = buildMockMovie();
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(mockMovie);

  const req = {
    params: {
      movieId: MOVIE_ID,
      characterId: CHARACTER_ID,
      characterName: "Smeagol",
    },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();
  expect(mockMovie.save).toHaveBeenCalled();
});

test("CharacterNameByParamsPut returns 406 when character name is less than 3 characters", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    params: {
      movieId: MOVIE_ID,
      characterId: CHARACTER_ID,
      characterName: "AB",
    },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Character Name is not valid. It must be at least three characters.",
  });
});

test("CharacterNameByParamsPut returns 404 when movie is not found", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(null);

  const req = {
    params: {
      movieId: "000000000000000000000000",
      characterId: CHARACTER_ID,
      characterName: "Smeagol",
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

test("CharacterNameByParamsPut returns 404 when character is not found", async () => {
  const mockMovie = buildMockMovie({
    charactersIdFn: jest.fn(() => null),
  });
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(mockMovie);

  const req = {
    params: {
      movieId: MOVIE_ID,
      characterId: "000000000000000000000000",
      characterName: "Smeagol",
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

test("CharacterNameByParamsPut returns 500 when database throws an error", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = {
    params: {
      movieId: MOVIE_ID,
      characterId: CHARACTER_ID,
      characterName: "Smeagol",
    },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
