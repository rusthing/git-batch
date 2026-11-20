import { FolderGit2, FolderOpen, GitBranch, MoreHorizontal, RefreshCw, Search } from "lucide-react";
import type { RepoInfo } from "../types";

interface Props {
  repos: RepoInfo[];
  selected: Set<string>;
  activeId: string;
  filter: string;
  loading: boolean;
  onFilter: (value: string) => void;
  onActivate: (id: string) => void;
  onToggle: (id: string, checked: boolean) => void;
  onSelectMany: (ids: string[]) => void;
  onChooseWorkspace: () => void;
  onRefresh: () => void;
}

export default function RepoList({
  repos,
  selected,
  activeId,
  filter,
  loading,
  onFilter,
  onActivate,
  onToggle,
  onSelectMany,
  onChooseWorkspace,
  onRefresh,
}: Props) {
  const keyword = filter.trim().toLowerCase();
  const visible = repos.filter(
    (repo) =>
      !keyword ||
      repo.name.toLowerCase().includes(keyword) ||
      repo.path.toLowerCase().includes(keyword),
  );

  return (
    <aside className="sidebar">
      <div className="side-head">
        <span>仓库</span>
        <span className="pill">{repos.length}</span>
        <span className="spacer" />
        <button type="button" className="mini" title="重新扫描工作区" onClick={onRefresh}>
          <RefreshCw size={13} className={loading ? "spin" : undefined} />
        </button>
        <button type="button" className="mini" title="切换工作区" onClick={onChooseWorkspace}>
          <FolderOpen size={13} />
        </button>
      </div>
      <div className="side-search">
        <Search size={13} />
        <input
          value={filter}
          onChange={(event) => onFilter(event.target.value)}
          placeholder="筛选仓库 / 路径"
          spellCheck={false}
        />
      </div>
      <div className="side-sub">
        <span>工作区</span>
        <span>已选 {selected.size}</span>
      </div>
      <div className="repo-list">
        {visible.map((repo) => {
          const checked = selected.has(repo.id);
          const active = repo.id === activeId;
          return (
            <div
              key={repo.id}
              className={`repo-row${active ? " active" : ""}`}
              onClick={() => onActivate(repo.id)}
            >
              <label className="cb" title="加入批量选择" onClick={(event) => event.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => onToggle(repo.id, event.target.checked)}
                />
              </label>
              <span className={`state-dot state-${repo.state}`} />
              <span className="repo-icon">
                <FolderGit2 size={14} />
              </span>
              <div className="repo-main">
                <div className="repo-line">
                  <span className="rname">{repo.name}</span>
                  {repo.changes > 0 && <span className="chg">{repo.changes}</span>}
                </div>
                <div className="repo-sub">
                  <GitBranch size={11} />
                  <span>{repo.branch}</span>
                  {repo.behind > 0 && <span>· {repo.behind}↓</span>}
                  {repo.ahead > 0 && <span>· {repo.ahead}↑</span>}
                </div>
              </div>
            </div>
          );
        })}
        {!visible.length && (
          <div className="side-empty">
            {repos.length ? "没有匹配的仓库" : loading ? "正在扫描工作区…" : "该工作区没有 Git 仓库"}
          </div>
        )}
      </div>
      <div className="side-foot">
        <button type="button" onClick={() => onSelectMany(repos.map((repo) => repo.id))}>
          全选
        </button>
        <button
          type="button"
          onClick={() => onSelectMany(repos.filter((repo) => repo.changes > 0).map((repo) => repo.id))}
        >
          仅选有变更
        </button>
        <button type="button" className="icon-only" title="更多">
          <MoreHorizontal size={14} />
        </button>
      </div>
    </aside>
  );
}
