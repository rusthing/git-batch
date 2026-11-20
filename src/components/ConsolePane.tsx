import { Terminal } from "lucide-react";
import type { LogLine } from "../types";

interface Props {
  lines: LogLine[];
  onClear: () => void;
}

export default function ConsolePane({ lines, onClear }: Props) {
  return (
    <div className="pane active">
      <div className="console-toolbar">
        <span>
          <Terminal size={12} />
          本次会话 {lines.length} 条记录
        </span>
        <span className="spacer" />
        <button type="button" className="link-btn" onClick={onClear}>
          清空
        </button>
      </div>
      <div className="scroll">
        <div className="console">
          {lines.map((line, index) => (
            <div className="line" key={`${line.time}-${index}`}>
              <span className="t">[{line.time}]</span>
              <span className={line.level}>{line.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
