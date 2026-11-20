import { GitBranch, Minus, Square, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.userAgent);

interface Props {
  workspace: string;
}

export default function TitleBar({ workspace }: Props) {
  const win = getCurrentWindow();

  return (
    <header className={`titlebar${isMac ? " mac" : ""}`} data-tauri-drag-region>
      <div className="brand" data-tauri-drag-region>
        <span className="logo">
          <GitBranch size={13} />
        </span>
        git-batch <small>· 批量 Git 工作台</small>
      </div>
      <div className="title-tabs" data-tauri-drag-region>
        <span className="on">工作区</span>
        <span>历史任务</span>
      </div>
      <span className="spacer" data-tauri-drag-region />
      <span className="workspace-path" title={workspace}>
        {workspace || "未选择工作区"}
      </span>
      {!isMac && (
        <div className="win-actions">
          <button type="button" title="最小化" onClick={() => void win.minimize()}>
            <Minus size={14} />
          </button>
          <button type="button" title="最大化" onClick={() => void win.toggleMaximize()}>
            <Square size={12} />
          </button>
          <button type="button" title="关闭" className="close" onClick={() => void win.close()}>
            <X size={14} />
          </button>
        </div>
      )}
    </header>
  );
}
