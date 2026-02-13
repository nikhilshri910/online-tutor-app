import { ClipLoader } from "react-spinners";

export default function LoadingState({ label = "Loading...", fullPage = false }) {
  return (
    <div className={fullPage ? "loading-wrap loading-wrap-full" : "loading-wrap"} role="status" aria-live="polite">
      <ClipLoader size={24} color="var(--primary)" speedMultiplier={0.9} />
      <span className="loading-label">{label}</span>
    </div>
  );
}
