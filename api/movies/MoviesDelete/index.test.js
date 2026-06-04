const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

test("MoviesDelete deletes all movies and returns 204", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.deleteMany = jest
    .fn()
    .mockResolvedValue({ acknowledged: true, deletedCount: 6 });

  const req = { header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(MovieModel.deleteMany).toHaveBeenCalledWith({});
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalled();
});

test("MoviesDelete returns 500 when database is down", async () => {
  const MovieModel = require("../models/movie");
  MovieModel.deleteMany = jest
    .fn()
    .mockRejectedValue(new Error("DB connection failed"));

  const req = { header: {} };
  const res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
