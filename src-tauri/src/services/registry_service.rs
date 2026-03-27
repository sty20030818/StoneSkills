use rusqlite::Connection;
use uuid::Uuid;

use crate::app::errors::AppError;
use crate::models::domain::{
    DetectStatus, HealthStatus, InstallMode, InstallationRecord, InstallationStatus,
    SkillAggregate, SkillRecord, SkillSourceRecord, SkillStatus, SkillTargetSupportRecord,
    SourceType, SupportLevel, TargetRecord,
};
use crate::models::dto::{
    CreateSkillInputDto, UpdateSkillInputDto, UpsertInstallationInputDto, UpsertTargetInputDto,
};
use crate::repositories::{installations_repository, skills_repository, targets_repository};

pub fn list_skills(connection: &Connection) -> Result<Vec<SkillAggregate>, AppError> {
    skills_repository::list_skill_records(connection)?
        .into_iter()
        .map(|skill| hydrate_skill(connection, skill))
        .collect()
}

pub fn create_skill(
    connection: &mut Connection,
    input: CreateSkillInputDto,
) -> Result<SkillAggregate, AppError> {
    let now = now_ts();
    let skill_id = Uuid::new_v4().to_string();
    let skill = build_skill_record(
        skill_id.clone(),
        input.slug,
        input.name,
        input.version,
        input.description,
        input.author,
        input.local_path,
        input.icon,
        input.readme_path,
        input.install_method,
        input.checksum,
        input.status,
        input.extra_metadata_json,
        now,
        now,
        None,
    )?;

    let sources = build_skill_sources(&skill_id, input.sources, now)?;
    let supports = build_skill_supports(&skill_id, input.supported_targets)?;

    let transaction = connection.transaction()?;
    skills_repository::insert_skill_record(&transaction, &skill)?;
    skills_repository::replace_skill_sources(&transaction, &skill_id, &sources)?;
    skills_repository::replace_skill_tags(&transaction, &skill_id, &input.tags)?;
    skills_repository::replace_skill_target_supports(&transaction, &skill_id, &supports)?;
    transaction.commit()?;

    get_skill(connection, &skill_id)?.ok_or_else(|| {
        AppError::new(
            "db/not-found",
            "创建 Skill 后未能读取回显",
            Some(skill_id),
            true,
        )
    })
}

pub fn update_skill(
    connection: &mut Connection,
    input: UpdateSkillInputDto,
) -> Result<SkillAggregate, AppError> {
    let existing =
        skills_repository::get_skill_record(connection, &input.id)?.ok_or_else(|| {
            AppError::new(
                "db/not-found",
                "找不到要更新的 Skill",
                Some(input.id.clone()),
                true,
            )
        })?;

    let skill = build_skill_record(
        input.id.clone(),
        input.slug,
        input.name,
        input.version,
        input.description,
        input.author,
        input.local_path,
        input.icon,
        input.readme_path,
        input.install_method,
        input.checksum,
        input.status,
        input.extra_metadata_json,
        existing.created_at,
        now_ts(),
        existing.last_checked_at,
    )?;

    let sources = build_skill_sources(&input.id, input.sources, now_ts())?;
    let supports = build_skill_supports(&input.id, input.supported_targets)?;

    let transaction = connection.transaction()?;
    skills_repository::update_skill_record(&transaction, &skill)?;
    skills_repository::replace_skill_sources(&transaction, &input.id, &sources)?;
    skills_repository::replace_skill_tags(&transaction, &input.id, &input.tags)?;
    skills_repository::replace_skill_target_supports(&transaction, &input.id, &supports)?;
    transaction.commit()?;

    get_skill(connection, &input.id)?.ok_or_else(|| {
        AppError::new(
            "db/not-found",
            "更新 Skill 后未能读取回显",
            Some(input.id),
            true,
        )
    })
}

pub fn delete_skill(connection: &mut Connection, skill_id: &str) -> Result<(), AppError> {
    let transaction = connection.transaction()?;
    skills_repository::delete_skill_record(&transaction, skill_id)?;
    transaction.commit()?;
    Ok(())
}

pub fn get_skill(
    connection: &Connection,
    skill_id: &str,
) -> Result<Option<SkillAggregate>, AppError> {
    skills_repository::get_skill_record(connection, skill_id)?
        .map(|skill| hydrate_skill(connection, skill))
        .transpose()
}

pub fn list_targets(connection: &Connection) -> Result<Vec<TargetRecord>, AppError> {
    targets_repository::list_targets(connection)
}

pub fn upsert_target(
    connection: &Connection,
    input: UpsertTargetInputDto,
) -> Result<TargetRecord, AppError> {
    let now = now_ts();
    let existing = targets_repository::list_targets(connection)?
        .into_iter()
        .find(|item| item.key == input.key);

    let target = TargetRecord {
        id: existing
            .as_ref()
            .map(|item| item.id.clone())
            .unwrap_or_else(|| Uuid::new_v4().to_string()),
        key: input.key,
        name: input.name,
        platform: input.platform,
        detect_status: DetectStatus::parse(&input.detect_status)?,
        install_path: input.install_path,
        adapter_type: input.adapter_type,
        enable_modes: input.enable_modes,
        health_status: HealthStatus::parse(&input.health_status)?,
        last_detected_at: input.last_detected_at.or(Some(now)),
        created_at: existing.as_ref().map(|item| item.created_at).unwrap_or(now),
        updated_at: now,
    };

    targets_repository::upsert_target(connection, &target)
}

pub fn list_installations(connection: &Connection) -> Result<Vec<InstallationRecord>, AppError> {
    installations_repository::list_installations(connection)
}

pub fn upsert_installation(
    connection: &Connection,
    input: UpsertInstallationInputDto,
) -> Result<InstallationRecord, AppError> {
    let now = now_ts();
    let existing = installations_repository::list_installations(connection)?
        .into_iter()
        .find(|item| item.skill_id == input.skill_id && item.target_id == input.target_id);

    let installation = InstallationRecord {
        id: existing
            .as_ref()
            .map(|item| item.id.clone())
            .unwrap_or_else(|| Uuid::new_v4().to_string()),
        skill_id: input.skill_id,
        target_id: input.target_id,
        install_mode: InstallMode::parse(&input.install_mode)?,
        target_path: input.target_path,
        installed_version: input.installed_version,
        status: InstallationStatus::parse(&input.status)?,
        last_error: input.last_error,
        created_at: existing.as_ref().map(|item| item.created_at).unwrap_or(now),
        updated_at: now,
    };

    installations_repository::upsert_installation(connection, &installation)
}

pub fn now_ts() -> i64 {
    use std::time::{SystemTime, UNIX_EPOCH};

    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs() as i64)
        .unwrap_or(0)
}

fn hydrate_skill(connection: &Connection, skill: SkillRecord) -> Result<SkillAggregate, AppError> {
    let skill_id = skill.id.clone();

    Ok(SkillAggregate {
        skill,
        sources: skills_repository::list_skill_sources(connection, &skill_id)?,
        tags: skills_repository::list_skill_tags(connection, &skill_id)?,
        supported_targets: skills_repository::list_skill_target_supports(connection, &skill_id)?,
    })
}

#[allow(clippy::too_many_arguments)]
fn build_skill_record(
    id: String,
    slug: String,
    name: String,
    version: String,
    description: Option<String>,
    author: Option<String>,
    local_path: String,
    icon: Option<String>,
    readme_path: Option<String>,
    install_method: String,
    checksum: Option<String>,
    status: String,
    extra_metadata_json: Option<String>,
    created_at: i64,
    updated_at: i64,
    last_checked_at: Option<i64>,
) -> Result<SkillRecord, AppError> {
    Ok(SkillRecord {
        id,
        slug,
        name,
        version,
        description,
        author,
        local_path,
        icon,
        readme_path,
        install_method: InstallMode::parse(&install_method)?,
        checksum,
        status: SkillStatus::parse(&status)?,
        extra_metadata_json,
        created_at,
        updated_at,
        last_checked_at,
    })
}

fn build_skill_sources(
    skill_id: &str,
    input: Vec<crate::models::dto::CreateSkillSourceInputDto>,
    now: i64,
) -> Result<Vec<SkillSourceRecord>, AppError> {
    input
        .into_iter()
        .map(|item| {
            Ok(SkillSourceRecord {
                id: Uuid::new_v4().to_string(),
                skill_id: skill_id.to_string(),
                source_type: SourceType::parse(&item.source_type)?,
                source_url: item.source_url,
                source_ref: item.source_ref,
                source_commit: item.source_commit,
                source_subpath: item.source_subpath,
                is_primary: item.is_primary,
                created_at: now,
                updated_at: now,
            })
        })
        .collect()
}

fn build_skill_supports(
    _skill_id: &str,
    input: Vec<crate::models::dto::CreateSkillTargetSupportInputDto>,
) -> Result<Vec<SkillTargetSupportRecord>, AppError> {
    input
        .into_iter()
        .map(|item| {
            Ok(SkillTargetSupportRecord {
                target_key: item.target_key,
                support_level: SupportLevel::parse(&item.support_level)?,
            })
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use super::{create_skill, get_skill, now_ts, update_skill};
    use crate::database::{connection::open_connection, migrations};
    use crate::models::dto::{
        CreateSkillInputDto, CreateSkillSourceInputDto, CreateSkillTargetSupportInputDto,
        UpdateSkillInputDto,
    };

    fn temp_db_path(name: &str) -> PathBuf {
        std::env::temp_dir().join(format!(
            "stoneskills-{}-{}.sqlite",
            name,
            uuid::Uuid::new_v4()
        ))
    }

    fn setup_connection(path: &PathBuf) -> rusqlite::Connection {
        let mut connection = open_connection(path).expect("open sqlite");
        migrations::apply(&mut connection).expect("apply migrations");
        connection
    }

    fn sample_input() -> CreateSkillInputDto {
        CreateSkillInputDto {
            slug: "frontend-guard".to_string(),
            name: "Frontend Guard".to_string(),
            version: "1.0.0".to_string(),
            description: Some("前端防护规则".to_string()),
            author: Some("Stone".to_string()),
            local_path: "/tmp/frontend-guard".to_string(),
            icon: None,
            readme_path: None,
            install_method: "link".to_string(),
            checksum: None,
            status: "ready".to_string(),
            extra_metadata_json: None,
            tags: vec!["frontend".to_string(), "guard".to_string()],
            sources: vec![CreateSkillSourceInputDto {
                source_type: "github".to_string(),
                source_url: Some("https://github.com/example/frontend-guard".to_string()),
                source_ref: Some("main".to_string()),
                source_commit: None,
                source_subpath: None,
                is_primary: true,
            }],
            supported_targets: vec![CreateSkillTargetSupportInputDto {
                target_key: "codex".to_string(),
                support_level: "native".to_string(),
            }],
        }
    }

    #[test]
    fn create_skill_persists_and_can_be_loaded_again() {
        let path = temp_db_path("persist");
        let mut connection = setup_connection(&path);
        let created = create_skill(&mut connection, sample_input()).expect("create skill");

        drop(connection);

        let reopened = open_connection(&path).expect("reopen sqlite");
        let loaded = get_skill(&reopened, &created.skill.id).expect("load skill");

        assert!(loaded.is_some());
        assert_eq!(
            loaded.expect("skill aggregate").skill.slug,
            "frontend-guard"
        );

        let _ = std::fs::remove_file(path);
    }

    #[test]
    fn update_skill_replaces_relationships() {
        let path = temp_db_path("update");
        let mut connection = setup_connection(&path);
        let created = create_skill(&mut connection, sample_input()).expect("create skill");

        let updated = update_skill(
            &mut connection,
            UpdateSkillInputDto {
                id: created.skill.id.clone(),
                slug: created.skill.slug.clone(),
                name: "Frontend Guard Updated".to_string(),
                version: "1.1.0".to_string(),
                description: Some("升级后的前端规则".to_string()),
                author: Some("Stone".to_string()),
                local_path: created.skill.local_path.clone(),
                icon: None,
                readme_path: None,
                install_method: "copy".to_string(),
                checksum: Some("abc".to_string()),
                status: "updating".to_string(),
                extra_metadata_json: Some("{\"tier\":\"pro\"}".to_string()),
                tags: vec!["frontend".to_string(), "quality".to_string()],
                sources: vec![CreateSkillSourceInputDto {
                    source_type: "local".to_string(),
                    source_url: None,
                    source_ref: None,
                    source_commit: None,
                    source_subpath: Some("skills/frontend".to_string()),
                    is_primary: true,
                }],
                supported_targets: vec![CreateSkillTargetSupportInputDto {
                    target_key: "cursor".to_string(),
                    support_level: "adapter".to_string(),
                }],
            },
        )
        .expect("update skill");

        assert_eq!(updated.skill.name, "Frontend Guard Updated");
        assert_eq!(
            updated.tags,
            vec!["frontend".to_string(), "quality".to_string()]
        );
        assert_eq!(updated.supported_targets.len(), 1);
        assert_eq!(updated.skill.updated_at >= now_ts() - 2, true);

        let _ = std::fs::remove_file(path);
    }

    #[test]
    fn create_skill_rolls_back_when_relationship_insert_fails() {
        let path = temp_db_path("rollback");
        let mut connection = setup_connection(&path);
        let mut input = sample_input();
        input.tags = vec!["frontend".to_string(), "frontend".to_string()];

        let result = create_skill(&mut connection, input);
        assert!(result.is_err());

        let count: i64 = connection
            .query_row("SELECT COUNT(*) FROM skills", [], |row| row.get(0))
            .expect("count skills");
        assert_eq!(count, 0);

        let _ = std::fs::remove_file(path);
    }
}
