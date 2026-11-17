// navigate(-1) leaves the site when a screen was opened from a shared link.
// React Router numbers history entries in history.state.idx; 0 means nothing to go back to.
export function goBack(navigate, fallback) {
  if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
  else navigate(fallback, { replace: true });
}
