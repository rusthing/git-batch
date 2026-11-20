import { FileDiff, FolderGit2, GitBranch } from "lucide-react";
import type { ChangedFile, RepoInfo } from "../types";

export interface RepoChanges {
  repo: RepoInfo;
  files: ChangedFile[];
  loaded: boolean;
}

interface Props {
  groups: RepoChanges[];
  activeRepoId: string;
  activeFile: string;
  busy: boolean;
  multi: boolean;
  commitMsg: string;
  amend: boolean;
  onActivateRepo: (repo: RepoInfo) => void;
  onSelectFile: (repo: RepoInfo, file: ChangedFile) => void;
  onToggleStage: (repo: RepoInfo, file: ChangedFile, staged: boolean) => void;
  onCommit: () => void;
  onCommitAndPush: () => void;
  onCommitMsg: (value: string) => void;
  onAmend: (value: boolean) => void;
}

export default function ChangesPane({
  groups,
  activeRepoId,
  activeFile,
  busy,
  multi,
  commitMsg,
  amend,
  onActivateRepo,
  onSelectFile,
  onToggleStage,
  onCommit,
  onCommitAndPush,
  onCommitMsg,
  onAmend,
}: Props) {
  const totalFiles = groups.reduce((sum, group) => sum + group.files.length, 0);
  const hasRepo = groups.length > 0;

  return (
    <div className="pane active">
      <div className="scroll">
        {multi && (
          <div className="multi-hint">
            <span>
              已选 {groups.length} 个仓库 · 共 {totalFiles} 个变更文件
            </span>
            <span className="muted">变更按仓库分组，点击文件查看差异</span>
          </div>
        )}
        {groups.map((group) => (
          <div key={group.repo.id} className="repo-group">
            {multi && (
              <div
                className={`repo-group-head${group.repo.id === activeRepoId ? " active" : ""}`}
                onClick={() => onActivateRepo(group.repo)}
              >
                <FolderGit2 size={13} />
                <span className="gname">{group.repo.name}</span>
                <span className="gbranch">
                  <GitBranch size={10} />
                  {group.repo.branch}
                </span>
                {group.repo.state === "conflict" && <span className="chip danger">冲突</span>}
                <span className="gcount">
                  {group.loaded ? `${group.files.length} 个变更` : "读取中…"}
                </span>
              </div>
            )}
            {group.files.map((file) => (
              <div
                key={`${group.repo.id}-${file.path}-${file.status}`}
                className={`file-row${
                  group.repo.id === activeRepoId && file.path === activeFile ? " active" : ""
                }`}
                onClick={() => onSelectFile(group.repo, file)}
              >
                <label className="cb" onClick={(event) => event.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={file.staged}
                    onChange={(event) => onToggleStage(group.repo, file, event.target.checked)}
                  />
                </label>
                <span className={`fstat ${file.status}`}>{file.status}</span>
                <span className="fname">{file.path.split("/").pop()}</span>
                <span className="fdir">
                  {file.path.includes("/") ? file.path.slice(0, file.path.lastIndexOf("/")) : ""}
                </span>
              </div>
            ))}
            {group.loaded && !group.files.length && (
              <div className="group-empty">工作区干净，没有待提交的变更</div>
            )}
          </div>
        ))}
        {!hasRepo && (
          <div className="pane-empty">
            <FileDiff size={22} />
            <div>请选择一个仓库</div>
          </div>
        )}
      </div>
      <div className="composer">
        <textarea
          value={commitMsg}
          onChange={(event) => onCommitMsg(event.target.value)}
          placeholder={
            multi
              ? `提交信息（将提交到 ${groups.length} 个选中仓库，⌘/Ctrl + Enter 提交）`
              : "提交信息（⌘/Ctrl + Enter 提交）"
          }
          spellCheck={false}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              onCommit();
            }
          }}
        />
        <div className="composer-actions">
          <label className="checkline">
            <input type="checkbox" checked={amend} onChange={(event) => onAmend(event.target.checked)} />
            Amend
          </label>
          {multi && <span className="composer-scope">作用于 {groups.length} 个仓库</span>}
          <span className="spacer" />
          <button type="button" className="ghost" disabled={busy || !hasRepo} onClick={onCommitAndPush}>
            提交并推送
          </button>
          <button type="button" className="commit-btn" disabled={busy || !hasRepo} onClick={onCommit}>
            提交
          </button>
        </div>
      </div>
    </div>
  );
}
