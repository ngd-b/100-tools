export function NavigationProgress() {
  return (
    <div className="navigation-progress" aria-hidden="true">
      <div className="navigation-progress-track"><span /></div>
      <div className="navigation-progress-label"><span className="loading-spinner" />正在打开页面…</div>
    </div>
  );
}
