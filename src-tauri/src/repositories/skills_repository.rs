use rusqlite::{params, Connection, OptionalExtension, Transaction};

use crate::app::errors::AppError;
use crate::models::domain::{
    InstallMode, SkillRecord, SkillSourceRecord, SkillStatus, SkillTargetSupportRecord,
    SourceType, SupportLevel,
};

pub fn list_skill_records(connection: &Connection) -> Result<Vec<SkillRecord>, AppError> {
    let mut statement = connection.prepare(
        r#"
        SELECT
            id, slug, name, version, description, author, local_path, icon, readme_path,
            install_method, checksum, status, extra_metadata_json, created_at, updated_at, last_checked_at
        FROM skills
        ORDER BY updated_at DESC, name ASC
        "#,
    )?;

    let iter = statement.query_map([], map_skill_record)?;
    iter.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

pub fn get_skill_record(connection: &Connection, skill_id: &str) -> Result<Option<SkillRecord>, AppError> {
    connection
        .query_row(
            r#"
            SELECT
                id, slug, name, version, description, author, local_path, icon, readme_path,
                install_method, checksum, status, extra_metadata_json, created_at, updated_at, last_checked_at
            FROM skills
            WHERE id = ?1
            "#,
            params![skill_id],
            map_skill_record,
        )
        .optional()
        .map_err(Into::into)
}

pub fn insert_skill_record(transaction: &Transaction<'_>, skill: &SkillRecord) -> Result<(), AppError> {
    transaction.execute(
        r#"
        INSERT INTO skills (
            id, slug, name, version, description, author, local_path, icon, readme_path,
            install_method, checksum, status, extra_metadata_json, created_at, updated_at, last_checked_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)
        "#,
        params![
            skill.id,
            skill.slug,
            skill.name,
            skill.version,
            skill.description,
            skill.author,
            skill.local_path,
            skill.icon,
            skill.readme_path,
            skill.install_method.as_str(),
            skill.checksum,
            skill.status.as_str(),
            skill.extra_metadata_json,
            skill.created_at,
            skill.updated_at,
            skill.last_checked_at,
        ],
    )?;

    Ok(())
}

pub fn update_skill_record(transaction: &Transaction<'_>, skill: &SkillRecord) -> Result<(), AppError> {
    transaction.execute(
        r#"
        UPDATE skills
        SET slug = ?2,
            name = ?3,
            version = ?4,
            description = ?5,
            author = ?6,
            local_path = ?7,
            icon = ?8,
            readme_path = ?9,
            install_method = ?10,
            checksum = ?11,
            status = ?12,
            extra_metadata_json = ?13,
            updated_at = ?14,
            last_checked_at = ?15
        WHERE id = ?1
        "#,
        params![
            skill.id,
            skill.slug,
            skill.name,
            skill.version,
            skill.description,
            skill.author,
            skill.local_path,
            skill.icon,
            skill.readme_path,
            skill.install_method.as_str(),
            skill.checksum,
            skill.status.as_str(),
            skill.extra_metadata_json,
            skill.updated_at,
            skill.last_checked_at,
        ],
    )?;

    Ok(())
}

pub fn delete_skill_record(transaction: &Transaction<'_>, skill_id: &str) -> Result<(), AppError> {
    transaction.execute("DELETE FROM skills WHERE id = ?1", params![skill_id])?;
    Ok(())
}

pub fn replace_skill_sources(
    transaction: &Transaction<'_>,
    skill_id: &str,
    sources: &[SkillSourceRecord],
) -> Result<(), AppError> {
    transaction.execute("DELETE FROM skill_sources WHERE skill_id = ?1", params![skill_id])?;

    for source in sources {
        transaction.execute(
            r#"
            INSERT INTO skill_sources (
                id, skill_id, source_type, source_url, source_ref, source_commit,
                source_subpath, is_primary, created_at, updated_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
            "#,
            params![
                source.id,
                source.skill_id,
                source.source_type.as_str(),
                source.source_url,
                source.source_ref,
                source.source_commit,
                source.source_subpath,
                source.is_primary as i32,
                source.created_at,
                source.updated_at,
            ],
        )?;
    }

    Ok(())
}

pub fn list_skill_sources(
    connection: &Connection,
    skill_id: &str,
) -> Result<Vec<SkillSourceRecord>, AppError> {
    let mut statement = connection.prepare(
        r#"
        SELECT
            id, skill_id, source_type, source_url, source_ref, source_commit,
            source_subpath, is_primary, created_at, updated_at
        FROM skill_sources
        WHERE skill_id = ?1
        ORDER BY is_primary DESC, created_at ASC
        "#,
    )?;

    let iter = statement.query_map(params![skill_id], |row| {
        Ok(SkillSourceRecord {
            id: row.get(0)?,
            skill_id: row.get(1)?,
            source_type: SourceType::parse(row.get::<_, String>(2)?.as_str()).map_err(
                |error| {
                    rusqlite::Error::FromSqlConversionFailure(
                        2,
                        rusqlite::types::Type::Text,
                        Box::new(error),
                    )
                },
            )?,
            source_url: row.get(3)?,
            source_ref: row.get(4)?,
            source_commit: row.get(5)?,
            source_subpath: row.get(6)?,
            is_primary: row.get::<_, i64>(7)? > 0,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    })?;

    iter.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

pub fn replace_skill_tags(
    transaction: &Transaction<'_>,
    skill_id: &str,
    tags: &[String],
) -> Result<(), AppError> {
    transaction.execute("DELETE FROM skill_tags WHERE skill_id = ?1", params![skill_id])?;

    for tag in tags {
        transaction.execute(
            "INSERT INTO skill_tags (skill_id, tag) VALUES (?1, ?2)",
            params![skill_id, tag],
        )?;
    }

    Ok(())
}

pub fn list_skill_tags(connection: &Connection, skill_id: &str) -> Result<Vec<String>, AppError> {
    let mut statement =
        connection.prepare("SELECT tag FROM skill_tags WHERE skill_id = ?1 ORDER BY tag ASC")?;
    let iter = statement.query_map(params![skill_id], |row| row.get(0))?;
    iter.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

pub fn replace_skill_target_supports(
    transaction: &Transaction<'_>,
    skill_id: &str,
    supports: &[SkillTargetSupportRecord],
) -> Result<(), AppError> {
    transaction.execute(
        "DELETE FROM skill_target_supports WHERE skill_id = ?1",
        params![skill_id],
    )?;

    for support in supports {
        transaction.execute(
            "INSERT INTO skill_target_supports (skill_id, target_key, support_level) VALUES (?1, ?2, ?3)",
            params![skill_id, support.target_key, support.support_level.as_str()],
        )?;
    }

    Ok(())
}

pub fn list_skill_target_supports(
    connection: &Connection,
    skill_id: &str,
) -> Result<Vec<SkillTargetSupportRecord>, AppError> {
    let mut statement = connection.prepare(
        "SELECT target_key, support_level FROM skill_target_supports WHERE skill_id = ?1 ORDER BY target_key ASC",
    )?;
    let iter = statement.query_map(params![skill_id], |row| {
        Ok(SkillTargetSupportRecord {
            target_key: row.get(0)?,
            support_level: SupportLevel::parse(row.get::<_, String>(1)?.as_str()).map_err(
                |error| {
                    rusqlite::Error::FromSqlConversionFailure(
                        1,
                        rusqlite::types::Type::Text,
                        Box::new(error),
                    )
                },
            )?,
        })
    })?;

    iter.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn map_skill_record(row: &rusqlite::Row<'_>) -> rusqlite::Result<SkillRecord> {
    Ok(SkillRecord {
        id: row.get(0)?,
        slug: row.get(1)?,
        name: row.get(2)?,
        version: row.get(3)?,
        description: row.get(4)?,
        author: row.get(5)?,
        local_path: row.get(6)?,
        icon: row.get(7)?,
        readme_path: row.get(8)?,
        install_method: InstallMode::parse(row.get::<_, String>(9)?.as_str()).map_err(
            |error| {
                rusqlite::Error::FromSqlConversionFailure(
                    9,
                    rusqlite::types::Type::Text,
                    Box::new(error),
                )
            },
        )?,
        checksum: row.get(10)?,
        status: SkillStatus::parse(row.get::<_, String>(11)?.as_str()).map_err(|error| {
            rusqlite::Error::FromSqlConversionFailure(
                11,
                rusqlite::types::Type::Text,
                Box::new(error),
            )
        })?,
        extra_metadata_json: row.get(12)?,
        created_at: row.get(13)?,
        updated_at: row.get(14)?,
        last_checked_at: row.get(15)?,
    })
}
