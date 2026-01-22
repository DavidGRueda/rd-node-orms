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
