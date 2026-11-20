use serde::Serialize;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct CommitSummary {
    pub hash: String,
    pub subject: String,
    pub author: String,
    pub time: i64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RepoInfo {
    pub id: String,
    pub name: String,
    pub path: String,
    pub branch: String,
    pub ahead: i32,
    pub behind: i32,
    pub changes: i32,
    pub state: String,
    pub last: CommitSummary,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ChangedFile {
    pub path: String,
    pub status: String,
    pub staged: bool,
    pub untracked: bool,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Commit {
    pub hash: String,
    pub short: String,
    pub author: String,
    pub time: i64,
    pub subject: String,
    pub refs: Vec<String>,
    pub merge: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RepoDetail {
    pub files: Vec<ChangedFile>,
    pub commits: Vec<Commit>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OpResult {
    pub path: String,
    pub name: String,
    pub success: bool,
    pub message: String,
}

async fn blocking<T, F>(task: F) -> Result<T, String>
where
    T: Send + 'static,
    F: FnOnce() -> Result<T, String> + Send + 'static,
{
    tauri::async_runtime::spawn_blocking(task)
        .await
        .map_err(|error| format!("后台任务执行失败：{error}"))?
}

fn run_git(dir: &Path, args: &[&str]) -> Result<String, String> {
    let output = Command::new("git")
        .arg("-C")
        .arg(dir)
        .args(args)
        .env("GIT_TERMINAL_PROMPT", "0")
        .output()
        .map_err(|error| format!("无法执行 git 命令：{error}"))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim_end().to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if !stderr.is_empty() {
            Err(stderr)
        } else if !stdout.is_empty() {
            Err(stdout)
        } else {
            Err(format!("git 退出码 {}", output.status.code().unwrap_or(-1)))
        }
    }
}

fn checked_join(dir: &Path, rel: &str) -> Result<PathBuf, String> {
    let path = Path::new(rel);
    if path.is_absolute() || rel.split(['/', '\\']).any(|part| part == "..") {
        return Err("非法的文件路径".to_string());
    }
    Ok(dir.join(path))
}

fn status_snapshot(dir: &Path) -> Result<(String, i32, i32, i32, bool), String> {
    let raw = run_git(dir, &["status", "--porcelain=v2", "--branch"])?;
    let mut branch = "HEAD".to_string();
    let mut ahead = 0;
    let mut behind = 0;
    let mut changes = 0;
    let mut conflict = false;

    for line in raw.lines() {
        if let Some(value) = line.strip_prefix("# branch.head ") {
            branch = value.trim().to_string();
        } else if let Some(value) = line.strip_prefix("# branch.ab ") {
            for part in value.split_whitespace() {
                if let Some(number) = part.strip_prefix('+') {
                    ahead = number.parse().unwrap_or(0);
                } else if let Some(number) = part.strip_prefix('-') {
                    behind = number.parse().unwrap_or(0);
                }
            }
        } else if line.starts_with('#') {
            continue;
        } else {
            changes += 1;
            if line.starts_with("u ") {
                conflict = true;
            }
        }
    }

    Ok((branch, ahead, behind, changes, conflict))
}

fn last_commit(dir: &Path) -> Result<CommitSummary, String> {
    let raw = run_git(
        dir,
        &["log", "-1", "--format=%h%x1f%s%x1f%an%x1f%ct"],
    )?;
    let fields: Vec<&str> = raw.split('\u{1f}').collect();
    if fields.len() < 4 {
        return Err("无法解析最近提交".to_string());
    }
    Ok(CommitSummary {
        hash: fields[0].to_string(),
        subject: fields[1].to_string(),
        author: fields[2].to_string(),
        time: fields[3].parse().unwrap_or(0),
    })
}

fn repo_info_sync(dir: &Path) -> Result<RepoInfo, String> {
    let (branch, ahead, behind, changes, conflict) = status_snapshot(dir)?;
    let state = if conflict {
        "conflict"
    } else if changes > 0 {
        "dirty"
    } else {
        "clean"
    };
    Ok(RepoInfo {
        id: dir.to_string_lossy().to_string(),
        name: dir
            .file_name()
            .map(|name| name.to_string_lossy().to_string())
            .unwrap_or_default(),
        path: dir.to_string_lossy().to_string(),
        branch,
        ahead,
        behind,
        changes,
        state: state.to_string(),
        last: last_commit(dir).unwrap_or_default(),
    })
}

fn map_status(xy: &str) -> String {
    if xy == "??" {
        return "A".to_string();
    }
    if xy.contains('U') || xy == "AA" || xy == "DD" {
        return "U".to_string();
    }
    if xy.contains('A') {
        return "A".to_string();
    }
    if xy.contains('D') {
        return "D".to_string();
    }
    if xy.contains('R') {
        return "R".to_string();
    }
    "M".to_string()
}

fn status_files(dir: &Path) -> Result<Vec<ChangedFile>, String> {
    let raw = run_git(dir, &["status", "--porcelain"])?;
    let mut files = Vec::new();
    for line in raw.lines() {
        if line.len() < 3 {
            continue;
        }
        let xy = &line[..2];
        let mut path = line[3..].to_string();
        if let Some(index) = path.find(" -> ") {
            path = path[index + 4..].to_string();
        }
        if path.len() >= 2 && path.starts_with('"') && path.ends_with('"') {
            path = path[1..path.len() - 1].to_string();
        }
        files.push(ChangedFile {
            path,
            status: map_status(xy),
            staged: !xy.starts_with(' ') && xy != "??",
            untracked: xy == "??",
        });
    }
    Ok(files)
}

fn load_commits(dir: &Path, limit: usize) -> Result<Vec<Commit>, String> {
    let limit_arg = format!("-n{limit}");
    let raw = run_git(
        dir,
        &[
            "log",
            &limit_arg,
            "--date=unix",
            "--format=%H%x1f%h%x1f%an%x1f%at%x1f%s%x1f%P%x1f%D",
        ],
    )?;

    let mut commits = Vec::new();
    for line in raw.lines() {
        let fields: Vec<&str> = line.split('\u{1f}').collect();
        if fields.len() < 7 {
            continue;
        }
        let refs = fields[6]
            .split(',')
            .map(str::trim)
            .filter(|item| !item.is_empty())
            .map(str::to_string)
            .collect();
        commits.push(Commit {
            hash: fields[0].to_string(),
            short: fields[1].to_string(),
            author: fields[2].to_string(),
            time: fields[3].parse().unwrap_or(0),
            subject: fields[4].to_string(),
            refs,
            merge: fields[5].split_whitespace().count() > 1,
        });
    }
    Ok(commits)
}

fn scan_repos_sync(root: &str) -> Result<Vec<RepoInfo>, String> {
    let root_path = PathBuf::from(root);
    if !root_path.is_dir() {
        return Err(format!("工作区不存在：{root}"));
    }

    let mut dirs = Vec::new();
    if root_path.join(".git").exists() {
        dirs.push(root_path.clone());
    }
    let entries = std::fs::read_dir(&root_path).map_err(|error| format!("读取工作区失败：{error}"))?;
    for entry in entries {
        let entry = match entry {
            Ok(value) => value,
            Err(_) => continue,
        };
        let path = entry.path();
        if path.is_dir() && path.join(".git").exists() {
            dirs.push(path);
        }
    }
    dirs.sort_by(|left, right| left.file_name().cmp(&right.file_name()));

    let mut repos = Vec::new();
    for dir in dirs {
        match repo_info_sync(&dir) {
            Ok(info) => repos.push(info),
            Err(error) => eprintln!("[scan] 跳过 {}：{error}", dir.display()),
        }
    }
    Ok(repos)
}

fn file_diff_sync(path: &str, rel: &str, staged: bool) -> Result<String, String> {
    let dir = Path::new(path);
    let args: Vec<&str> = if staged {
        vec!["diff", "--cached", "--no-color", "--", rel]
    } else {
        vec!["diff", "--no-color", "--", rel]
    };
    let mut text = run_git(dir, &args)?;

    if text.trim().is_empty() && !staged {
        let tracked = run_git(dir, &["ls-files", "--error-unmatch", "--", rel]).is_ok();
        if !tracked {
            let full = checked_join(dir, rel)?;
            match std::fs::read(&full) {
                Ok(bytes) => {
                    if bytes.contains(&0) {
                        text = "二进制文件，无法预览差异".to_string();
                    } else {
                        let content = String::from_utf8_lossy(&bytes);
                        let mut preview = String::from("未跟踪文件 · 尚未加入版本控制\n\n");
                        for line in content.lines().take(300) {
                            preview.push('+');
                            preview.push_str(line);
                            preview.push('\n');
                        }
                        text = preview;
                    }
                }
                Err(_) => text = "未跟踪文件（无法读取内容）".to_string(),
            }
        }
    }
    Ok(text)
}

fn commit_files_sync(path: &str, hash: &str) -> Result<Vec<ChangedFile>, String> {
    let dir = Path::new(path);
    let raw = run_git(dir, &["show", "--name-status", "--format=", hash])?;
    let mut files = Vec::new();
    for line in raw.lines() {
        if line.trim().is_empty() {
            continue;
        }
        let parts: Vec<&str> = line.split('\t').collect();
        if parts.len() < 2 {
            continue;
        }
        let status = parts[0].chars().next().unwrap_or('M');
        let status = match status {
            'A' => "A",
            'D' => "D",
            'R' => "R",
            'C' => "A",
            _ => "M",
        };
        files.push(ChangedFile {
            path: parts[parts.len() - 1].to_string(),
            status: status.to_string(),
            staged: true,
            untracked: false,
        });
    }
    Ok(files)
}

fn summarize(output: &str) -> String {
    let line = output
        .lines()
        .find(|item| !item.trim().is_empty())
        .unwrap_or("完成")
        .trim();
    let mut text: String = line.chars().take(160).collect();
    if line.chars().count() > 160 {
        text.push('…');
    }
    text
}

fn batch_sync(paths: Vec<String>, kind: &str) -> Result<Vec<OpResult>, String> {
    let args: Vec<&str> = match kind {
        "fetch" => vec!["fetch", "--prune"],
        "pull" => vec!["pull", "--ff-only"],
        "push" => vec!["push"],
        _ => return Err("未知的批量操作".to_string()),
    };

    let mut results = Vec::new();
    for path in paths {
        let dir = PathBuf::from(&path);
        let name = dir
            .file_name()
            .map(|value| value.to_string_lossy().to_string())
            .unwrap_or_else(|| path.clone());
        match run_git(&dir, &args) {
            Ok(output) => results.push(OpResult {
                path,
                name,
                success: true,
                message: summarize(&output),
            }),
            Err(error) => results.push(OpResult {
                path,
                name,
                success: false,
                message: error,
            }),
        }
    }
    Ok(results)
}

#[tauri::command]
pub fn default_workspace() -> String {
    let home = std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .unwrap_or_default();
    for candidate in [
        format!("{home}/workspace/rusthing"),
        format!("{home}/workspace"),
    ] {
        if Path::new(&candidate).is_dir() {
            return candidate;
        }
    }
    home
}

#[tauri::command]
pub async fn scan_repos(root: String) -> Result<Vec<RepoInfo>, String> {
    blocking(move || scan_repos_sync(&root)).await
}

#[tauri::command]
pub async fn repo_detail(path: String) -> Result<RepoDetail, String> {
    blocking(move || {
        let dir = PathBuf::from(&path);
        Ok(RepoDetail {
            files: status_files(&dir)?,
            commits: load_commits(&dir, 40).unwrap_or_default(),
        })
    })
    .await
}

#[tauri::command]
pub async fn file_diff(path: String, rel: String, staged: bool) -> Result<String, String> {
    blocking(move || file_diff_sync(&path, &rel, staged)).await
}

#[tauri::command]
pub async fn stage_file(path: String, rel: String) -> Result<(), String> {
    blocking(move || {
        run_git(Path::new(&path), &["add", "--", &rel])?;
        Ok(())
    })
    .await
}

#[tauri::command]
pub async fn unstage_file(path: String, rel: String) -> Result<(), String> {
    blocking(move || {
        let dir = Path::new(&path);
        if run_git(dir, &["reset", "-q", "HEAD", "--", &rel]).is_err() {
            run_git(dir, &["rm", "--cached", "--quiet", "--", &rel])?;
        }
        Ok(())
    })
    .await
}

#[tauri::command]
pub async fn discard_file(path: String, rel: String, untracked: bool) -> Result<(), String> {
    blocking(move || {
        let dir = Path::new(&path);
        if untracked {
            let full = checked_join(dir, &rel)?;
            std::fs::remove_file(&full).map_err(|error| format!("删除未跟踪文件失败：{error}"))?;
        } else {
            run_git(dir, &["checkout", "--", &rel])?;
        }
        Ok(())
    })
    .await
}

#[tauri::command]
pub async fn commit_repo(path: String, message: String, amend: bool) -> Result<String, String> {
    blocking(move || {
        let dir = Path::new(&path);
        run_git(dir, &["add", "-A"])?;
        let mut args = vec!["commit", "-m", message.as_str()];
        if amend {
            args.push("--amend");
        }
        let output = run_git(dir, &args)?;
        let last = output.lines().last().unwrap_or("提交完成").trim().to_string();
        Ok(if last.is_empty() { "提交完成".to_string() } else { last })
    })
    .await
}

#[tauri::command]
pub async fn batch_fetch(paths: Vec<String>) -> Result<Vec<OpResult>, String> {
    blocking(move || batch_sync(paths, "fetch")).await
}

#[tauri::command]
pub async fn batch_pull(paths: Vec<String>) -> Result<Vec<OpResult>, String> {
    blocking(move || batch_sync(paths, "pull")).await
}

#[tauri::command]
pub async fn batch_push(paths: Vec<String>) -> Result<Vec<OpResult>, String> {
    blocking(move || batch_sync(paths, "push")).await
}

#[tauri::command]
pub async fn list_branches(path: String) -> Result<Vec<String>, String> {
    blocking(move || {
        let raw = run_git(
            Path::new(&path),
            &["for-each-ref", "--format=%(refname:short)", "refs/heads"],
        )?;
        Ok(raw
            .lines()
            .map(str::trim)
            .filter(|line| !line.is_empty())
            .map(str::to_string)
            .collect())
    })
    .await
}

#[tauri::command]
pub async fn checkout_branch(path: String, branch: String) -> Result<(), String> {
    blocking(move || {
        if branch.trim().is_empty() || branch.starts_with('-') {
            return Err("非法的分支名".to_string());
        }
        let dir = Path::new(&path);
        let reference = format!("refs/heads/{branch}");
        run_git(dir, &["rev-parse", "--verify", &reference])?;
        run_git(dir, &["checkout", &branch])?;
        Ok(())
    })
    .await
}

#[tauri::command]
pub async fn commit_files(path: String, hash: String) -> Result<Vec<ChangedFile>, String> {
    blocking(move || commit_files_sync(&path, &hash)).await
}

#[tauri::command]
pub async fn commit_diff(path: String, hash: String, rel: String) -> Result<String, String> {
    blocking(move || {
        run_git(
            Path::new(&path),
            &["show", "--format=", "--no-color", &hash, "--", &rel],
        )
    })
    .await
}

#[tauri::command]
pub fn open_repo(path: String) -> Result<(), String> {
    let dir = PathBuf::from(&path);
    if !dir.exists() {
        return Err("仓库目录不存在".to_string());
    }

    #[cfg(target_os = "macos")]
    let program = "open";
    #[cfg(target_os = "windows")]
    let program = "explorer";
    #[cfg(all(unix, not(target_os = "macos")))]
    let program = "xdg-open";

    Command::new(program)
        .arg(&dir)
        .spawn()
        .map_err(|error| format!("打开目录失败：{error}"))?;
    Ok(())
}
