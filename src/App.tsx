import { useEffect, useRef, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import {
  AlertTriangle,
  CheckCircle2,
  FolderGit2,
  Layers,
  Terminal,
  XCircle,
} from "lucide-react";
import TitleBar from "./components/TitleBar";
import RepoList from "./components/RepoList";
import Toolbar from "./components/Toolbar";
import ChangesPane from "./components/ChangesPane";
import LogPane from "./components/LogPane";
import ConsolePane from "./components/ConsolePane";
import Inspector from "./components/Inspector";
import StatusBar from "./components/StatusBar";
import * as api from "./api";
import type { ChangedFile, Commit, LogLevel, LogLine, OpKind, RepoDetail, RepoInfo } from "./types";
import { clockNow, errorText } from "./utils";

type Tab = "changes" | "log" | "console";
type ToastKind = "ok" | "warn" | "err";
interface ToastItem {
  id: number;
  text: string;
  kind: ToastKind;
}
interface CommitView {
  commit: Commit;
  files: ChangedFile[];
  file: string;
}

const EMPTY_DETAIL: RepoDetail = { files: [], commits: [] };

export default function App() {
  const [workspace, setWorkspace] = useState("");
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState("");
  const [filter, setFilter] = useState("");
  const [tab, setTab] = useState<Tab>("changes");
  const [detail, setDetail] = useState<RepoDetail>(EMPTY_DETAIL);
  const [multiDetails, setMultiDetails] = useState<Record<string, RepoDetail>>({});
  const [activeFile, setActiveFile] = useState<ChangedFile | null>(null);
  const [fileRepoId, setFileRepoId] = useState("");
  const [diff, setDiff] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [commitView, setCommitView] = useState<CommitView | null>(null);
  const [commitMsg, setCommitMsg] = useState("");
  const [amend, setAmend] = useState(false);
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([
    { time: clockNow(), level: "info", text: "git-batch 已启动，等待扫描工作区" },
  ]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const initRef = useRef(false);
  const detailSeq = useRef(0);
  const toastSeq = useRef(0);

  const activeRepo = repos.find((repo) => repo.id === activeId) ?? null;
  const targets = selected.size
    ? repos.filter((repo) => selected.has(repo.id))
    : activeRepo
      ? [activeRepo]
      : [];
  const targetAhead = targets.reduce((sum, repo) => sum + repo.ahead, 0);
  const targetBehind = targets.reduce((sum, repo) => sum + repo.behind, 0);

  function pushLog(level: LogLevel, text: string) {
    setLogs((prev) => [...prev, { time: clockNow(), level, text }]);
  }

  function notify(text: string, kind: ToastKind = "ok") {
    const id = ++toastSeq.current;
    setToasts((prev) => [...prev, { id, text, kind }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  }

  async function loadDetail(id: string, preferPath?: string) {
    const seq = ++detailSeq.current;
    setDetailLoading(true);
    try {
      const [repoData, branchList] = await Promise.all([api.repoDetail(id), api.listBranches(id)]);
      if (seq !== detailSeq.current) return;
      setDetail(repoData);
      setBranches(branchList);
      setCommitView(null);
      const file = repoData.files.find((item) => item.path === preferPath) ?? repoData.files[0] ?? null;
      setActiveFile(file);
      setFileRepoId(file ? id : "");
      if (file) {
        const text = await api.fileDiff(id, file.path, file.staged);
        if (seq === detailSeq.current) setDiff(text);
      } else {
        setDiff("");
      }
    } catch (error) {
      if (seq === detailSeq.current) {
        pushLog("err", errorText(error));
        notify(errorText(error), "err");
      }
    } finally {
      if (seq === detailSeq.current) setDetailLoading(false);
    }
  }

  async function loadWorkspace(root: string) {
    setLoading(true);
    try {
      const list = await api.scanRepos(root);
      setRepos(list);
      setSelected((prev) => new Set([...prev].filter((id) => list.some((repo) => repo.id === id))));
      const next = list.some((repo) => repo.id === activeId) ? activeId : (list[0]?.id ?? "");
      setActiveId(next);
      pushLog("info", `扫描工作区 ${root}，发现 ${list.length} 个仓库`);
      if (next) {
        await loadDetail(next);
      } else {
        setDetail(EMPTY_DETAIL);
        setActiveFile(null);
        setCommitView(null);
        setDiff("");
      }
    } catch (error) {
      pushLog("err", errorText(error));
      notify(errorText(error), "err");
    } finally {
      setLoading(false);
    }
  }

  async function refreshAll(preferPath?: string) {
    if (!workspace) return;
    setLoading(true);
    try {
      const list = await api.scanRepos(workspace);
      setRepos(list);
      setSelected((prev) => new Set([...prev].filter((id) => list.some((repo) => repo.id === id))));
      const next = list.some((repo) => repo.id === activeId) ? activeId : (list[0]?.id ?? "");
      setActiveId(next);
      if (next) {
        await loadDetail(next, preferPath);
      } else {
        setDetail(EMPTY_DETAIL);
        setActiveFile(null);
        setCommitView(null);
        setDiff("");
      }
    } catch (error) {
      pushLog("err", errorText(error));
      notify(errorText(error), "err");
    } finally {
      setLoading(false);
    }
  }

  const selectionKey = [...selected].sort().join("\u0000");

  async function reloadMultiDetails() {
    if (selected.size <= 1) return;
    const ids = repos.filter((repo) => selected.has(repo.id)).map((repo) => repo.id);
    if (!ids.length) return;
    try {
      const entries = await Promise.all(
        ids.map(async (id) => [id, await api.repoDetail(id)] as const),
      );
      setMultiDetails(Object.fromEntries(entries) as Record<string, RepoDetail>);
    } catch (error) {
      pushLog("err", errorText(error));
    }
  }

  useEffect(() => {
    if (selected.size <= 1) {
      setMultiDetails({});
      return;
    }
    let cancelled = false;
    const ids = repos.filter((repo) => selected.has(repo.id)).map((repo) => repo.id);
    if (!ids.length) {
      setMultiDetails({});
      return;
    }
    void (async () => {
      try {
        const entries = await Promise.all(
          ids.map(async (id) => [id, await api.repoDetail(id)] as const),
        );
        if (!cancelled) {
          setMultiDetails(Object.fromEntries(entries) as Record<string, RepoDetail>);
        }
      } catch (error) {
        if (!cancelled) pushLog("err", errorText(error));
      }
    })();
    return () => {
      cancelled = true;
    };
    // 选中集合或仓库列表变化时重新加载多仓库视图
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey, repos]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    void (async () => {
      try {
        const saved = localStorage.getItem("git-batch.workspace");
        const root = saved || (await api.defaultWorkspace());
        setWorkspace(root);
        await loadWorkspace(root);
      } catch (error) {
        pushLog("err", errorText(error));
        notify(errorText(error), "err");
      }
    })();
    // 只在首次挂载时初始化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function activateRepo(id: string) {
    if (id === activeId) return;
    setActiveId(id);
    setCommitView(null);
    void loadDetail(id);
  }

  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function chooseWorkspace() {
    try {
      const picked = await open({
        directory: true,
        multiple: false,
        title: "选择 Git 工作区",
      });
      if (typeof picked !== "string" || !picked) return;
      localStorage.setItem("git-batch.workspace", picked);
      setWorkspace(picked);
      setSelected(new Set());
      setActiveId("");
      setFilter("");
      setDetail(EMPTY_DETAIL);
      setActiveFile(null);
      setCommitView(null);
      setDiff("");
      await loadWorkspace(picked);
    } catch (error) {
      pushLog("err", errorText(error));
      notify("打开目录选择器失败：" + errorText(error), "err");
    }
  }

  async function runBatch(kind: OpKind) {
    if (!targets.length) {
      notify("请先选择一个仓库", "warn");
      return;
    }
    const label = { fetch: "Fetch", pull: "Pull", push: "Push" }[kind];
    const paths = targets.map((repo) => repo.path);
    setBusy(`${label} · ${targets.length} 个仓库…`);
    pushLog("info", `[${label}] 开始：${targets.map((repo) => repo.name).join("、")}`);
    try {
      const run = kind === "fetch" ? api.batchFetch : kind === "pull" ? api.batchPull : api.batchPush;
      const results = await run(paths);
      results.forEach((result) => {
        pushLog(
          result.success ? "ok" : "err",
          `[${label}] ${result.name}：${result.message || (result.success ? "完成" : "失败")}`,
        );
      });
      const failed = results.filter((result) => !result.success).length;
      notify(
        failed ? `${label} 完成，${failed} 个仓库失败` : `${label} 完成（${results.length} 个仓库）`,
        failed ? "warn" : "ok",
      );
    } catch (error) {
      pushLog("err", `[${label}] ${errorText(error)}`);
      notify(errorText(error), "err");
    } finally {
      setBusy("");
      await refreshAll(activeFile?.path);
    }
  }

  async function commit(pushAfter: boolean) {
    if (!targets.length) {
      notify("请先选择一个仓库", "warn");
      return;
    }
    const message = commitMsg.trim();
    if (!message) {
      notify("请先填写提交信息", "warn");
      return;
    }
    const commitTargets = amend ? targets : targets.filter((repo) => repo.changes > 0);
    if (!commitTargets.length) {
      notify("选中的仓库没有可提交的变更", "warn");
      return;
    }
    setBusy(`${pushAfter ? "提交并推送" : "提交"} · ${commitTargets.length} 个仓库…`);
    const succeeded: string[] = [];
    let failed = 0;
    for (const repo of commitTargets) {
      try {
        const output = await api.commitRepo(repo.path, message, amend);
        const first = output.split("\n").find((line) => line.trim()) ?? "提交完成";
        pushLog("ok", `[提交] ${repo.name}：${first.trim()}`);
        succeeded.push(repo.path);
      } catch (error) {
        failed += 1;
        pushLog("err", `[提交] ${repo.name}：${errorText(error)}`);
      }
    }
    if (pushAfter && succeeded.length) {
      pushLog("info", `[Push] 开始：${succeeded.length} 个仓库`);
      try {
        const results = await api.batchPush(succeeded);
        results.forEach((result) => {
          pushLog(result.success ? "ok" : "err", `[Push] ${result.name}：${result.message || "完成"}`);
        });
        const pushFailed = results.filter((result) => !result.success).length;
        if (pushFailed) {
          failed += pushFailed;
          notify(`提交完成，${pushFailed} 个仓库推送失败`, "warn");
        } else {
          notify(`已提交并推送 ${results.length} 个仓库`, "ok");
        }
      } catch (error) {
        failed += 1;
        pushLog("err", `[Push] ${errorText(error)}`);
        notify(errorText(error), "err");
      }
    } else {
      notify(
        failed ? `提交完成，${failed} 个仓库失败` : `已在 ${succeeded.length} 个仓库创建提交`,
        failed ? "warn" : "ok",
      );
    }
    setBusy("");
    setCommitMsg("");
    setAmend(false);
    await refreshAll();
  }

  async function toggleStage(repo: RepoInfo, file: ChangedFile, staged: boolean) {
    setBusy(staged ? "暂存文件…" : "取消暂存…");
    try {
      if (staged) await api.stageFile(repo.path, file.path);
      else await api.unstageFile(repo.path, file.path);
      if (repo.id === activeId) await loadDetail(repo.id, file.path);
      await reloadMultiDetails();
    } catch (error) {
      pushLog("err", errorText(error));
      notify(errorText(error), "err");
    } finally {
      setBusy("");
    }
  }

  async function discard(file: ChangedFile) {
    if (!activeRepo) return;
    if (!window.confirm(`确认回滚 ${file.path} 的本地改动？此操作不可恢复。`)) return;
    setBusy("回滚文件…");
    try {
      await api.discardFile(activeRepo.path, file.path, file.untracked);
      pushLog("warn", `[回滚] ${activeRepo.name}：${file.path}`);
      notify("已回滚 " + file.path, "warn");
      await loadDetail(activeRepo.id);
      await reloadMultiDetails();
    } catch (error) {
      pushLog("err", errorText(error));
      notify(errorText(error), "err");
    } finally {
      setBusy("");
    }
  }

  async function selectFile(repo: RepoInfo, file: ChangedFile) {
    if (repo.id !== activeId) {
      setActiveId(repo.id);
      await loadDetail(repo.id, file.path);
      return;
    }
    setActiveFile(file);
    setFileRepoId(repo.id);
    setCommitView(null);
    try {
      setDiff(await api.fileDiff(repo.path, file.path, file.staged));
    } catch (error) {
      pushLog("err", errorText(error));
    }
  }

  async function openCommit(repo: RepoInfo, commit: Commit) {
    if (repo.id !== activeId) {
      setActiveId(repo.id);
      setActiveFile(null);
      setFileRepoId("");
    }
    try {
      const files = await api.commitFiles(repo.path, commit.hash);
      const first = files[0]?.path ?? "";
      setCommitView({ commit, files, file: first });
      setDiff(first ? await api.commitDiff(repo.path, commit.hash, first) : "");
    } catch (error) {
      pushLog("err", errorText(error));
      notify(errorText(error), "err");
    }
  }

  async function selectCommitFile(file: ChangedFile) {
    if (!activeRepo || !commitView) return;
    setCommitView({ ...commitView, file: file.path });
    try {
      setDiff(await api.commitDiff(activeRepo.path, commitView.commit.hash, file.path));
    } catch (error) {
      pushLog("err", errorText(error));
    }
  }

  async function checkout(branch: string) {
    if (!activeRepo) return;
    if (!window.confirm(`切换到分支 ${branch}？未提交的改动可能会阻止切换。`)) return;
    setBusy(`切换分支 ${branch}…`);
    try {
      await api.checkoutBranch(activeRepo.path, branch);
      pushLog("ok", `[分支] ${activeRepo.name} → ${branch}`);
      notify(`已切换到 ${branch}`, "ok");
      await refreshAll();
    } catch (error) {
      pushLog("err", errorText(error));
      notify(errorText(error), "err");
    } finally {
      setBusy("");
    }
  }

  function changeTab(next: Tab) {
    setTab(next);
    if (next !== "log" && commitView) {
      setCommitView(null);
      if (activeRepo) {
        if (activeFile && fileRepoId === activeRepo.id) {
          void api.fileDiff(activeRepo.path, activeFile.path, activeFile.staged).then(setDiff);
        } else {
          void loadDetail(activeRepo.id);
        }
      }
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      notify("已复制到剪贴板", "ok");
    } catch {
      notify("复制失败，请手动选择文本", "warn");
    }
  }

  async function openRepository() {
    if (!activeRepo) return;
    try {
      await api.openRepo(activeRepo.path);
    } catch (error) {
      notify(errorText(error), "err");
    }
  }

  const selectedRepos = repos.filter((repo) => selected.has(repo.id));
  const isMulti = selectedRepos.length > 1;
  const changeGroups = isMulti
    ? selectedRepos.map((repo) => ({
        repo,
        files: multiDetails[repo.id]?.files ?? [],
        loaded: !!multiDetails[repo.id],
      }))
    : activeRepo
      ? [{ repo: activeRepo, files: detail.files, loaded: true }]
      : [];
  const commitGroups = isMulti
    ? selectedRepos.map((repo) => ({
        repo,
        commits: multiDetails[repo.id]?.commits ?? [],
        loaded: !!multiDetails[repo.id],
      }))
    : activeRepo
      ? [{ repo: activeRepo, commits: detail.commits, loaded: true }]
      : [];
  const totalFiles = changeGroups.reduce((sum, group) => sum + group.files.length, 0);
  const totalCommits = commitGroups.reduce((sum, group) => sum + group.commits.length, 0);
  const multiLoading = isMulti && selectedRepos.some((repo) => !multiDetails[repo.id]);

  const inspectorMode = commitView ? "commit" : activeFile ? "file" : "empty";

  return (
    <div className="app">
      <TitleBar workspace={workspace} />

      <div className="main">
        <RepoList
          repos={repos}
          selected={selected}
          activeId={activeId}
          filter={filter}
          loading={loading}
          onFilter={setFilter}
          onActivate={activateRepo}
          onToggle={toggleSelect}
          onSelectMany={(ids) => setSelected(new Set(ids))}
          onChooseWorkspace={() => void chooseWorkspace()}
          onRefresh={() => void refreshAll(activeFile?.path)}
        />

        <section className="work">
          <Toolbar
            ahead={targetAhead}
            behind={targetBehind}
            branch={activeRepo?.branch ?? ""}
            branches={branches}
            busy={!!busy}
            hasActive={!!activeRepo}
            onFetch={() => void runBatch("fetch")}
            onPull={() => void runBatch("pull")}
            onPush={() => void runBatch("push")}
            onRefresh={() => void refreshAll(activeFile?.path)}
            onCheckout={(branch) => void checkout(branch)}
            onBatchCommit={() => void commit(false)}
          />

          {activeRepo ? (
            <>
              <div className="repo-head">
                <div className="repo-title">
                  <span className="repo-name">
                    {isMulti ? `${selectedRepos.length} 个仓库` : activeRepo.name}
                  </span>
                  <span className="repo-path" title={isMulti ? undefined : activeRepo.path}>
                    {isMulti ? "变更与提交记录按仓库分组展示" : activeRepo.path}
                  </span>
                </div>
                <div className="repo-meta">
                  {isMulti ? (
                    <>
                      {targetAhead > 0 && <span className="chip up">↑ {targetAhead} 待推送</span>}
                      {targetBehind > 0 && <span className="chip down">↓ {targetBehind} 待拉取</span>}
                      <span className="chip">
                        {selectedRepos.length} 个仓库 · {totalFiles} 个变更
                      </span>
                      {selectedRepos.some((repo) => repo.state === "conflict") && (
                        <span className="chip danger">
                          <AlertTriangle size={11} /> 含冲突仓库
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {activeRepo.ahead > 0 && (
                        <span className="chip up">↑ {activeRepo.ahead} 待推送</span>
                      )}
                      {activeRepo.behind > 0 && (
                        <span className="chip down">↓ {activeRepo.behind} 待拉取</span>
                      )}
                      {activeRepo.state === "conflict" && (
                        <span className="chip danger">
                          <AlertTriangle size={11} /> 存在冲突
                        </span>
                      )}
                      {activeRepo.state === "clean" && <span className="chip">工作区干净</span>}
                    </>
                  )}
                  {(detailLoading || multiLoading) && <span className="chip">读取中…</span>}
                </div>
              </div>

              {selected.size > 1 && (
                <div className="batch-banner">
                  <Layers size={13} />
                  <span>
                    已选 <b>{selected.size}</b> 个仓库，变更与提交记录按仓库分组；工具栏与批量提交作用于全部选中项
                  </span>
                  <button type="button" className="clear" onClick={() => setSelected(new Set<string>())}>
                    清除选择
                  </button>
                </div>
              )}

              <div className="tabs">
                <button
                  type="button"
                  className={`tab${tab === "changes" ? " active" : ""}`}
                  onClick={() => changeTab("changes")}
                >
                  变更 <span className="count">{totalFiles}</span>
                </button>
                <button
                  type="button"
                  className={`tab${tab === "log" ? " active" : ""}`}
                  onClick={() => changeTab("log")}
                >
                  提交记录 <span className="count">{totalCommits}</span>
                </button>
                <button
                  type="button"
                  className={`tab${tab === "console" ? " active" : ""}`}
                  onClick={() => changeTab("console")}
                >
                  控制台 <span className="count">{logs.length}</span>
                </button>
                <span className="spacer" />
                <span className="tab-hint">
                  <Terminal size={11} />
                  {isMulti ? `${selectedRepos.length} 个仓库` : activeRepo.branch}
                </span>
              </div>

              <div className="pane-wrap">
                {tab === "changes" && (
                  <ChangesPane
                    groups={changeGroups}
                    activeRepoId={activeId}
                    activeFile={activeFile?.path ?? ""}
                    busy={!!busy}
                    multi={isMulti}
                    commitMsg={commitMsg}
                    amend={amend}
                    onActivateRepo={(repo) => activateRepo(repo.id)}
                    onSelectFile={(repo, file) => void selectFile(repo, file)}
                    onToggleStage={(repo, file, staged) => void toggleStage(repo, file, staged)}
                    onCommit={() => void commit(false)}
                    onCommitAndPush={() => void commit(true)}
                    onCommitMsg={setCommitMsg}
                    onAmend={setAmend}
                  />
                )}
                {tab === "log" && (
                  <LogPane
                    groups={commitGroups}
                    activeHash={commitView?.commit.hash ?? ""}
                    activeRepoId={activeId}
                    loading={detailLoading || multiLoading}
                    multi={isMulti}
                    onActivateRepo={(repo) => activateRepo(repo.id)}
                    onSelect={(repo, commit) => void openCommit(repo, commit)}
                    onRefresh={() => {
                      if (isMulti) void reloadMultiDetails();
                      if (activeRepo) void loadDetail(activeRepo.id, activeFile?.path);
                    }}
                  />
                )}
                {tab === "console" && (
                  <ConsolePane lines={logs} onClear={() => setLogs([])} />
                )}
              </div>
            </>
          ) : (
            <div className="workspace-empty">
              <FolderGit2 size={30} />
              <h3>{loading ? "正在扫描工作区…" : "没有找到 Git 仓库"}</h3>
              <p>
                选择包含 Git 仓库的目录，或把仓库放到 <code>{workspace || "工作区"}</code> 下后重新扫描。
              </p>
              <button type="button" className="commit-btn" onClick={() => void chooseWorkspace()}>
                选择工作区
              </button>
            </div>
          )}
        </section>

        <Inspector
          mode={inspectorMode}
          file={activeFile}
          diff={diff}
          commit={commitView?.commit ?? null}
          commitFiles={commitView?.files ?? []}
          commitFile={commitView?.file ?? ""}
          busy={!!busy}
          onStage={() => activeRepo && activeFile && void toggleStage(activeRepo, activeFile, true)}
          onUnstage={() => activeRepo && activeFile && void toggleStage(activeRepo, activeFile, false)}
          onDiscard={() => activeFile && void discard(activeFile)}
          onSelectCommitFile={(file) => void selectCommitFile(file)}
          onOpenRepo={() => void openRepository()}
          onCopy={(text) => void copy(text)}
        />
      </div>

      <StatusBar
        branch={activeRepo?.branch ?? ""}
        repoCount={repos.length}
        selectedCount={selected.size}
        busy={busy}
        ahead={targetAhead}
        behind={targetBehind}
      />

      <div className="toast-host">
        {toasts.map((toast) => (
          <div key={toast.id} className={`gb-toast ${toast.kind}`}>
            {toast.kind === "ok" ? (
              <CheckCircle2 size={15} />
            ) : toast.kind === "warn" ? (
              <AlertTriangle size={15} />
            ) : (
              <XCircle size={15} />
            )}
            <span>{toast.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
