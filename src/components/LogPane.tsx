import { FolderGit2, GitBranch, History, RefreshCw } from "lucide-react";
import type { Commit, RepoInfo } from "../types";
import { relativeTime } from "../utils";

export interface RepoCommits {
  repo: RepoInfo;
  commits: Commit[];
  loaded: boolean;
}

interface Props {
  groups: RepoCommits[];
  activeHash: string;
  activeRepoId: string;
  loading: boolean;
  multi: boolean;
  onActivateRepo: (repo: RepoInfo) => void;
  onSelect: (repo: RepoInfo, commit: Commit) => void;
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

export default function LogPane({
  groups,
  activeHash,
  activeRepoId,
  loading,
  multi,
  onActivateRepo,
  onSelect,
  onRefresh,
}: Props) {
  const total = groups.reduce((sum, group) => sum + group.commits.length, 0);

  return (
    <div className="pane active">
      <div className="log-filter">
        <span className="fchip on">
          <History size={12} />
          {multi ? `已选 ${groups.length} 个仓库 · 最近 ${total} 条提交` : `最近 ${total} 条提交`}
        </span>
        <span className="spacer" />
        <button type="button" className="icon-only" title="刷新提交记录" onClick={onRefresh}>
          <RefreshCw size={13} className={loading ? "spin" : undefined} />
        </button>
      </div>
      <div className="scroll">
        {groups.map((group) => (
          <div key={group.repo.id} className="commit-group">
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
                <span className="gcount">
                  {group.loaded ? `最近 ${group.commits.length} 条` : "读取中…"}
                </span>
              </div>
            )}
            {group.commits.map((commit) => (
              <div
                key={`${group.repo.id}-${commit.hash}`}
                className={`commit-row${
                  group.repo.id === activeRepoId && commit.hash === activeHash ? " active" : ""
                }`}
                onClick={() => onSelect(group.repo, commit)}
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
                        className={`ref${
                          ref.startsWith("tag:") ? " tag" : ref.startsWith("origin") ? " origin" : ""
                        }`}
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
          </div>
        ))}
        {!groups.length && (
          <div className="pane-empty">
            <History size={22} />
            <div>还没有提交记录</div>
          </div>
        )}
      </div>
    </div>
  );
}
