CREATE TYPE PLAN_TYPE AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE USER_STATUS AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE MEMBERSHIP_ROLE AS ENUM ('admin', 'member', 'viewer');
CREATE TYPE MOVIE_STATUS AS ENUM ('draft', 'published', 'archived');

-- Organizations --
-- Organizations are the different organizations that will be using the backend service.
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  plan PLAN_TYPE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Users --
-- Users are the system users that will be using the backend service.
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  status USER_STATUS NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Memberships --
-- Memberships are the relation between users and organizations (with role for access control).
CREATE TABLE memberships (
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  role MEMBERSHIP_ROLE NOT NULL,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, organization_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Movies --
-- Movies are the audiovisual catalog entries per organization
CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  synopsis TEXT NOT NULL,
  release_year INT NOT NULL,
  duration_minutes INT NOT NULL,
  rating FLOAT DEFAULT NULL,
  status MOVIE_STATUS NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT unique_title_per_organization UNIQUE (title, organization_id),
  CONSTRAINT check_release_year_is_valid CHECK (release_year >= 1900 AND release_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
  CONSTRAINT rating_is_between_0_and_10 CHECK (rating >= 0 AND rating <= 10)
);

-- Genres --
-- Genres are the different genres that can be assigned to a movie. Can be hierarchical
CREATE TABLE genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID DEFAULT NULL,
  CONSTRAINT unique_name UNIQUE (name),
  FOREIGN KEY (parent_id) REFERENCES genres(id)
);

-- MovieGenres --
-- MovieGenres is the relation between a movie and a genre
CREATE TABLE movie_genres (
  movie_id UUID NOT NULL,
  genre_id UUID NOT NULL,
  PRIMARY KEY (movie_id, genre_id),
  FOREIGN KEY (movie_id) REFERENCES movies(id),
  FOREIGN KEY (genre_id) REFERENCES genres(id)
);

-- ViewEvents --
-- Playback/view event
CREATE TABLE view_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID NOT NULL,
  user_id UUID NOT NULL,
  viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  duration_seconds INT NOT NULL,
  FOREIGN KEY (movie_id) REFERENCES movies(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_view_events_movie_viewed_at ON view_events (movie_id, viewed_at);

-- Ratings --
-- User rating for a movie (one per user per movie)
CREATE TABLE ratings (
  user_id UUID NOT NULL,
  movie_id UUID NOT NULL,
  score INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, movie_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (movie_id) REFERENCES movies(id)
);

-- AuditLogs --
-- Audit trail per organization
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  actor_user_id UUID NOT NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(255) NOT NULL,
  entity_id UUID NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (actor_user_id) REFERENCES users(id)
);