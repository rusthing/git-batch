import { GitBranch } from "lucide-react";

interface Props {
  branch: string;
  repoCount: number;
  selectedCount: number;
  busy: string;
  ahead: number;
  behind: number;
}

export default function StatusBar({ branch, repoCount, selectedCount, busy, ahead, behind }: Props) {
  return (
    <footer className="statusbar">
      <span className="item">
        <GitBranch size={12} />
        {branch || "—"}
      </span>
      <span className="item">{repoCount} 个仓库</span>
      <span className="op">{busy || "就绪"}</span>
      {busy && (
        <span className="progress">
          <i />
        </span>
      )}
      <span className="spacer" />
      <span className="item">已选 {selectedCount} 个仓库</span>
      <span className="item">
        ↑{ahead} ↓{behind}
      </span>
    </footer>
  );
}
