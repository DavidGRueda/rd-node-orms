# 📋 General Architectural Decision Records

## Table of Contents

- [Overview](#-overview)
- [Purpose](#-purpose)
- [ADR Format](#-adr-format)
- [Decisions](#decisions)

## 🎯 Overview

This document serves as a central index and summary of all architectural decisions made during the development of the Node.js ORM R&D project. Each decision is recorded to maintain transparency, facilitate knowledge sharing, and provide context for future development and maintenance.

## 🎓 Purpose

The goal of this research project is to compare Node.js ORMs and evaluate real-world trade-offs in:

- **Complexity**: Developer experience, learning curve, and code maintainability
- **Performance**: Query efficiency, connection pooling, and resource utilization
- **Maintainability**: Type safety, migration systems, and long-term sustainability
- **Architecture Suitability**: Compatibility with serverless and traditional architectures

This ADR document captures key decisions that shape the research methodology, implementation approach, and evaluation criteria.

## 📝 ADR Format

Each architectural decision record follows this structure:

- **Context**: The issue or requirement motivating the decision
- **Decision**: The change or approach being proposed
- **Consequences**: The resulting context after applying the decision (both positive and negative)
- **Implementation Notes**: If they apply.

## Decisions

- [ADR-001: Lightweight Monorepo Structure with Per-ORM Package Isolation](#adr-001)
- [ADR-002: Single Service with Route-Based ORM Selection](#adr-002)

### <a id="adr-001"></a>📦 ADR-001: Lightweight Monorepo Structure with Per-ORM Package Isolation (2026-01-14)

#### 1️⃣ Context

When comparing multiple ORMs in a single research project, we need to decide on a code organization strategy that allows fair evaluation while maintaining clarity and isolation between different implementations. The main challenges are:

- Each ORM has its own dependencies and configuration requirements
- We need to ensure each ORM implementation is tested under comparable conditions
- The project should be easy to navigate and understand
- Dependencies from one ORM shouldn't interfere with another's evaluation

#### 2️⃣ Decision

We will use a **lightweight monorepo structure** with:

- A root `package.json` for shared tooling and scripts
- Individual `package.json` files for each ORM implementation
- Separate directories for each ORM under evaluation

#### 3️⃣ Consequences

##### Positive ✅

- **Clear architectural boundaries**: Each ORM's implementation is self-contained and easy to locate
- **Less magic**: No hidden configurations or complex build orchestration—what you see is what you get
- **Independent versioning**: Each ORM can use its preferred/required versions without conflicts
- **Easier onboarding**: Contributors can focus on one ORM at a time without understanding the entire project
- **Better reproducibility**: Clear dependency trees per ORM make benchmarks more trustworthy

##### Negative ⚠️

- **More folders**: Additional directory structure compared to a flat layout
- **Potential duplication**: Shared utilities or types might need to be duplicated or extracted to a common package
- **Slightly more setup**: Need to configure workspace in root `package.json`

##### Neutral 🔄

- Requires understanding of npm/pnpm workspaces (industry-standard knowledge)
- More `package.json` files to maintain (but each is focused and minimal)

#### 4️⃣ Implementation Notes

- Use `pnpm` workspaces for efficient disk usage and strict dependency isolation
- Root `package.json` should contain only shared dev tools (TypeScript, testing, linting)
- Each ORM package should include its own test suite using the same test scenarios

### <a id="adr-002"></a>📦 ADR-002: Single Service with Route-Based ORM Selection (2026-01-14)

#### 1️⃣ Context

With multiple ORM implementations isolated in separate packages, we need a way to expose and test each ORM's capabilities through a unified interface. The main considerations are:

- Each ORM implementation needs to be accessible for benchmarking and testing
- We want to maintain a consistent API surface across different ORMs for fair comparison
- The service should be simple to deploy and run without managing multiple processes
- Each ORM's configuration should remain isolated in its respective package
- We need a clear, predictable routing strategy that makes it obvious which ORM is being used

#### 2️⃣ Decision

We will implement a **single Fastify service** that routes requests to different ORM implementations based on URL path prefixes:

- Route structure: `/<orm-name>/<resource>` (e.g., `/prisma/movies`, `/drizzle/users`, `/typeorm/movies`)
- Each ORM's configuration and setup lives in its respective package under `packages/`
- The service imports and initializes each ORM package independently
- The service acts as a thin routing layer, delegating to the appropriate ORM implementation

#### 3️⃣ Consequences

##### Positive ✅

- **Simplified deployment**: Single process to manage instead of multiple services
- **Consistent benchmarking**: All ORMs run under identical runtime conditions (same Node.js process, same server framework)
- **Clear separation of concerns**: Service layer handles routing, packages handle ORM-specific logic
- **Easy comparison**: Switch between ORMs by simply changing the URL path
- **Reduced infrastructure complexity**: One port, one container, one health check
- **Natural namespace**: URL structure makes it immediately clear which ORM is handling the request

##### Negative ⚠️

- **Shared memory space**: All ORMs run in the same process, which could affect memory benchmarks
- **Coupled deployment**: Changes to any ORM require redeploying the entire service
- **Single point of failure**: If the service crashes, all ORMs become unavailable
- **Potential resource contention**: Connection pools and other resources share the same process

##### Neutral 🔄

- Requires thoughtful route organization and naming conventions
- Need to handle initialization and cleanup for multiple database connections
- Route registration must be maintainable as more ORMs are added

#### 4️⃣ Implementation Notes

- Use Fastify's plugin system to encapsulate each ORM's routes
- Each ORM package should export a Fastify plugin that registers its routes under a prefix
- Database connection initialization should happen during plugin registration
- Include proper error handling and graceful shutdown for all database connections
- Consider implementing a health check endpoint that verifies all ORMs are operational

_This document will be updated as architectural decisions are made throughout the project lifecycle._
