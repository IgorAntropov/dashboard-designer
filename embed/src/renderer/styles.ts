export const ENGINE_CSS = `
:host { display: block; }
.pk-embed-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 80px;
  gap: 8px;
  padding: 12px;
  background-color: var(--pk-bg, #ffffff);
  color: var(--pk-text, #1a1a1a);
  font-family: Inter, system-ui, sans-serif;
}
.pk-embed-cell { min-width: 0; }
.pk-embed-body {
  width: 100%;
  height: 100%;
  background-color: var(--pk-surface, #f6f6f7);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 6px;
  overflow: hidden;
  box-sizing: border-box;
}
.pk-stat { display: flex; flex-direction: column; justify-content: center; height: 100%; padding: 4px 8px; }
.pk-stat__value { font-size: 1.8rem; font-weight: 700; line-height: 1.1; }
.pk-stat__label { color: var(--pk-muted, #6b7280); font-size: 0.85rem; }
.pk-text { height: 100%; display: flex; align-items: center; padding: 4px 8px; }
.pk-progress { display: flex; flex-direction: column; justify-content: center; gap: 6px; height: 100%; padding: 4px 8px; }
.pk-progress__label { font-size: 0.85rem; }
.pk-progress__value { font-size: 1.4rem; font-weight: 700; line-height: 1.1; }
.pk-progress__track { width: 100%; height: 8px; border-radius: 999px; background-color: rgba(128, 128, 128, 0.22); overflow: hidden; }
.pk-progress__bar { height: 100%; border-radius: 999px; }
.pk-embed-attr {
  text-align: right;
  font-size: 0.72rem;
  color: var(--pk-muted, #6b7280);
  padding: 6px 12px;
}
`
