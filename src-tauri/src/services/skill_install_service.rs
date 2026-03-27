use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use rusqlite::Connection;
use uuid::Uuid;

use crate::app::errors::AppError;
use crate::models::domain::SkillAggregate;
use crate::models::dto::{CreateSkillInputDto, CreateSkillSourceInputDto};
use crate::repositories::skills_repository;
use crate::services::registry_service;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SkillImportCandidate {
    pub relative_path: String,
    pub source_path: PathBuf,
    pub slug: String,
    pub name: String,
    pub description: Option<String>,
    pub author: Option<String>,
    pub version: String,
    pub readme_path: Option<PathBuf>,
    pub missing_fields: Vec<String>,
    pub conflicts: Vec<String>,
}

#[derive(Debug, Clone, Default)]
pub struct SkillImportOverrides {
    pub slug: Option<String>,
    pub name: Option<String>,
    pub description: Option<String>,
}

pub fn inspect_source_directory(
    connection: &Connection,
    repository_root: &Path,
    source_root: &Path,
) -> Result<Vec<SkillImportCandidate>, AppError> {
    if !source_root.exists() || !source_root.is_dir() {
        return Err(AppError::new(
            "install/invalid-source",
            "导入目录不存在或不可访问",
            Some(source_root.display().to_string()),
            true,
        ));
    }

    let skill_dirs = collect_skill_directories(source_root)?;
    if skill_dirs.is_empty() {
        return Err(AppError::new(
            "install/unrecognized-structure",
            "未识别到合法的 Skill 目录",
            Some(source_root.display().to_string()),
            true,
        ));
    }

    let existing_skills = skills_repository::list_skill_records(connection)?;
    let mut candidates = skill_dirs
        .into_iter()
        .map(|skill_dir| {
            build_candidate(&existing_skills, repository_root, source_root, &skill_dir)
        })
        .collect::<Result<Vec<_>, _>>()?;

    candidates.sort_by(|left, right| left.relative_path.cmp(&right.relative_path));
    Ok(candidates)
}

pub fn import_local_candidate(
    connection: &mut Connection,
    repository_root: &Path,
    source_root: &Path,
    relative_path: &str,
    overrides: SkillImportOverrides,
) -> Result<SkillAggregate, AppError> {
    import_candidate_from_source(
        connection,
        repository_root,
        source_root,
        relative_path,
        overrides,
        CreateSkillSourceInputDto {
            source_type: "local".to_string(),
            source_url: Some(source_root.display().to_string()),
            source_ref: None,
            source_commit: None,
            source_subpath: if relative_path.is_empty() {
                None
            } else {
                Some(relative_path.to_string())
            },
            is_primary: true,
        },
    )
}

pub fn inspect_github_repository(
    connection: &Connection,
    repository_root: &Path,
    url: &str,
) -> Result<Vec<SkillImportCandidate>, AppError> {
    let normalized_url = normalize_github_repo_url(url)?;
    let temp_dir = clone_github_repository_to_temp(&normalized_url)?;
    let result = inspect_source_directory(connection, repository_root, &temp_dir);
    let _ = fs::remove_dir_all(&temp_dir);
    result
}

pub fn import_github_candidate(
    connection: &mut Connection,
    repository_root: &Path,
    url: &str,
    relative_path: &str,
    overrides: SkillImportOverrides,
) -> Result<SkillAggregate, AppError> {
    let normalized_url = normalize_github_repo_url(url)?;
    let temp_dir = clone_github_repository_to_temp(&normalized_url)?;
    let result = import_candidate_from_source(
        connection,
        repository_root,
        &temp_dir,
        relative_path,
        overrides,
        CreateSkillSourceInputDto {
            source_type: "github".to_string(),
            source_url: Some(normalized_url),
            source_ref: Some("default".to_string()),
            source_commit: None,
            source_subpath: if relative_path.is_empty() {
                None
            } else {
                Some(relative_path.to_string())
            },
            is_primary: true,
        },
    );
    let _ = fs::remove_dir_all(&temp_dir);
    result
}

fn import_candidate_from_source(
    connection: &mut Connection,
    repository_root: &Path,
    source_root: &Path,
    relative_path: &str,
    overrides: SkillImportOverrides,
    source: CreateSkillSourceInputDto,
) -> Result<SkillAggregate, AppError> {
    let candidate = inspect_source_directory(connection, repository_root, source_root)?
        .into_iter()
        .find(|item| item.relative_path == relative_path)
        .ok_or_else(|| {
            AppError::new(
                "install/candidate-not-found",
                "未找到指定的 Skill 候选项",
                Some(relative_path.to_string()),
                true,
            )
        })?;

    if !candidate.conflicts.is_empty() {
        return Err(AppError::new(
            "install/conflict",
            "Skill 导入存在冲突，无法继续",
            Some(candidate.conflicts.join("; ")),
            true,
        ));
    }

    let final_slug = overrides.slug.unwrap_or(candidate.slug.clone());
    let final_name = overrides.name.unwrap_or(candidate.name.clone());
    let final_description = overrides.description.or(candidate.description.clone());
    let missing_fields =
        collect_missing_fields(&final_slug, &final_name, final_description.as_deref());

    if !missing_fields.is_empty() {
        return Err(AppError::new(
            "install/missing-fields",
            "缺少导入所需的最小字段",
            Some(missing_fields.join(", ")),
            true,
        ));
    }

    let target_dir = repository_root.join("skills").join(&final_slug);
    if target_dir.exists() {
        return Err(AppError::new(
            "install/path-conflict",
            "目标目录已存在，无法覆盖导入",
            Some(target_dir.display().to_string()),
            true,
        ));
    }

    copy_directory_recursively(&candidate.source_path, &target_dir)?;

    let readme_path = target_dir.join("README.md");
    registry_service::create_skill(
        connection,
        CreateSkillInputDto {
            slug: final_slug.clone(),
            name: final_name,
            version: candidate.version,
            description: final_description,
            author: candidate.author,
            local_path: target_dir.display().to_string(),
            icon: None,
            readme_path: readme_path
                .is_file()
                .then(|| readme_path.display().to_string()),
            install_method: "copy".to_string(),
            checksum: None,
            status: "ready".to_string(),
            extra_metadata_json: None,
            tags: vec![],
            sources: vec![source],
            supported_targets: vec![],
        },
    )
}

fn normalize_github_repo_url(url: &str) -> Result<String, AppError> {
    let trimmed = url.trim().trim_end_matches('/');
    let without_scheme = trimmed
        .strip_prefix("https://")
        .or_else(|| trimmed.strip_prefix("http://"))
        .ok_or_else(|| {
            AppError::new(
                "install/invalid-github-url",
                "仅支持公开 GitHub 仓库 URL",
                Some(url.to_string()),
                true,
            )
        })?;
    let without_git = without_scheme.trim_end_matches(".git");
    let mut parts = without_git.split('/');

    let host = parts.next().unwrap_or_default();
    let owner = parts.next().unwrap_or_default();
    let repo = parts.next().unwrap_or_default();

    if host != "github.com" || owner.is_empty() || repo.is_empty() {
        return Err(AppError::new(
            "install/invalid-github-url",
            "仅支持公开 GitHub 仓库 URL",
            Some(url.to_string()),
            true,
        ));
    }

    Ok(format!("https://github.com/{owner}/{repo}.git"))
}

fn clone_github_repository_to_temp(url: &str) -> Result<PathBuf, AppError> {
    let temp_dir = std::env::temp_dir().join(format!("stoneskills-gh-{}", Uuid::new_v4()));
    let status = Command::new("git")
        .args(["clone", "--depth", "1", "--quiet", url])
        .arg(&temp_dir)
        .status()
        .map_err(|error| {
            AppError::new(
                "install/git-unavailable",
                "无法调用 git 获取 GitHub 仓库",
                Some(error.to_string()),
                true,
            )
        })?;

    if !status.success() {
        let _ = fs::remove_dir_all(&temp_dir);
        return Err(AppError::new(
            "install/github-fetch-failed",
            "无法获取 GitHub 仓库内容",
            Some(url.to_string()),
            true,
        ));
    }

    Ok(temp_dir)
}

fn build_candidate(
    existing_skills: &[crate::models::domain::SkillRecord],
    repository_root: &Path,
    source_root: &Path,
    skill_dir: &Path,
) -> Result<SkillImportCandidate, AppError> {
    let relative_path = normalized_relative_path(source_root, skill_dir)?;
    let metadata = parse_skill_markdown(&skill_dir.join("SKILL.md"))?;
    let default_slug = if !relative_path.is_empty() {
        skill_dir
            .file_name()
            .and_then(|item| item.to_str())
            .map(sanitize_slug)
            .unwrap_or_else(|| {
                sanitize_slug(
                    &metadata
                        .name
                        .clone()
                        .unwrap_or_else(|| Uuid::new_v4().to_string()),
                )
            })
    } else {
        sanitize_slug(
            metadata.name.as_deref().unwrap_or(
                skill_dir
                    .file_name()
                    .and_then(|item| item.to_str())
                    .unwrap_or("skill"),
            ),
        )
    };
    let name = metadata.name.unwrap_or_else(|| default_slug.clone());
    let description = metadata
        .description
        .or_else(|| metadata.body_summary.clone());
    let mut conflicts = Vec::new();
    let target_dir = repository_root.join("skills").join(&default_slug);

    if existing_skills.iter().any(|item| item.slug == default_slug) {
        conflicts.push(format!("slug 冲突：{default_slug}"));
    }
    if target_dir.exists() {
        conflicts.push(format!("目标目录冲突：{}", target_dir.display()));
    }

    Ok(SkillImportCandidate {
        relative_path,
        source_path: skill_dir.to_path_buf(),
        slug: default_slug.clone(),
        name: name.clone(),
        description: description.clone(),
        author: metadata.author,
        version: metadata.version.unwrap_or_else(|| "0.0.0".to_string()),
        readme_path: skill_dir
            .join("README.md")
            .is_file()
            .then(|| skill_dir.join("README.md")),
        missing_fields: collect_missing_fields(&default_slug, &name, description.as_deref()),
        conflicts,
    })
}

fn collect_skill_directories(root: &Path) -> Result<Vec<PathBuf>, AppError> {
    let mut stack = vec![root.to_path_buf()];
    let mut directories = Vec::new();

    while let Some(current) = stack.pop() {
        if current.join("SKILL.md").is_file() {
            directories.push(current);
            continue;
        }

        for entry in fs::read_dir(&current)? {
            let entry = entry?;
            let path = entry.path();
            if !path.is_dir() {
                continue;
            }

            let name = path
                .file_name()
                .and_then(|item| item.to_str())
                .unwrap_or_default();
            if name.starts_with('.') {
                continue;
            }

            stack.push(path);
        }
    }

    Ok(directories)
}

fn normalized_relative_path(root: &Path, target: &Path) -> Result<String, AppError> {
    let relative = target.strip_prefix(root).map_err(|error| {
        AppError::new(
            "install/relative-path",
            "无法计算相对路径",
            Some(error.to_string()),
            true,
        )
    })?;

    if relative.as_os_str().is_empty() {
        return Ok(String::new());
    }

    Ok(relative
        .components()
        .map(|component| component.as_os_str().to_string_lossy().to_string())
        .collect::<Vec<_>>()
        .join("/"))
}

#[derive(Debug, Default)]
struct ParsedSkillMetadata {
    name: Option<String>,
    description: Option<String>,
    author: Option<String>,
    version: Option<String>,
    body_summary: Option<String>,
}

fn parse_skill_markdown(path: &Path) -> Result<ParsedSkillMetadata, AppError> {
    let content = fs::read_to_string(path)?;
    let mut metadata = ParsedSkillMetadata::default();
    let mut lines = content.lines();
    let mut body_lines = Vec::new();

    if matches!(lines.next(), Some("---")) {
        let mut current_section: Option<String> = None;

        for line in &mut lines {
            if line == "---" {
                break;
            }

            if !line.starts_with(' ') && line.ends_with(':') {
                current_section = Some(line.trim_end_matches(':').trim().to_string());
                continue;
            }

            if let Some(section) = current_section.as_deref() {
                if section == "metadata" && line.starts_with("  ") {
                    if let Some((key, value)) = split_key_value(line.trim()) {
                        match key {
                            "author" => metadata.author = Some(unquote(value)),
                            "version" => metadata.version = Some(unquote(value)),
                            _ => {}
                        }
                    }
                    continue;
                }
            }

            if let Some((key, value)) = split_key_value(line.trim()) {
                match key {
                    "name" => metadata.name = Some(unquote(value)),
                    "description" => metadata.description = Some(unquote(value)),
                    _ => {}
                }
                current_section = None;
            }
        }

        body_lines.extend(lines.map(str::to_string));
    } else {
        body_lines = content.lines().map(str::to_string).collect();
    }

    metadata.body_summary = body_lines
        .into_iter()
        .map(|line| line.trim().to_string())
        .find(|line| !line.is_empty() && !line.starts_with('#'));

    Ok(metadata)
}

fn split_key_value(line: &str) -> Option<(&str, &str)> {
    let (key, value) = line.split_once(':')?;
    Some((key.trim(), value.trim()))
}

fn unquote(value: &str) -> String {
    value
        .trim_matches('"')
        .trim_matches('\'')
        .trim()
        .to_string()
}

fn sanitize_slug(input: &str) -> String {
    let mut slug = String::new();
    let mut prev_dash = false;

    for ch in input.chars() {
        let normalized = ch.to_ascii_lowercase();
        if normalized.is_ascii_alphanumeric() {
            slug.push(normalized);
            prev_dash = false;
            continue;
        }

        if !prev_dash {
            slug.push('-');
            prev_dash = true;
        }
    }

    let trimmed = slug.trim_matches('-').to_string();
    if trimmed.is_empty() {
        "skill".to_string()
    } else {
        trimmed
    }
}

fn collect_missing_fields(slug: &str, name: &str, description: Option<&str>) -> Vec<String> {
    let mut fields = Vec::new();
    if slug.trim().is_empty() {
        fields.push("slug".to_string());
    }
    if name.trim().is_empty() {
        fields.push("name".to_string());
    }
    if description.unwrap_or_default().trim().is_empty() {
        fields.push("description".to_string());
    }
    fields
}

fn copy_directory_recursively(source: &Path, target: &Path) -> Result<(), AppError> {
    fs::create_dir_all(target)?;

    for entry in fs::read_dir(source)? {
        let entry = entry?;
        let source_path = entry.path();
        let target_path = target.join(entry.file_name());

        if source_path.is_dir() {
            let name = source_path
                .file_name()
                .and_then(|item| item.to_str())
                .unwrap_or_default();
            if name.starts_with('.') {
                continue;
            }

            copy_directory_recursively(&source_path, &target_path)?;
        } else {
            fs::copy(&source_path, &target_path)?;
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use tempfile::TempDir;

    use super::{
        import_github_candidate, import_local_candidate, inspect_github_repository,
        inspect_source_directory, SkillImportOverrides,
    };
    use crate::database::{connection::open_connection, migrations};
    use crate::models::dto::{
        CreateSkillInputDto, CreateSkillSourceInputDto, CreateSkillTargetSupportInputDto,
    };
    use crate::services::repository_service;

    fn temp_db_path(name: &str) -> PathBuf {
        std::env::temp_dir().join(format!(
            "stoneskills-install-{}-{}.sqlite",
            name,
            uuid::Uuid::new_v4()
        ))
    }

    fn setup_connection(path: &PathBuf) -> rusqlite::Connection {
        let mut connection = open_connection(path).expect("open sqlite");
        migrations::apply(&mut connection).expect("apply migrations");
        connection
    }

    fn write_skill(root: &PathBuf, relative_path: &str, frontmatter_name: &str) -> PathBuf {
        let skill_dir = root.join(relative_path);
        std::fs::create_dir_all(&skill_dir).expect("create skill dir");
        std::fs::write(
            skill_dir.join("SKILL.md"),
            format!(
                "---\nname: {frontmatter_name}\ndescription: 测试 Skill\nmetadata:\n  author: Stone\n  version: \"1.2.3\"\n---\n\n# {frontmatter_name}\n"
            ),
        )
        .expect("write skill markdown");
        std::fs::write(skill_dir.join("README.md"), "# README").expect("write readme");
        skill_dir
    }

    #[test]
    fn inspect_source_directory_detects_root_skill() {
        let source_dir = TempDir::new().expect("create source dir");
        let repository_dir = TempDir::new().expect("create repository dir");
        let db_path = temp_db_path("detect-root");
        let connection = setup_connection(&db_path);

        write_skill(&source_dir.path().to_path_buf(), "", "root-skill");

        let candidates =
            inspect_source_directory(&connection, repository_dir.path(), source_dir.path())
                .expect("inspect source directory");

        assert_eq!(candidates.len(), 1);
        assert_eq!(candidates[0].slug, "root-skill");
        assert_eq!(candidates[0].name, "root-skill");

        let _ = std::fs::remove_file(db_path);
    }

    #[test]
    fn inspect_source_directory_detects_multiple_nested_skills() {
        let source_dir = TempDir::new().expect("create source dir");
        let repository_dir = TempDir::new().expect("create repository dir");
        let db_path = temp_db_path("detect-nested");
        let connection = setup_connection(&db_path);

        write_skill(
            &source_dir.path().to_path_buf(),
            "skills/alpha",
            "alpha-skill",
        );
        write_skill(
            &source_dir.path().to_path_buf(),
            "skills/beta",
            "beta-skill",
        );

        let candidates =
            inspect_source_directory(&connection, repository_dir.path(), source_dir.path())
                .expect("inspect source directory");

        assert_eq!(candidates.len(), 2);
        assert!(candidates
            .iter()
            .any(|item| item.relative_path == "skills/alpha"));
        assert!(candidates
            .iter()
            .any(|item| item.relative_path == "skills/beta"));

        let _ = std::fs::remove_file(db_path);
    }

    #[test]
    fn inspect_source_directory_marks_slug_conflicts() {
        let source_dir = TempDir::new().expect("create source dir");
        let repository_dir = TempDir::new().expect("create repository dir");
        let repository_root = repository_dir
            .path()
            .join(repository_service::REPOSITORY_DIR_NAME);
        let db_path = temp_db_path("detect-conflict");
        let mut connection = setup_connection(&db_path);

        repository_service::ensure_repository_initialized_at(&repository_root)
            .expect("init repository");
        write_skill(&source_dir.path().to_path_buf(), "", "conflict-skill");

        crate::services::registry_service::create_skill(
            &mut connection,
            CreateSkillInputDto {
                slug: "conflict-skill".to_string(),
                name: "Existing Skill".to_string(),
                version: "1.0.0".to_string(),
                description: Some("existing".to_string()),
                author: Some("Stone".to_string()),
                local_path: repository_root
                    .join("skills/conflict-skill")
                    .display()
                    .to_string(),
                icon: None,
                readme_path: None,
                install_method: "copy".to_string(),
                checksum: None,
                status: "ready".to_string(),
                extra_metadata_json: None,
                tags: vec![],
                sources: vec![CreateSkillSourceInputDto {
                    source_type: "local".to_string(),
                    source_url: None,
                    source_ref: None,
                    source_commit: None,
                    source_subpath: None,
                    is_primary: true,
                }],
                supported_targets: vec![CreateSkillTargetSupportInputDto {
                    target_key: "codex".to_string(),
                    support_level: "unknown".to_string(),
                }],
            },
        )
        .expect("create existing skill");

        let candidates = inspect_source_directory(&connection, &repository_root, source_dir.path())
            .expect("inspect source directory");

        assert!(candidates[0]
            .conflicts
            .iter()
            .any(|item| item.contains("slug")));

        let _ = std::fs::remove_file(db_path);
    }

    #[test]
    fn import_local_candidate_copies_files_and_persists_skill_record() {
        let source_dir = TempDir::new().expect("create source dir");
        let repository_dir = TempDir::new().expect("create repository dir");
        let repository_root = repository_dir
            .path()
            .join(repository_service::REPOSITORY_DIR_NAME);
        let db_path = temp_db_path("import-local");
        let mut connection = setup_connection(&db_path);

        repository_service::ensure_repository_initialized_at(&repository_root)
            .expect("init repository");
        write_skill(&source_dir.path().to_path_buf(), "", "local-import-skill");

        let created = import_local_candidate(
            &mut connection,
            &repository_root,
            source_dir.path(),
            "",
            SkillImportOverrides::default(),
        )
        .expect("import local candidate");

        assert_eq!(created.skill.slug, "local-import-skill");
        assert!(repository_root
            .join("skills/local-import-skill/SKILL.md")
            .is_file());
        assert!(created.skill.readme_path.is_some());

        let _ = std::fs::remove_file(db_path);
    }

    #[test]
    fn inspect_github_repository_rejects_non_github_urls() {
        let repository_dir = TempDir::new().expect("create repository dir");
        let db_path = temp_db_path("github-invalid");
        let connection = setup_connection(&db_path);

        let result = inspect_github_repository(
            &connection,
            repository_dir.path(),
            "https://gitlab.com/example/skills",
        );

        assert!(result.is_err());
        assert_eq!(
            result.expect_err("invalid host").code,
            "install/invalid-github-url"
        );

        let _ = std::fs::remove_file(db_path);
    }

    #[test]
    fn import_github_candidate_rejects_non_github_urls() {
        let repository_dir = TempDir::new().expect("create repository dir");
        let db_path = temp_db_path("github-import-invalid");
        let mut connection = setup_connection(&db_path);

        let result = import_github_candidate(
            &mut connection,
            repository_dir.path(),
            "https://example.com/not-github",
            "",
            SkillImportOverrides::default(),
        );

        assert!(result.is_err());
        assert_eq!(
            result.expect_err("invalid host").code,
            "install/invalid-github-url"
        );

        let _ = std::fs::remove_file(db_path);
    }
}
