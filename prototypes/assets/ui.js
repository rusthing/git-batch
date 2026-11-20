/* git-batch 原型共享资源：Lucide 图标、mock 数据、通用辅助函数 */
(function () {
  var ICONS = {
    'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    'minus': '<path d="M5 12h14"/>',
    'arrow-down-to-line': '<path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/>',
    'arrow-up-from-line': '<path d="m18 9-6-6-6 6"/><path d="M12 3v14"/><path d="M5 21h14"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-up': '<path d="m18 15-6-6-6 6"/>',
    'folder': '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    'terminal': '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
    'file-diff': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 13h6"/><path d="M12 10v6"/>',
    'file': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
    'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
    'more-horizontal': '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    'play': '<polygon points="6 3 20 12 6 21 6 3"/>',
    'pause': '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    'square': '<rect width="18" height="18" x="3" y="3" rx="2"/>',
    'filter': '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    'columns': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/>',
    'history': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    'list': '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    'git-branch': '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    'git-commit': '<circle cx="12" cy="12" r="3"/><path d="M3 12h6"/><path d="M15 12h6"/>',
    'git-merge': '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>',
    'git-pull-request': '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M6 9v12"/>',
    'cloud-download': '<path d="M12 13v8l-4-4"/><path d="m12 21 4-4"/><path d="M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284"/>',
    'cloud-upload': '<path d="M12 13v8"/><path d="m8 17 4-4 4 4"/><path d="M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284"/>',
    'copy': '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    'zap': '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    'shield-alert': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    'layers': '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    'corner-down-right': '<polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>',
    'loader': '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'tag': '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'activity': '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'
  };

  window.icon = function (name, size, cls) {
    var path = ICONS[name] || ICONS['info'];
    return '<svg class="ico ' + (cls || '') + '" width="' + (size || 16) + '" height="' + (size || 16) +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  };

  var MOCK = {
    repos: [
      { id: 'adm-rs', name: 'adm-rs', path: '~/workspace/rusthing/adm-rs', branch: 'main', changes: 12, ahead: 0, behind: 3, state: 'dirty', paused: false,
        last: { hash: '9c2e1f4', msg: 'feat(org): 组织成员批量导入校验', author: '林伟', time: '8 分钟前' } },
      { id: 'dtw-rs', name: 'dtw-rs', path: '~/workspace/rusthing/dtw-rs', branch: 'dev/2.6', changes: 5, ahead: 2, behind: 0, state: 'dirty', paused: false,
        last: { hash: '7ab31d0', msg: 'fix(device): 定位卡绑定删除拦截', author: '王倩', time: '32 分钟前' } },
      { id: 'msg', name: 'msg', path: '~/workspace/rusthing/msg', branch: 'release/1.4', changes: 0, ahead: 1, behind: 1, state: 'clean', paused: false,
        last: { hash: '3f9c2aa', msg: 'chore: 模板变量缺失兜底', author: '陈默', time: '1 小时前' } },
      { id: 'syn', name: 'syn', path: '~/workspace/rusthing/syn', branch: 'main', changes: 0, ahead: 0, behind: 0, state: 'clean', paused: false,
        last: { hash: '5e0c19b', msg: 'feat: 投递明细合并列表', author: '周航', time: '2 小时前' } },
      { id: 'dbz', name: 'dbz', path: '~/workspace/rusthing/dbz', branch: 'feature/dlq', changes: 3, ahead: 0, behind: 0, state: 'conflict', paused: false,
        last: { hash: 'b2d84e1', msg: 'refactor: 死信表新增 connector_name', author: '李鸣', time: '3 小时前' } },
      { id: 'jobx', name: 'jobx', path: '~/workspace/rusthing/jobx', branch: 'main', changes: 0, ahead: 2, behind: 0, state: 'clean', paused: false,
        last: { hash: 'c41a7d9', msg: 'feat: overview summary 接口', author: '赵雪', time: '4 小时前' } },
      { id: 'alarm', name: 'alarm', path: '~/workspace/rusthing/alarm', branch: 'main', changes: 7, ahead: 0, behind: 5, state: 'dirty', paused: false,
        last: { hash: '1d0b833', msg: 'feat: 自动恢复终态通知', author: '孙哲', time: '昨天' } },
      { id: 'uiam', name: 'uiam', path: '~/workspace/rusthing/uiam', branch: 'main', changes: 0, ahead: 0, behind: 0, state: 'clean', paused: true,
        last: { hash: '8f2a10c', msg: 'chore: 依赖升级', author: '何以', time: '昨天' } }
    ],
    files: [
      { id: 'f1', status: 'M', path: 'src/domain/org/member.rs', dir: 'src/domain/org', diff: '@@ -42,7 +42,9 @@ impl MemberService {\n     pub async fn batch_import(&self, rows: Vec<MemberRow>) -> Result<ImportReport> {\n-        let mut ok = 0;\n+        let mut ok = 0;\n+        let mut skipped = Vec::new();\n         for row in rows {\n             validate(&row)?;' },
      { id: 'f2', status: 'M', path: 'src/application/org/import_worker.rs', dir: 'src/application/org', diff: '@@ -118,6 +118,7 @@ impl ImportWorker {\n         let report = service.batch_import(rows).await?;\n-        self.finish(task_id, report.ok).await?;\n+        self.finish(task_id, report.ok, report.skipped).await?;\n         Ok(())' },
      { id: 'f3', status: 'A', path: 'src/infra/pg/org_member_repo.rs', dir: 'src/infra/pg', diff: '@@ -0,0 +1,24 @@\n+pub struct OrgMemberRepo {\n+    pool: PgPool,\n+}\n+\n+impl OrgMemberRepo {\n+    pub async fn upsert_batch(&self, rows: &[MemberRow]) -> Result<u64> {' },
      { id: 'f4', status: 'D', path: 'src/legacy/org_import.rs', dir: 'src/legacy', diff: '@@ -1,18 +0,0 @@\n-pub fn legacy_import(rows: Vec<MemberRow>) {\n-    for row in rows {\n-        // 旧实现，已由 ImportWorker 替代\n-    }\n-}' },
      { id: 'f5', status: 'M', path: 'web/src/pages/org/member-table.tsx', dir: 'web/src/pages/org', diff: '@@ -88,7 +88,9 @@ export function MemberTable() {\n-  const { data } = useQuery(memberList);\n+  const { data, isFetching } = useQuery(memberList);\n+  const [importOpen, setImportOpen] = useState(false);\n   return (' },
      { id: 'f6', status: 'U', path: 'web/src/api/org.ts', dir: 'web/src/api', diff: '<<<<<<< HEAD\n-export const importMembers = (f: File) => post(\'/org/members/import\', f);\n=======\n+export const importMembers = (f: File) => post(\'/org/import\', f);\n>>>>>>> origin/main' },
      { id: 'f7', status: 'M', path: 'migrations/20261118_org_import.sql', dir: 'migrations', diff: '@@ -1,3 +1,5 @@\n CREATE TABLE org_import_task (\n     id          BIGSERIAL PRIMARY KEY,\n+    skipped_cnt INT NOT NULL DEFAULT 0,\n     created_ms  BIGINT NOT NULL' },
      { id: 'f8', status: 'M', path: 'Cargo.toml', dir: '.', diff: '@@ -18,6 +18,7 @@\n axum = "0.8"\n+pgx = "0.8"\n tokio = { version = "1", features = ["full"] }' }
    ],
    commits: [
      { hash: '9c2e1f4', author: '林伟', time: '8 分钟前', msg: 'feat(org): 组织成员批量导入校验', refs: ['HEAD -> main', 'origin/main'], lane: 0, merge: false, files: 8 },
      { hash: '7ab31d0', author: '林伟', time: '2 小时前', msg: 'fix(org): 导入任务取消后状态未回写', refs: [], lane: 0, merge: false, files: 2 },
      { hash: '3f9c2aa', author: '陈默', time: '5 小时前', msg: 'refactor: 抽离成员导入 worker', refs: [], lane: 1, merge: false, files: 6 },
      { hash: 'b2d84e1', author: '周航', time: '昨天 18:20', msg: 'chore: 升级 pgx 到 0.8.2', refs: ['origin/main~1'], lane: 0, merge: false, files: 3 },
      { hash: '5e0c19b', author: '王倩', time: '昨天 15:02', msg: 'feat: 新增成员导入模板下载', refs: [], lane: 1, merge: false, files: 4 },
      { hash: 'c41a7d9', author: '赵雪', time: '2 天前', msg: 'release: 2.5.0', refs: ['tag: v2.5.0'], lane: 0, merge: false, files: 1 },
      { hash: '1d0b833', author: '孙哲', time: '3 天前', msg: 'merge: release/2.5 -> main', refs: [], lane: 0, merge: true, files: 12 }
    ],
    console: [
      { t: '08:42:11', lvl: 'info', msg: '扫描工作区 ~/workspace/rusthing，发现 8 个 git 仓库' },
      { t: '08:42:12', lvl: 'ok', msg: 'adm-rs   fetch origin  +3 commits' },
      { t: '08:42:13', lvl: 'ok', msg: 'dtw-rs   fetch origin  up to date' },
      { t: '08:42:14', lvl: 'warn', msg: 'dbz      检测到未解决的合并冲突（web/src/api/org.ts）' },
      { t: '08:42:15', lvl: 'info', msg: '批量任务结束：成功 7，跳过 1，耗时 4.2s' }
    ]
  };

  window.MOCK = MOCK;
  window.repoById = function (id) {
    for (var i = 0; i < MOCK.repos.length; i++) if (MOCK.repos[i].id === id) return MOCK.repos[i];
    return MOCK.repos[0];
  };
  window.esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  window.toast = function (msg, kind) {
    var host = document.getElementById('toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'toast-host';
      document.body.appendChild(host);
    }
    var el = document.createElement('div');
    el.className = 'gb-toast ' + (kind || '');
    el.innerHTML = icon(kind === 'warn' ? 'alert-triangle' : kind === 'error' ? 'x-circle' : 'check-circle', 15) + '<span>' + msg + '</span>';
    host.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('in'); });
    setTimeout(function () {
      el.classList.remove('in');
      setTimeout(function () { el.remove(); }, 220);
    }, 2400);
  };

  var style = document.createElement('style');
  style.textContent =
    '#toast-host{position:fixed;right:16px;bottom:34px;z-index:999;display:flex;flex-direction:column;gap:8px;pointer-events:none}' +
    '.gb-toast{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:6px;background:#2b2d30;color:#dfe1e5;border:1px solid #43454a;font:12.5px/1.4 -apple-system,"SF Pro Text","PingFang SC",sans-serif;box-shadow:0 10px 28px rgba(0,0,0,.38);opacity:0;transform:translateY(6px);transition:opacity .18s ease,transform .18s ease}' +
    '.gb-toast.in{opacity:1;transform:none}' +
    '.gb-toast .ico{flex:none;color:#5bab63}' +
    '.gb-toast.warn .ico{color:#e0a03c}.gb-toast.error .ico{color:#db5c5c}';
  document.head.appendChild(style);
})();
