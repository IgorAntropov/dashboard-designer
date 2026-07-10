const SHELL_CSS = `
:host { display: block; }
.pk-embed-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 20px;
  gap: 10px;
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
.pk-embed-attr {
  text-align: right;
  font-size: 0.72rem;
  color: var(--pk-muted, #6b7280);
  padding: 6px 12px;
}
`

export const WIDGET_CSS = `
.pk-kpi { display: flex; flex-direction: column; justify-content: center; gap: 0.25rem; height: 100%; padding: 0.35rem 0.6rem; }
.pk-kpi__head { display: flex; align-items: center; gap: 0.35rem; }
.pk-kpi__title { font-size: 0.85rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pk-kpi__info { flex: 0 0 auto; width: 15px; height: 15px; border: 1px solid; border-radius: 50%; font-size: 0.62rem; font-style: italic; font-weight: 700; line-height: 13px; text-align: center; cursor: help; }
.pk-kpi__valueRow { display: flex; align-items: baseline; gap: 0.3rem; }
.pk-kpi__value { font-size: 1.9rem; font-weight: 700; line-height: 1.05; font-variant-numeric: tabular-nums; }
.pk-kpi__unit { font-size: 0.8rem; }
.pk-kpi__meta { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.pk-kpi__delta { font-size: 0.8rem; font-weight: 600; }
.pk-kpi__period { font-size: 0.75rem; }
.pk-kpi__track { width: 100%; height: 6px; margin-top: 0.15rem; border-radius: 999px; background-color: rgba(128, 128, 128, 0.22); overflow: hidden; }
.pk-kpi__bar { height: 100%; border-radius: 999px; transition: width 0.4s ease; }
.pk-kpi__target { font-size: 0.72rem; }
.pk-text { height: 100%; display: flex; align-items: center; padding: 0.25rem 0.5rem; }
.pk-section { height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 0.15rem; padding: 0.25rem 0.1rem 0.35rem 0.6rem; border-left: 3px solid var(--pk-accent, #ffd400); }
.pk-section__title { font-size: 1.1rem; font-weight: 700; letter-spacing: -0.01em; line-height: 1.2; }
.pk-section__subtitle { font-size: 0.82rem; }
.pk-progress { display: flex; flex-direction: column; justify-content: center; gap: 0.35rem; height: 100%; padding: 0.25rem 0.6rem; }
.pk-progress__label { font-size: 0.85rem; }
.pk-progress__value { font-size: 1.5rem; font-weight: 700; line-height: 1.1; }
.pk-progress__track { width: 100%; height: 8px; border-radius: 999px; background-color: rgba(128, 128, 128, 0.22); overflow: hidden; }
.pk-progress__bar { height: 100%; border-radius: 999px; transition: width 0.4s ease; }
.pk-rank { display: flex; flex-direction: column; gap: 0.5rem; height: 100%; padding: 0.35rem 0.5rem; overflow-y: auto; }
.pk-rank__title { font-size: 0.8rem; font-weight: 600; }
.pk-rank__row { display: flex; align-items: center; gap: 0.5rem; }
.pk-rank__num { flex: 0 0 auto; width: 1.25rem; text-align: right; font-size: 0.8rem; font-weight: 700; font-variant-numeric: tabular-nums; }
.pk-rank__body { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 0.2rem; }
.pk-rank__top { display: flex; align-items: baseline; justify-content: space-between; gap: 0.5rem; }
.pk-rank__name { font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pk-rank__value { flex: 0 0 auto; font-size: 0.85rem; font-weight: 600; font-variant-numeric: tabular-nums; }
.pk-rank__track { width: 100%; height: 5px; border-radius: 999px; background-color: rgba(128, 128, 128, 0.18); overflow: hidden; }
.pk-rank__bar { height: 100%; border-radius: 999px; transition: width 0.4s ease; }
.pk-rank__delta { flex: 0 0 auto; font-size: 0.75rem; font-weight: 600; font-variant-numeric: tabular-nums; }
.pk-table { height: 100%; overflow: auto; }
.pk-table__el { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.pk-table__th { position: sticky; top: 0; z-index: 1; padding: 0.35rem 0.5rem; text-align: left; font-weight: 600; white-space: nowrap; cursor: pointer; user-select: none; background-color: var(--pk-surface, #f6f6f7); border-bottom: 1px solid var(--pk-border, rgba(128, 128, 128, 0.3)); }
.pk-table__td { padding: 0.3rem 0.5rem; border-bottom: 1px solid var(--pk-border, rgba(128, 128, 128, 0.18)); white-space: nowrap; }
.pk-table__num { text-align: right; font-variant-numeric: tabular-nums; }
`

export const ENGINE_CSS = SHELL_CSS + WIDGET_CSS
