const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const { getJSON } = require("../../../helpers/readFile");

const CHARACTER_TO_ADD = {
  id: "6a15b1d58291c3d1a98c2ac1",
  name: "Dave Jones",
  race: "Man",
};

const MOVIE_IDS = ["69efd1c1b2f8c7327f029fae", "69efd1c1b2f8c7327f029fb1"];

function makeMockMovie(doc) {
  return {
    ...doc,
    characters: [...doc.characters],
    save: jest.fn().mockResolvedValue(true),
  };
}

test("CharacterToMoviesAddPost returns 201 and adds character only to movies where it is not already present", async () => {
  const [doc1, doc2] = getJSON(
    "../api/movies/_test/documents/character-to-movies-add-post-document.json",
  );

  const movie1 = makeMockMovie(doc1); // Dave Jones NOT present
  const movie2 = makeMockMovie(doc2); // Dave Jones already present

  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest
    .fn()
    .mockResolvedValueOnce(movie1)
    .mockResolvedValueOnce(movie2);

  const req = {
    body: { movies: MOVIE_IDS, characterToAdd: CHARACTER_TO_ADD },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.send).toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();

  expect(movie1.save).toHaveBeenCalled();
  expect(movie1.characters.some((c) => c.name === "Dave Jones")).toBe(true);

  expect(movie2.save).not.toHaveBeenCalled();
});

test("CharacterToMoviesAddPost returns 201 without error when a movie does not exist", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest.fn().mockResolvedValue(null);

  const req = {
    body: {
      movies: ["000000000000000000000000"],
      characterToAdd: CHARACTER_TO_ADD,
    },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.send).toHaveBeenCalled();
});

test("CharacterToMoviesAddPost returns 406 when characterToAdd is missing id", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    body: {
      movies: MOVIE_IDS,
      characterToAdd: { name: "Dave Jones", race: "Man" },
    },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Your character can not be added.",
  });
});

test("CharacterToMoviesAddPost returns 406 when characterToAdd is missing name", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    body: {
      movies: MOVIE_IDS,
      characterToAdd: { id: "6a15b1d58291c3d1a98c2ac1", race: "Man" },
    },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Your character can not be added.",
  });
});

test("CharacterToMoviesAddPost returns 406 when characterToAdd is missing race", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    body: {
      movies: MOVIE_IDS,
      characterToAdd: { id: "6a15b1d58291c3d1a98c2ac1", name: "Dave Jones" },
    },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Your character can not be added.",
  });
});

test("CharacterToMoviesAddPost returns 406 when characterToAdd is missing entirely", async () => {
  const MovieModel = require("../../movies/models/movie");

  const req = {
    body: { movies: MOVIE_IDS },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Your character can not be added.",
  });
});

test("CharacterToMoviesAddPost returns 500 when a database error occurs", async () => {
  const MovieModel = require("../../movies/models/movie");
  MovieModel.findById = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const req = {
    body: { movies: MOVIE_IDS, characterToAdd: CHARACTER_TO_ADD },
    header: {},
  };

  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
