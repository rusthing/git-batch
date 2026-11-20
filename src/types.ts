export type RepoState = "clean" | "dirty" | "conflict";

export interface CommitSummary {
  hash: string;
  subject: string;
  author: string;
  time: number;
}

export interface RepoInfo {
  id: string;
  name: string;
  path: string;
  branch: string;
  ahead: number;
  behind: number;
  changes: number;
  state: RepoState;
  last: CommitSummary;
}

export type FileStatus = "M" | "A" | "D" | "R" | "U";

export interface ChangedFile {
  path: string;
  status: FileStatus;
  staged: boolean;
  untracked: boolean;
}

export interface Commit {
  hash: string;
  short: string;
  author: string;
  time: number;
  subject: string;
  refs: string[];
  merge: boolean;
}

export interface RepoDetail {
  files: ChangedFile[];
  commits: Commit[];
}

export interface OpResult {
  path: string;
  name: string;
  success: boolean;
  message: string;
}

export type OpKind = "fetch" | "pull" | "push";

export type LogLevel = "info" | "ok" | "warn" | "err";

export interface LogLine {
  time: string;
  level: LogLevel;
  text: string;
}
