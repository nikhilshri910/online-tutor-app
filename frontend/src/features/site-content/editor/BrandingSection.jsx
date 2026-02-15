export default function BrandingSection({ value, onChange, onUploadLogo, uploadingLogo }) {
  return (
    <div className="content-console-section">
      <label className="field-label">
        App Title
        <input type="text" value={value.title || ""} onChange={(event) => onChange("title", event.target.value)} />
      </label>

      <label className="field-label">
        Logo URL
        <input
          type="text"
          value={value.logoUrl || ""}
          onChange={(event) => onChange("logoUrl", event.target.value)}
          placeholder="Auto-filled after upload"
        />
      </label>

      <label className="field-label">
        Upload Logo
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          disabled={uploadingLogo}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onUploadLogo(file);
            }
            event.target.value = "";
          }}
        />
      </label>
      {uploadingLogo ? <p className="muted">Uploading logo...</p> : null}
    </div>
  );
}

