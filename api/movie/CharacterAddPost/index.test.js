const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const { getJSON } = require("../../../helpers/readFile");

test("CharacterAddPost returns 200 with updated movie when valid data is provided", async () => {
  const baseMovie = getJSON(
    "../api/movies/_test/documents/character-add-post-document.json",
  );
  const movieMock = {
    ...baseMovie,
    characters: [...(baseMovie.characters || [])],
    save: jest.fn().mockResolvedValue(true),
  };

  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(movieMock);

  const req = {
    body: { movieId: "690b9436fb29d9d76b2a0dc2", characterName: "Helm" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(movieMock.save).toHaveBeenCalled();

  const body = res.json.mock.calls[0][0];
  const expectedResponse = getJSON(
    "../api/movies/_test/json-responses/character-add-post-response.json",
  );

  expect(body.title).toBe(expectedResponse.title);
  expect(body.releaseYear).toBe(expectedResponse.releaseYear);
  expect(body.characters.some((c) => c.name === "Helm")).toBe(true);
});

test("CharacterAddPost returns 404 when movieId is not found", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(null);

  const req = {
    body: { movieId: "000000000000000000000000", characterName: "Helm" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharacterAddPost returns 404 when characterName is missing", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    body: { movieId: "690b9436fb29d9d76b2a0dc2" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    error: "No Main Character Name Provided",
  });
});

test("CharacterAddPost returns 406 when characterName has fewer than 3 characters", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    body: { movieId: "690b9436fb29d9d76b2a0dc2", characterName: "Hi" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Character Name is not valid. It must be at least three characters.",
  });
});

test("CharacterAddPost returns 500 when a database error occurs", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = {
    body: { movieId: "690b9436fb29d9d76b2a0dc2", characterName: "Helm" },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
