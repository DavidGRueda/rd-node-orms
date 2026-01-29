# 🗄️ Frozen SQL Domain Specification

## 📖 Overview

This document serves as the **single source of truth** for the SQL database schema used across all ORM implementations in this research project. By "freezing" the domain model here, we ensure fair and consistent comparison between different ORMs while eliminating schema drift as a variable in our evaluation.

## 🎯 Purpose

When comparing ORMs, one of the most significant challenges is ensuring that each implementation operates against an identical database structure. Without a frozen specification, subtle differences in table definitions, relationships, constraints, or indexing strategies can skew performance benchmarks and complicate architectural analysis.

This document establishes:

- **🔒 Schema consistency**: All ORMs must create tables that match this specification exactly
- **⚖️ Fair benchmarking**: Performance comparisons are based on ORM capabilities, not schema variations
- **📋 Clear contracts**: Developers implementing each ORM have a definitive reference for data modeling
- **🔄 Reproducibility**: Anyone recreating this research can reference the exact schema used

## 💡 Principles

1. **🌐 ORM-agnostic specification**: This domain is defined in SQL/database terms, not ORM-specific syntax
2. **🧊 Immutability**: Once defined, this schema should not change without versioning and documentation
3. **✅ Completeness**: All tables, columns, data types, constraints, indexes, and relationships are explicitly defined
4. **🏗️ Real-world complexity**: The domain reflects realistic application requirements, not trivial examples

## 📚 How to Use This Specification

Each ORM implementation (Prisma, Drizzle, TypeORM, etc.) must:

1. **🎨 Model creation**: Define entities/models that produce this exact schema
2. **🚀 Migration generation**: Use the ORM's migration tools to generate schema changes
3. **✔️ Validation**: Verify the generated SQL matches this specification
4. **🧪 Testing**: Ensure all constraints, indexes, and relationships are properly created

If an ORM cannot represent a specific constraint or feature defined here, this should be:

- 📝 Documented as a limitation in that ORM's evaluation
- 🛠️ Implemented using raw SQL migrations if possible
- 📊 Noted in the comparison analysis

---

## 🏛️ Domain Definition

The following sections define the complete database schema that all ORM implementations must adhere to:

> The backend service that will be developed will be used to manage a multi-tentant audiovisual catalog with access
> control, metrics and audits. Applicable to streaming platforms, Catalog management SaaS or backend for cinemas or
> movie distributors.

#### Enums

- **PLAN_TYPE**: `free`, `pro`, `enterprise` (organizations.plan)
- **USER_STATUS**: `active`, `inactive`, `pending` (users.status)
- **MEMBERSHIP_ROLE**: `admin`, `member`, `viewer` (memberships.role)
- **MOVIE_STATUS**: `draft`, `published`, `archived` (movies.status)

#### 1 Access and organization

1. **organizations**: the different organizations that will be using the backend service. Formed by:
   `id, name, plan (PLAN_TYPE), created_at, deleted_at`

2. **users**: system users. Formed by:
   `id, email, status (USER_STATUS), created_at, deleted_at`

3. **memberships**: relation users ↔ organizations (composite key). Formed by:
   `user_id, organization_id, role (MEMBERSHIP_ROLE), joined_at`

#### 2 Audiovisual catalog

4. **movies**: audiovisual catalog entries per organization. Formed by:
   `id, organization_id, title, release_year, duration_minutes, rating, status (MOVIE_STATUS), created_at, deleted_at`

5. **genres**: hierarchical genre structure. Formed by:
   `id, name, parent_id`

6. **movie_genres**: relation movies ↔ genres. Formed by:
   `movie_id, genre_id`

#### 3 Metrics and audits

7. **view_events**: playback/view event. Formed by:
   `id, movie_id, user_id, viewed_at, duration_seconds` — **INDEX (movie_id, viewed_at)** for listing views by movie and time

8. **ratings**: user rating for a movie (composite key). One rating per user per movie. Formed by:
   `user_id, movie_id, score, created_at` — **UNIQUE (user_id, movie_id)**

9. **audit_logs**: audit trail per organization. Formed by:
   `id, organization_id, actor_user_id, action, entity_type, entity_id, payload (JSONB), created_at`
   - **Payload (JSONB)** — action-specific data and state; do not duplicate `entity_id` or `actor_user_id`. Use a consistent shape per `entity_type` + `action`:
     - **Creates**: key fields of the new entity (e.g. `{ "title": "Inception", "release_year": 2010, "status": "draft" }` for movie; `{ "score": 8 }` for rating).
     - **Updates**: before/after or changes only (e.g. `{ "before": { "status": "draft" }, "after": { "status": "published" } }` or `{ "changes": { "status": { "from": "draft", "to": "published" } } }`).
     - **Deletes** (hard or soft): snapshot of the entity before deletion (e.g. `{ "deleted": { "title": "Inception", "status": "published" } }`).
     - **Optional context**: add a `meta` object for request context (e.g. `ip`, `user_agent`) when useful.

## ⚠️ Requisites for all ORMs

### Multi-tenancy

- Mandatory `organization_id`
- Systematic filters by tenant

### Soft deletes

- deleted_at on main entities

### Real constraints

- At least one composite index (e.g. view_events: `(movie_id, viewed_at)`)
- Unique constraints
- Explicit foreign keys
