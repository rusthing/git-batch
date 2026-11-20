import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  ChevronDown,
  GitBranch,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
} from "lucide-react";

interface Props {
  ahead: number;
  behind: number;
  branch: string;
  branches: string[];
  busy: boolean;
  hasActive: boolean;
  onFetch: () => void;
  onPull: () => void;
  onPush: () => void;
  onRefresh: () => void;
  onCheckout: (branch: string) => void;
  onBatchCommit: () => void;
}

export default function Toolbar({
  ahead,
  behind,
  branch,
  branches,
  busy,
  hasActive,
  onFetch,
  onPull,
  onPush,
  onRefresh,
  onCheckout,
  onBatchCommit,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <div className="toolbar">
      <button type="button" className="tbtn" onClick={onFetch} disabled={busy || !hasActive}>
        <RefreshCw size={14} />
        Fetch
      </button>
      <button type="button" className="tbtn" onClick={onPull} disabled={busy || !hasActive}>
        <ArrowDownToLine size={14} />
        Pull
        {behind > 0 && <span className="num">{behind}</span>}
      </button>
      <button type="button" className="tbtn" onClick={onPush} disabled={busy || !hasActive}>
        <ArrowUpFromLine size={14} />
        Push
        {ahead > 0 && <span className="num">{ahead}</span>}
      </button>
      <span className="tb-sep" />
      <div className="branch-wrap" ref={menuRef}>
        <button
          type="button"
          className="branch-pill"
          onClick={() => setMenuOpen((open) => !open)}
          disabled={!hasActive || busy}
        >
          <GitBranch size={13} />
          <span>{branch || "—"}</span>
          <ChevronDown size={13} />
        </button>
        {menuOpen && (
          <div className="branch-menu">
            <div className="branch-menu-head">切换分支</div>
            {branches.map((item) => (
              <button
                key={item}
                type="button"
                className={item === branch ? "on" : undefined}
                onClick={() => {
                  setMenuOpen(false);
                  if (item !== branch) onCheckout(item);
                }}
              >
                <GitBranch size={12} />
                <span>{item}</span>
                {item === branch && <Check size={12} />}
              </button>
            ))}
            {!branches.length && <div className="branch-empty">没有可切换的本地分支</div>}
          </div>
        )}
      </div>
      <span className="spacer" />
      <button
        type="button"
        className="tbtn icon-only"
        title="刷新当前仓库"
        onClick={onRefresh}
        disabled={busy}
      >
        <RefreshCw size={14} className={busy ? "spin" : undefined} />
      </button>
      <button type="button" className="tbtn icon-only" title="搜索提交（即将支持）">
        <Search size={14} />
      </button>
      <button type="button" className="tbtn icon-only" title="视图设置（即将支持）">
        <Settings size={14} />
      </button>
      <button type="button" className="tbtn icon-only" title="更多">
        <MoreHorizontal size={14} />
      </button>
      <button type="button" className="primary" onClick={onBatchCommit} disabled={busy || !hasActive}>
        <Check size={14} />
        批量提交
      </button>
    </div>
  );
}
