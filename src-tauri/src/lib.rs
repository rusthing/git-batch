mod git;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            git::default_workspace,
            git::scan_repos,
            git::repo_detail,
            git::file_diff,
            git::stage_file,
            git::unstage_file,
            git::discard_file,
            git::commit_repo,
            git::batch_fetch,
            git::batch_pull,
            git::batch_push,
            git::list_branches,
            git::checkout_branch,
            git::commit_files,
            git::commit_diff,
            git::open_repo,
        ])
        .run(tauri::generate_context!())
        .expect("error while running git-batch");
}
