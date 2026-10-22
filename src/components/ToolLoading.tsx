export function ToolLoading() {
  return (
    <div className="tool-loading glass-card" role="status" aria-busy="true">
      <div className="tool-loading-heading"><span className="loading-spinner" aria-hidden="true" /><span>正在加载工具…</span></div>
      <p>工具准备好后会自动显示。</p>
      <div className="tool-loading-skeleton" aria-hidden="true"><span /><span /><span /></div>
    </div>
  );
}
