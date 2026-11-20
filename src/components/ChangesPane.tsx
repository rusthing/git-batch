import { FileDiff } from "lucide-react";
import type { ChangedFile } from "../types";

interface Props {
  files: ChangedFile[];
  activeFile: string;
  busy: boolean;
  hasActive: boolean;
  commitMsg: string;
  amend: boolean;
  onSelectFile: (file: ChangedFile) => void;
  onToggleStage: (file: ChangedFile, staged: boolean) => void;
  onCommit: () => void;
  onCommitAndPush: () => void;
  onCommitMsg: (value: string) => void;
  onAmend: (value: boolean) => void;
}

export default function ChangesPane({
  files,
  activeFile,
  busy,
  hasActive,
  commitMsg,
  amend,
  onSelectFile,
  onToggleStage,
  onCommit,
  onCommitAndPush,
  onCommitMsg,
  onAmend,
}: Props) {
  const counts = files.reduce(
    (acc, file) => {
      acc[file.status] = (acc[file.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="pane active">
      <div className="scroll">
        {files.length > 0 && (
          <div className="files-summary">
            <span>
              已暂存 {files.filter((file) => file.staged).length} · 未暂存{" "}
              {files.filter((file) => !file.staged).length}
            </span>
            <span className="file-counts">
              {(["M", "A", "D", "R", "U"] as const)
                .filter((status) => counts[status])
                .map((status) => (
                  <span key={status} className={`fstat ${status}`}>
                    {counts[status]}
                    {status}
                  </span>
                ))}
            </span>
          </div>
        )}
        {files.map((file) => (
          <div
            key={`${file.path}-${file.status}`}
            className={`file-row${file.path === activeFile ? " active" : ""}`}
            onClick={() => onSelectFile(file)}
          >
            <label className="cb" onClick={(event) => event.stopPropagation()}>
              <input
                type="checkbox"
                checked={file.staged}
                onChange={(event) => onToggleStage(file, event.target.checked)}
              />
            </label>
            <span className={`fstat ${file.status}`}>{file.status}</span>
            <span className="fname">{file.path.split("/").pop()}</span>
            <span className="fdir">{file.path.includes("/") ? file.path.slice(0, file.path.lastIndexOf("/")) : ""}</span>
          </div>
        ))}
        {!files.length && (
          <div className="pane-empty">
            <FileDiff size={22} />
            <div>{hasActive ? "工作区干净，没有待提交的变更" : "请选择一个仓库"}</div>
          </div>
        )}
      </div>
      <div className="composer">
        <textarea
          value={commitMsg}
          onChange={(event) => onCommitMsg(event.target.value)}
          placeholder="提交信息（⌘/Ctrl + Enter 提交）"
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
          <span className="spacer" />
          <button
            type="button"
            className="ghost"
            disabled={busy || !hasActive}
            onClick={onCommitAndPush}
          >
            提交并推送
          </button>
          <button type="button" className="commit-btn" disabled={busy || !hasActive} onClick={onCommit}>
            提交
          </button>
        </div>
      </div>
    </div>
  );
}
