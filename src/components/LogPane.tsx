import { GitCommit, History, RefreshCw } from "lucide-react";
import type { Commit } from "../types";
import { relativeTime } from "../utils";

interface Props {
  commits: Commit[];
  activeHash: string;
  loading: boolean;
  onSelect: (commit: Commit) => void;
  onRefresh: () => void;
}

function Graph({ merge }: { merge: boolean }) {
  return (
    <svg width="62" height="46" viewBox="0 0 62 46">
      <line x1="22" y1="0" x2="22" y2="46" stroke="#3d4045" strokeWidth="1.5" />
      {merge && (
        <path d="M38 0 C38 20 22 20 22 23" stroke="#5a4a70" strokeWidth="1.5" fill="none" />
      )}
      <circle
        cx="22"
        cy="23"
        r="3.6"
        fill="#1e1f22"
        stroke={merge ? "#a571d7" : "#4d8ff0"}
        strokeWidth="2"
      />
      {merge && <circle cx="38" cy="23" r="2.4" fill="#a571d7" />}
    </svg>
  );
}

export default function LogPane({ commits, activeHash, loading, onSelect, onRefresh }: Props) {
  return (
    <div className="pane active">
      <div className="log-filter">
        <span className="fchip on">
          <History size={12} />
          最近 {commits.length} 条提交
        </span>
        <span className="spacer" />
        <button type="button" className="icon-only" title="刷新提交记录" onClick={onRefresh}>
          <RefreshCw size={13} className={loading ? "spin" : undefined} />
        </button>
      </div>
      <div className="scroll">
        {commits.map((commit) => (
          <div
            key={commit.hash}
            className={`commit-row${commit.hash === activeHash ? " active" : ""}`}
            onClick={() => onSelect(commit)}
          >
            <span className="graph">
              <Graph merge={commit.merge} />
            </span>
            <div className="commit-body">
              <div className="commit-msg">
                {commit.subject}
                {commit.refs.map((ref) => (
                  <span
                    key={ref}
                    className={`ref${ref.startsWith("tag:") ? " tag" : ref.startsWith("origin") ? " origin" : ""}`}
                  >
                    {ref.replace("HEAD -> ", "")}
                  </span>
                ))}
              </div>
              <div className="commit-sub">
                <span className="hash">{commit.short}</span>
                <span>{commit.author}</span>
                <span>·</span>
                <span>{relativeTime(commit.time)}</span>
                {commit.merge && (
                  <>
                    <span>·</span>
                    <span>merge</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {!commits.length && (
          <div className="pane-empty">
            <GitCommit size={22} />
            <div>还没有提交记录</div>
          </div>
        )}
      </div>
    </div>
  );
}
