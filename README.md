# poc-development-audit

A REST API for managing Middle Earth movies and their characters, built with Node.js, Express, and MongoDB.

---

## Table of Contents

- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
  - [Movies — Read Operations](#movies--read-operations)
  - [Movie — Write Operations](#movie--write-operations)
- [Helper Utilities](#helper-utilities)

---

## Data Models

### Movie

| Field         | Type     | Description                     |
| ------------- | -------- | ------------------------------- |
| `_id`         | ObjectId | Unique identifier               |
| `title`       | String   | Movie title                     |
| `name`        | String   | Alternate name field            |
| `releaseYear` | Number   | Year the movie was released     |
| `characters`  | Array    | List of characters in the movie |

### Character (embedded in Movie)

| Field  | Type     | Description                         |
| ------ | -------- | ----------------------------------- |
| `_id`  | ObjectId | Unique identifier                   |
| `name` | String   | Character's name                    |
| `race` | String   | Character's race (e.g. Hobbit, Elf) |

---

## API Endpoints

### Movies — Read Operations

Base path: `/api/movies`

---

#### `GET /api/movies/all`

**Handler:** `MoviesAllGet`

Returns all movies sorted by release year (ascending).

**Response**

| Status | Description                |
| ------ | -------------------------- |
| `200`  | Array of all movie objects |
| `500`  | Database error             |

---

#### `GET /api/movies/id/:id`

**Handler:** `MovieByIdGet`

Returns a single movie by its MongoDB ID.

**URL Parameters**

| Parameter | Type   | Description                   |
| --------- | ------ | ----------------------------- |
| `id`      | string | MongoDB ObjectId of the movie |

**Response**

| Status | Description                                        |
| ------ | -------------------------------------------------- |
| `200`  | Movie object with all details including characters |
| `400`  | No `_id` received                                  |
| `404`  | Movie not found                                    |
| `500`  | Database error                                     |

---

#### `GET /api/movies/movie-id/:movieId/characters`

**Handler:** `CharactersByMovieId`

Returns all characters belonging to a specific movie.

**URL Parameters**

| Parameter | Type   | Description     |
| --------- | ------ | --------------- |
| `movieId` | string | ID of the movie |

**Response**

| Status | Description                           |
| ------ | ------------------------------------- |
| `200`  | Array of character objects `{ name }` |
| `404`  | Movie not found                       |
| `500`  | Database error                        |

---

#### `GET /api/movies/all/characters`

**Handler:** `MoviesAllCharactersGet`

Returns all unique characters across every movie, deduplicated and sorted by movie release year.

**Response**

| Status | Description                                        |
| ------ | -------------------------------------------------- |
| `200`  | Array of unique character objects `{ name, race }` |
| `500`  | Database error                                     |

---

#### `GET /api/movies/character/:characterName/name`

**Handler:** `MoviesByCharacterNameGet`

Finds all movies containing a character with the given name (case-insensitive).

**URL Parameters**

| Parameter       | Type   | Description                         |
| --------------- | ------ | ----------------------------------- |
| `characterName` | string | Name of the character to search for |

**Response**

| Status | Description                                   |
| ------ | --------------------------------------------- |
| `200`  | Array of movies `{ _id, title, releaseYear }` |
| `400`  | No character name received                    |
| `404`  | No movies found for this character            |
| `500`  | Database error                                |

---

#### `GET /api/movies/by-race/:race`

**Handler:** `MoviesByRaceGet`

Finds all movies that contain characters of a specific race (case-insensitive).

**URL Parameters**

| Parameter | Type   | Description                                        |
| --------- | ------ | -------------------------------------------------- |
| `race`    | string | Character race to filter by (e.g. `Hobbit`, `Elf`) |

**Response**

| Status | Description                                                                        |
| ------ | ---------------------------------------------------------------------------------- |
| `200`  | Array of movies `{ _id, title, releaseYear, characters }` with filtered characters |
| `400`  | No race received                                                                   |
| `404`  | No movies found for this race                                                      |
| `500`  | Database error                                                                     |

---

#### `GET /api/movies/between/:startReleaseYear/and/:endReleaseYear`

**Handler:** `MoviesByReleaseYearsGet`

Finds all movies released between two years (inclusive). Both years must be in the range 2000–2020.

**URL Parameters**

| Parameter          | Type   | Description            |
| ------------------ | ------ | ---------------------- |
| `startReleaseYear` | number | Start year (2000–2020) |
| `endReleaseYear`   | number | End year (2000–2020)   |

**Response**

| Status | Description                                    |
| ------ | ---------------------------------------------- |
| `200`  | Sorted array of movies within the year range   |
| `404`  | No movies found                                |
| `406`  | Invalid year format or year out of valid range |
| `500`  | Database error                                 |

---

#### `GET /api/movies/movie-id/:movieId/character-name/:characterName`

**Handler:** `NamesById`

Returns the details of a specific character from a specific movie, matched by character name (case-insensitive).

**URL Parameters**

| Parameter       | Type   | Description           |
| --------------- | ------ | --------------------- |
| `movieId`       | string | ID of the movie       |
| `characterName` | string | Name of the character |

**Response**

| Status | Description                              |
| ------ | ---------------------------------------- |
| `200`  | Character object `{ movie, name, race }` |
| `404`  | Movie not found or character not found   |
| `500`  | Database error                           |

---

### Movie — Write Operations

Base path: `/api/movie`

---

#### `POST /api/movie/add`

**Handler:** `MovieAddPost`

Creates a new movie.

**Request Body**

| Field         | Type   | Required | Validation                    |
| ------------- | ------ | -------- | ----------------------------- |
| `movieName`   | string | Yes      | Minimum 3 characters          |
| `releaseYear` | number | Yes      | Between 1990 and current year |

**Response**

| Status | Description                                                     |
| ------ | --------------------------------------------------------------- |
| `200`  | Created movie object with `_id`                                 |
| `406`  | Missing movie name, invalid movie name, or invalid release year |
| `500`  | Database error                                                  |

---

#### `PUT /api/movie/name/update`

**Handler:** `MovieNamePut`

Updates a movie's title.

**Request Body**

| Field       | Type   | Required | Validation                   |
| ----------- | ------ | -------- | ---------------------------- |
| `movieId`   | string | Yes      | Must match an existing movie |
| `movieName` | string | Yes      | Minimum 3 characters         |

**Response**

| Status | Description                                             |
| ------ | ------------------------------------------------------- |
| `204`  | Success (no content)                                    |
| `404`  | Movie not found                                         |
| `406`  | Movie name is not valid (must be at least 3 characters) |
| `500`  | Database error                                          |

---

#### `POST /api/movie/character/add`

**Handler:** `CharacterAddPost`

Adds a new character to a movie. Movie and character name are provided in the request body.

**Request Body**

| Field           | Type   | Required | Validation                   |
| --------------- | ------ | -------- | ---------------------------- |
| `movieId`       | string | Yes      | Must match an existing movie |
| `characterName` | string | Yes      | Minimum 3 characters         |

**Response**

| Status | Description                                                 |
| ------ | ----------------------------------------------------------- |
| `200`  | Updated movie object with the new character                 |
| `404`  | Movie not found or no character name provided               |
| `406`  | Character name is not valid (must be at least 3 characters) |
| `500`  | Database error                                              |

---

#### `POST /api/movie/:movie_id/character/:mainCharacterName/add`

**Handler:** `CharacterByParamsAddPost`

Adds a new character to a movie using URL parameters.

**URL Parameters**

| Parameter           | Type   | Description                                         |
| ------------------- | ------ | --------------------------------------------------- |
| `movie_id`          | string | ID of the movie                                     |
| `mainCharacterName` | string | Name of the character to add (minimum 3 characters) |

**Response**

| Status | Description                                                 |
| ------ | ----------------------------------------------------------- |
| `200`  | Updated movie object                                        |
| `404`  | Movie not found                                             |
| `406`  | Character name is not valid (must be at least 3 characters) |
| `500`  | Database error                                              |

---

#### `PUT /api/movie/character/update`

**Handler:** `CharacterNamePut`

Updates an existing character's name. Movie ID, character ID, and new name are provided in the request body.

**Request Body**

| Field         | Type   | Required | Validation                                    |
| ------------- | ------ | -------- | --------------------------------------------- |
| `movieId`     | string | Yes      | Must match an existing movie                  |
| `characterId` | string | Yes      | Must match an existing character in the movie |
| `name`        | string | Yes      | Minimum 3 characters                          |

**Response**

| Status | Description                                                 |
| ------ | ----------------------------------------------------------- |
| `204`  | Success (no content)                                        |
| `404`  | Movie not found or character not found                      |
| `406`  | Character name is not valid (must be at least 3 characters) |
| `500`  | Database error                                              |

---

#### `PUT /api/movie/:movieId/character/:characterId/name/:characterName/update`

**Handler:** `CharacterNameByParamsPut`

Updates an existing character's name using URL parameters.

**URL Parameters**

| Parameter       | Type   | Description                               |
| --------------- | ------ | ----------------------------------------- |
| `movieId`       | string | ID of the movie                           |
| `characterId`   | string | ID of the character to update             |
| `characterName` | string | New character name (minimum 3 characters) |

**Response**

| Status | Description                                                 |
| ------ | ----------------------------------------------------------- |
| `204`  | Success (no content)                                        |
| `404`  | Movie not found or character not found                      |
| `406`  | Character name is not valid (must be at least 3 characters) |
| `500`  | Database error                                              |

---

#### `POST /api/movie/add/characters`

**Handler:** `CharacterToMoviesAddPost`

Adds a character to multiple movies in a single request.

**Request Body**

| Field                 | Type     | Required | Description             |
| --------------------- | -------- | -------- | ----------------------- |
| `movies`              | string[] | Yes      | Array of movie IDs      |
| `characterToAdd`      | object   | Yes      | Character object to add |
| `characterToAdd.id`   | string   | Yes      | Character's unique ID   |
| `characterToAdd.name` | string   | Yes      | Character's name        |
| `characterToAdd.race` | string   | Yes      | Character's race        |

**Response**

| Status | Description                                         |
| ------ | --------------------------------------------------- |
| `201`  | Created (no content)                                |
| `406`  | Character cannot be added (missing required fields) |
| `500`  | Database error                                      |

---

## Helper Utilities

### `asExpressRoute(route)`

Converts Azure Functions-style route notation (`{param}`) to Express-style route notation (`:param`). Prepends `/` if missing.

**Example:**

```
"user/{id}/role/{roleId}" → "/user/:id/role/:roleId"
```

---

### `findRoutes(directory)`

Recursively scans a directory for route configurations. Reads each subdirectory's `route.yaml`, converts routes using `asExpressRoute`, and returns an array sorted by route path.

**Returns:** `Array<{ name, entrypoint, method, route }>`

---

### `mountRoute(app, prefix, routeConfig)`

Registers a route handler with the Express application. Constructs the full path as `/api/{prefix}/{route}`, dynamically requires the handler, and wraps it with error catching (returning a `500` response on unhandled errors).

---

### `makeInjectable(config, func)`

A simple dependency injection wrapper for route handlers. Returns the wrapped function and exposes an `.inject({...})` method for overriding dependencies in tests.

---

### `makeMockRes()`

Creates a mock Express response object for unit testing. Returns an object with `status()`, `json()`, and `send()` methods mocked with Jest.

---

### `readFile.getJSON(filePath)`

Reads and parses a JSON file synchronously. Resolves the path relative to the helper directory.

**Returns:** Parsed JSON object
