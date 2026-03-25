use rusqlite::Connection;
use rusqlite_migration::{M, Migrations};

use crate::app::errors::AppError;

const MIGRATIONS_SLICE: &[M<'_>] = &[M::up(
    r#"
    CREATE TABLE IF NOT EXISTS skills (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        description TEXT,
        author TEXT,
        local_path TEXT NOT NULL UNIQUE,
        icon TEXT,
        readme_path TEXT,
        install_method TEXT NOT NULL CHECK (install_method IN ('link', 'copy')),
        checksum TEXT,
        status TEXT NOT NULL CHECK (status IN ('ready', 'invalid', 'missing', 'updating', 'archived')),
        extra_metadata_json TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        last_checked_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS skill_sources (
        id TEXT PRIMARY KEY,
        skill_id TEXT NOT NULL,
        source_type TEXT NOT NULL CHECK (source_type IN ('github', 'local', 'scan', 'marketplace')),
        source_url TEXT,
        source_ref TEXT,
        source_commit TEXT,
        source_subpath TEXT,
        is_primary INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY(skill_id) REFERENCES skills(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skill_tags (
        skill_id TEXT NOT NULL,
        tag TEXT NOT NULL,
        PRIMARY KEY(skill_id, tag),
        FOREIGN KEY(skill_id) REFERENCES skills(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skill_target_supports (
        skill_id TEXT NOT NULL,
        target_key TEXT NOT NULL,
        support_level TEXT NOT NULL CHECK (support_level IN ('native', 'adapter', 'unknown')),
        PRIMARY KEY(skill_id, target_key),
        FOREIGN KEY(skill_id) REFERENCES skills(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS targets (
        id TEXT PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        platform TEXT,
        detect_status TEXT NOT NULL CHECK (detect_status IN ('unknown', 'detected', 'missing', 'unsupported')),
        install_path TEXT,
        adapter_type TEXT,
        enable_modes_json TEXT NOT NULL,
        health_status TEXT NOT NULL CHECK (health_status IN ('healthy', 'warning', 'broken')),
        last_detected_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS installations (
        id TEXT PRIMARY KEY,
        skill_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        install_mode TEXT NOT NULL CHECK (install_mode IN ('link', 'copy')),
        target_path TEXT NOT NULL,
        installed_version TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'installed', 'disabled', 'outdated', 'broken', 'failed')),
        last_error TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        UNIQUE(skill_id, target_id),
        FOREIGN KEY(skill_id) REFERENCES skills(id) ON DELETE CASCADE,
        FOREIGN KEY(target_id) REFERENCES targets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_skills_status ON skills(status);
    CREATE INDEX IF NOT EXISTS idx_installations_skill_id ON installations(skill_id);
    CREATE INDEX IF NOT EXISTS idx_installations_target_id ON installations(target_id);
    CREATE INDEX IF NOT EXISTS idx_installations_status ON installations(status);
    CREATE INDEX IF NOT EXISTS idx_skill_sources_skill_id ON skill_sources(skill_id);
    "#,
)];

const MIGRATIONS: Migrations<'_> = Migrations::from_slice(MIGRATIONS_SLICE);

pub fn apply(connection: &mut Connection) -> Result<(), AppError> {
    MIGRATIONS.validate()?;
    MIGRATIONS.to_latest(connection)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use rusqlite::Connection;

    use super::{apply, MIGRATIONS};
    use crate::database::connection::configure_connection;

    #[test]
    fn migrations_are_valid() {
        assert!(MIGRATIONS.validate().is_ok());
    }

    #[test]
    fn apply_creates_core_tables() {
        let mut connection = Connection::open_in_memory().expect("open in-memory sqlite");
        configure_connection(&mut connection).expect("configure sqlite");
        apply(&mut connection).expect("apply migrations");

        let table_count: i64 = connection
            .query_row(
                "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name IN ('skills', 'targets', 'installations', 'app_settings')",
                [],
                |row| row.get(0),
            )
            .expect("count tables");

        assert_eq!(table_count, 4);
    }
}
