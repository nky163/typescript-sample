# Refactor Progress (Buckpal Hexagonal Alignment)

Pending tasks:
- Remove obsolete references to infrastructure/* in scripts & tests.
- Delete duplicated domain model under application/domain/accounts once unused.
- Adjust scripts/migrate.ts & seed.ts imports to adapter/*.
- Update package.json main & start script to use adapter entrypoint.
- Remove deprecated transfer-money.usecase content file after transition period.
- Add path aliases for adapter/*, application/* if desired.
