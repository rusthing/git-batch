import { Copy, ExternalLink, FileDiff, GitCommit } from "lucide-react";
import type { ChangedFile, Commit } from "../types";
import { relativeTime } from "../utils";

interface Props {
  mode: "empty" | "file" | "commit";
  file: ChangedFile | null;
  diff: string;
  commit: Commit | null;
  commitFiles: ChangedFile[];
  commitFile: string;
  busy: boolean;
  onStage: () => void;
  onUnstage: () => void;
  onDiscard: () => void;
  onSelectCommitFile: (file: ChangedFile) => void;
  onOpenRepo: () => void;
  onCopy: (text: string) => void;
}

function DiffView({ text }: { text: string }) {
  if (!text.trim()) {
    return (
      <div className="pane-empty small">
        <FileDiff size={20} />
        <div>暂无可显示的差异</div>
      </div>
    );
  }
  return (
    <div className="diff">
      {text.split("\n").map((line, index) => {
        const cls = line.startsWith("@@")
          ? "hunk"
          : line.startsWith("+")
            ? "add"
            : line.startsWith("-")
              ? "del"
              : /^(<<<<<<<|=======|>>>>>>>)/.test(line)
                ? "conflict"
                : "";
        return (
          <div key={index} className={`dline ${cls}`}>
            <span className="ln">{index + 1}</span>
            <span className="txt">{line || " "}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Inspector({
  mode,
  file,
  diff,
  commit,
  commitFiles,
  commitFile,
  busy,
  onStage,
  onUnstage,
  onDiscard,
  onSelectCommitFile,
  onOpenRepo,
  onCopy,
}: Props) {
  return (
    <aside className="inspector">
      <div className="insp-head">
        {mode === "commit" ? <GitCommit size={14} /> : <FileDiff size={14} />}
        <span>{mode === "commit" ? "提交详情" : "文件差异"}</span>
        <span className="spacer" />
        <button type="button" className="mini" title="在文件管理器中打开仓库" onClick={onOpenRepo}>
          <ExternalLink size={13} />
        </button>
        {mode === "commit" && commit && (
          <button type="button" className="mini" title="复制完整哈希" onClick={() => onCopy(commit.hash)}>
            <Copy size={13} />
          </button>
        )}
      </div>

      {mode === "empty" && (
        <div className="pane-empty">
          <FileDiff size={22} />
          <div>选择左侧文件或提交记录查看详情</div>
        </div>
      )}

      {mode === "file" && file && (
        <>
          <div className="insp-sub" title={file.path}>
            <span className={`fstat ${file.status}`}>{file.status}</span>
            {file.path}
          </div>
          <DiffView text={diff} />
          <div className="insp-foot">
            {file.staged ? (
              <button type="button" className="ghost" disabled={busy} onClick={onUnstage}>
                取消暂存
              </button>
            ) : (
              <button type="button" className="ghost" disabled={busy} onClick={onStage}>
                暂存文件
              </button>
            )}
            <button type="button" className="ghost danger" disabled={busy} onClick={onDiscard}>
              回滚
            </button>
          </div>
        </>
      )}

      {mode === "commit" && commit && (
        <>
          <div className="insp-sub">
            {commit.short} · {commit.author} · {relativeTime(commit.time)}
          </div>
          <div className="commit-detail">
            <div className="commit-subject">{commit.subject}</div>
            <div className="refs">
              {commit.refs.map((ref) => (
                <span
                  key={ref}
                  className={`ref${ref.startsWith("tag:") ? " tag" : ref.startsWith("origin") ? " origin" : ""}`}
                >
                  {ref.replace("HEAD -> ", "")}
                </span>
              ))}
            </div>
            <div className="commit-file-list">
              {commitFiles.map((item) => (
                <div
                  key={item.path}
                  className={`file-row compact${item.path === commitFile ? " active" : ""}`}
                  onClick={() => onSelectCommitFile(item)}
                >
                  <span className={`fstat ${item.status}`}>{item.status}</span>
                  <span className="fname">{item.path}</span>
                </div>
              ))}
              {!commitFiles.length && <div className="muted-note">该提交没有文件变更记录</div>}
            </div>
          </div>
          <DiffView text={diff} />
          <div className="insp-foot">
            <button type="button" className="ghost" onClick={() => onCopy(commit.hash)}>
              <Copy size={12} />
              复制哈希
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
