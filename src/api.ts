import { invoke } from "@tauri-apps/api/core";
import type { ChangedFile, OpResult, RepoDetail, RepoInfo } from "./types";

export function defaultWorkspace(): Promise<string> {
  return invoke<string>("default_workspace");
}

export function scanRepos(root: string): Promise<RepoInfo[]> {
  return invoke<RepoInfo[]>("scan_repos", { root });
}

export function repoDetail(path: string): Promise<RepoDetail> {
  return invoke<RepoDetail>("repo_detail", { path });
}

export function fileDiff(path: string, rel: string, staged: boolean): Promise<string> {
  return invoke<string>("file_diff", { path, rel, staged });
}

export function stageFile(path: string, rel: string): Promise<void> {
  return invoke<void>("stage_file", { path, rel });
}

export function unstageFile(path: string, rel: string): Promise<void> {
  return invoke<void>("unstage_file", { path, rel });
}

export function discardFile(path: string, rel: string, untracked: boolean): Promise<void> {
  return invoke<void>("discard_file", { path, rel, untracked });
}

export function commitRepo(path: string, message: string, amend: boolean): Promise<string> {
  return invoke<string>("commit_repo", { path, message, amend });
}

export function batchFetch(paths: string[]): Promise<OpResult[]> {
  return invoke<OpResult[]>("batch_fetch", { paths });
}

export function batchPull(paths: string[]): Promise<OpResult[]> {
  return invoke<OpResult[]>("batch_pull", { paths });
}

export function batchPush(paths: string[]): Promise<OpResult[]> {
  return invoke<OpResult[]>("batch_push", { paths });
}

export function listBranches(path: string): Promise<string[]> {
  return invoke<string[]>("list_branches", { path });
}

export function checkoutBranch(path: string, branch: string): Promise<void> {
  return invoke<void>("checkout_branch", { path, branch });
}

export function commitFiles(path: string, hash: string): Promise<ChangedFile[]> {
  return invoke<ChangedFile[]>("commit_files", { path, hash });
}

export function commitDiff(path: string, hash: string, rel: string): Promise<string> {
  return invoke<string>("commit_diff", { path, hash, rel });
}

export function openRepo(path: string): Promise<void> {
  return invoke<void>("open_repo", { path });
}
