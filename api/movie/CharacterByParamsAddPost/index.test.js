const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const { getJSON } = require("../../../helpers/readFile");

test("CharacterByParamsAddPost adds a character and returns 200 with the updated movie object", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/character-by-params-add-post-document.json",
  );

  const mockMovie = {
    ...movieDocument,
    characters: [...movieDocument.characters],
    save: jest.fn().mockResolvedValue(true),
  };

  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(mockMovie);

  const req = {
    params: {
      movie_id: "690b9436fb29d9d76b2a0dc2",
      mainCharacterName: "Olwyn",
    },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(mockMovie.save).toHaveBeenCalled();

  const body = res.json.mock.calls[0][0];
  expect(body.characters.map((c) => c.name)).toContain("Olwyn");
});

test("CharacterByParamsAddPost returns 406 when character name is less than 3 characters", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    params: { movie_id: "690b9436fb29d9d76b2a0dc2", mainCharacterName: "AB" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error:
      "Main Character Name is not valid. It must be at least three characters.",
  });
});

test("CharacterByParamsAddPost returns 404 when no movie is found with the given _id", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(null);

  const req = {
    params: {
      movie_id: "000000000000000000000000",
      mainCharacterName: "Olwyn",
    },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharacterByParamsAddPost returns 500 error when database is down", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = {
    params: {
      movie_id: "690b9436fb29d9d76b2a0dc2",
      mainCharacterName: "Olwyn",
    },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
