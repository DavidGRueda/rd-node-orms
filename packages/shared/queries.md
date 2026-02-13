# 📋 Query & Endpoint Specification

This document lists the **necessary** endpoints and query patterns for ORM comparison, derived from the domain in `domain.md` and `schema.sql`. It covers CRUD, soft deletes, partial updates, many-to-many, composite keys, list-with-relations (N+1), and aggregates.

**Conventions**

- All list endpoints are **tenant-scoped** by `organization_id` unless otherwise noted.
- Soft-deleted rows (`deleted_at IS NOT NULL`) are excluded from reads unless explicitly required.
- IDs are UUIDs unless stated otherwise.

---

## 1. 🏢 Organizations

| Method   | Path / operation     | Description                         | N+1 / complexity |
| -------- | -------------------- | ----------------------------------- | ---------------- |
| `GET`    | `/organizations/:id` | Get one organization by id          | —                |
| `POST`   | `/organizations`     | Create organization                 | —                |
| `PATCH`  | `/organizations/:id` | **Partial update** (`name`, `plan`) | —                |
| `DELETE` | `/organizations/:id` | Soft delete (`deleted_at`)          | —                |

---

## 2. 👤 Users

| Method  | Path / operation | Description                            | N+1 / complexity |
| ------- | ---------------- | -------------------------------------- | ---------------- |
| `GET`   | `/users/:id`     | Get one user by id                     | —                |
| `POST`  | `/users`         | Create user                            | —                |
| `PATCH` | `/users/:id`     | **Partial update** (`email`, `status`) | —                |

---

## 3. 🔗 Memberships (users ↔ organizations)

| Method   | Path / operation                            | Description                                              | N+1 / complexity                                          |
| -------- | ------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------- |
| `GET`    | `/organizations/:orgId/memberships`         | List memberships for org (**include user** to avoid N+1) | **N+1 risk**: resolving `user` per row without eager load |
| `GET`    | `/organizations/:orgId/memberships/:userId` | Get one membership (composite key)                       | —                                                         |
| `POST`   | `/organizations/:orgId/memberships`         | Create membership (`user_id`, `organization_id`, `role`) | —                                                         |
| `PATCH`  | `/organizations/:orgId/memberships/:userId` | **Partial update** (`role` only)                         | —                                                         |
| `DELETE` | `/organizations/:orgId/memberships/:userId` | Delete membership (hard delete)                          | —                                                         |

---

## 4. 🎬 Movies (catalog)

| Method   | Path / operation                   | Description                                                                                                                 | N+1 / complexity                                                           |
| -------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `GET`    | `/organizations/:orgId/movies/:id` | Get one movie by id (tenant-scoped)                                                                                         | —                                                                          |
| `GET`    | `/organizations/:orgId/movies`     | List movies (filter: status, year, search; sort; paginate). **Include genres** in same query to avoid N+1.                  | **N+1 risk**: loading genres per movie in a loop                           |
| `POST`   | `/organizations/:orgId/movies`     | Create movie; body may include `genre_ids` (bulk insert movie_genres)                                                       | **Complex**: insert movie + bulk insert movie_genres                       |
| `PATCH`  | `/organizations/:orgId/movies/:id` | **Partial update** (`title`, `synopsis`, `release_year`, `duration_minutes`, `rating`, `status`; optionally replace genres) | **Complex**: update movie + optional replace of movie_genres (transaction) |
| `DELETE` | `/organizations/:orgId/movies/:id` | Soft delete movie                                                                                                           | —                                                                          |

---

## 5. 🏷️ Genres

| Method | Path / operation | Description                                 | N+1 / complexity                                          |
| ------ | ---------------- | ------------------------------------------- | --------------------------------------------------------- |
| `GET`  | `/genres/:id`    | Get one genre (global; no tenant)           | —                                                         |
| `GET`  | `/genres`        | List genres (flat or tree by `parent_id`)   | **Complex**: hierarchy in one or two queries to avoid N+1 |
| `POST` | `/genres`        | Create genre (`name`, optional `parent_id`) | —                                                         |

---

## 6. 👁️ View events

| Method | Path / operation                                    | Description                                                                                              | N+1 / complexity                         |
| ------ | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `POST` | `/view-events`                                      | Create view event (`movie_id`, `user_id`, `viewed_at`, `duration_seconds`)                               | —                                        |
| `GET`  | `/organizations/:orgId/movies/:movieId/view-events` | List view events for movie (use index `(movie_id, viewed_at)`); paginate. **Include user** to avoid N+1. | **N+1 risk**: resolving `user` per event |
| `GET`  | `/organizations/:orgId/movies/:movieId/stats`       | **Aggregate**: view count, total duration, unique users for movie                                        | **Complex**: group by movie              |

---

## 7. ⭐ Ratings

| Method | Path / operation                                | Description                                                        | N+1 / complexity                          |
| ------ | ----------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| `GET`  | `/users/:userId/ratings/:movieId`               | Get one rating (composite key)                                     | —                                         |
| `GET`  | `/organizations/:orgId/movies/:movieId/ratings` | List ratings for movie (**include user** to avoid N+1)             | **N+1 risk**: resolving `user` per rating |
| `PUT`  | `/users/:userId/ratings/:movieId`               | Upsert rating (create or replace; unique on `user_id`, `movie_id`) | —                                         |

---

## 8. ✏️ Partial update summary

Endpoints that support **PATCH** with a subset of fields:

- **organizations**: `name`, `plan`
- **users**: `email`, `status`
- **memberships**: `role`
- **movies**: `title`, `synopsis`, `release_year`, `duration_minutes`, `rating`, `status` (and optionally genre set)
- **ratings**: use PUT upsert for `score` (no separate PATCH required for minimum set)

---

## 9. ⚠️ N+1 risk summary

| Area                        | Risk                               | Mitigation                                                        |
| --------------------------- | ---------------------------------- | ----------------------------------------------------------------- |
| List movies                 | Load genres per movie in a loop    | Include genres in list query (join movie_genres + genres)         |
| List memberships            | Load user per row                  | Eager load `user` in list query                                   |
| List view events (by movie) | Load user per event                | Eager load `user` in list query                                   |
| List ratings (by movie)     | Load user per rating               | Eager load `user` in list query                                   |
| List genres (tree)          | Load children per parent in a loop | Single query for all genres + build tree in app, or recursive CTE |

---

## 10. 🔑 Index and constraint usage

- **view_events**: Use index `(movie_id, viewed_at)` for list-by-movie and time-range filters.
- **ratings**: Unique on `(user_id, movie_id)`; use for upsert and get-one.
- **movies**: Unique on `(title, organization_id)`; use for create/update uniqueness checks.
- **Multi-tenancy**: Tenant-scoped reads/writes must filter by `organization_id` and respect soft deletes where applicable.
