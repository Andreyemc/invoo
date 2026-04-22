import { useState, useEffect, useMemo, useRef } from 'react';

/* ============================================================
   STORAGE ADAPTER (localStorage-backed)
   ============================================================ */
const storage = {
  async get(key) {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? { key, value: v } : null;
    } catch { return null; }
  },
  async set(key, value) {
    try { localStorage.setItem(key, value); } catch {}
    return { key, value };
  },
};

/* ============================================================
   CSS — base chrome + four themes + print
   ============================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Mono:wght@400;500;600&display=swap');

:root {
  --ink: #111111;
  --ink-70: #3a3a3a;
  --ink-50: #6b6b6b;
  --ink-30: #a8a8a8;
  --ink-10: #f0f0f0;
  --hair: #e4e4e4;
  --surface: #f6f6f6;
  --bg: #eeeef0;
  --brand: #111111;
  --danger: #b91c1c;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #root {
  height: 100%;
  font-family: 'Noto Sans', system-ui, sans-serif;
  color: var(--ink);
  background: #fff;
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button { font-family: inherit; }
input, textarea, select { font-family: inherit; font-size: inherit; color: inherit; }

/* ============ APP SHELL ============ */
.app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

.topbar {
  height: 56px; border-bottom: 1px solid var(--hair);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; flex-shrink: 0; background: #fff; gap: 16px;
}
.topbar-title {
  font-size: 13px; font-weight: 500; color: var(--ink-70);
  display: flex; align-items: center; gap: 10px;
  min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.topbar-title .brand { color: var(--ink); font-weight: 700; font-size: 14px; }
.topbar-title .sep { width: 1px; height: 16px; background: var(--hair); flex-shrink: 0; }
.topbar-actions { display: flex; gap: 8px; flex-shrink: 0; align-items: center; }

.theme-switch {
  display: inline-flex; border: 1px solid var(--hair); border-radius: 6px;
  overflow: hidden; height: 32px;
}
.theme-switch button {
  background: #fff; border: none; padding: 0 12px; font-size: 12px; font-weight: 500;
  color: var(--ink-50); cursor: pointer; border-right: 1px solid var(--hair);
  transition: all 0.12s ease; line-height: 1;
  font-family: 'Noto Sans', sans-serif;
}
.theme-switch button:last-child { border-right: none; }
.theme-switch button:hover { background: var(--ink-10); color: var(--ink); }
.theme-switch button.active { background: var(--ink); color: #fff; }

.btn {
  font-size: 13px; font-weight: 500; padding: 8px 14px;
  border-radius: 6px; border: 1px solid transparent;
  cursor: pointer; transition: all 0.15s ease; line-height: 1;
  display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
}
.btn:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.btn-primary { background: var(--ink); color: #fff; border-color: var(--ink); }
.btn-primary:hover { background: #000; }
.btn-ghost { background: #fff; color: var(--ink); border-color: var(--hair); }
.btn-ghost:hover { border-color: var(--ink-30); background: var(--ink-10); }

.icon-btn {
  background: transparent; color: var(--ink-50); border: none;
  padding: 0; cursor: pointer; display: inline-flex; align-items: center;
  justify-content: center; border-radius: 4px; width: 26px; height: 26px;
  transition: all 0.15s ease; flex-shrink: 0;
}
.icon-btn:hover { background: #fef2f2; color: var(--danger); }
.icon-btn:focus-visible { outline: 2px solid var(--ink); outline-offset: 1px; }

/* ============ MAIN LAYOUT ============ */
.main {
  flex: 1; display: grid; grid-template-columns: 460px 1fr;
  min-height: 0; overflow: hidden;
}
@media (max-width: 1023px) {
  .main { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
}

.editor { overflow-y: auto; border-right: 1px solid var(--hair); background: #fff; }
@media (max-width: 1023px) {
  .editor { border-right: none; border-bottom: 1px solid var(--hair); max-height: 55vh; }
}

.section { padding: 22px 24px; border-bottom: 1px solid var(--hair); }
.section:last-child { border-bottom: none; }

.section-label {
  font-family: 'Noto Sans Mono', monospace;
  font-size: 10px; letter-spacing: 0.4px; text-transform: uppercase;
  color: var(--ink-50); font-weight: 500; margin-bottom: 16px;
}

.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.field:last-child { margin-bottom: 0; }
.field-label { font-size: 12px; color: var(--ink-50); font-weight: 500; }

.field-row { display: grid; gap: 10px; }
.field-row-2 { grid-template-columns: 1fr 1fr; }

.input, .textarea, .select {
  font-size: 13.5px; color: var(--ink);
  padding: 9px 12px; border: 1px solid var(--hair); border-radius: 6px;
  background: #fff; width: 100%;
  transition: border-color 0.15s ease;
  outline: none; line-height: 1.4;
  font-family: 'Noto Sans', sans-serif;
}
.input.is-mono { font-family: 'Noto Sans Mono', monospace; font-size: 12.5px; }
.input:hover:not(:focus), .textarea:hover:not(:focus), .select:hover:not(:focus) { border-color: var(--ink-30); }
.input:focus, .textarea:focus, .select:focus { border-color: var(--ink); }
.textarea { resize: vertical; min-height: 64px; line-height: 1.55; }
.input-num, .input-money { font-variant-numeric: tabular-nums; text-align: right; }
.input[type=number]::-webkit-outer-spin-button,
.input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.input[type=number] { -moz-appearance: textfield; }
.select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b6b6b' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px;
}

.picker {
  display: grid; grid-template-columns: 1fr auto; gap: 8px;
  margin-bottom: 16px; padding: 12px; background: #fafafa;
  border: 1px solid var(--hair); border-radius: 8px;
}
.picker-label {
  grid-column: 1 / -1;
  font-family: 'Noto Sans Mono', monospace;
  font-size: 9.5px; letter-spacing: 0.3px;
  text-transform: uppercase; color: var(--ink-50); font-weight: 500;
  margin-bottom: 4px;
}
.picker .select { height: 34px; padding-top: 6px; padding-bottom: 6px; font-size: 13px; }
.picker .btn { height: 34px; padding: 0 12px; font-size: 12.5px; }

.profile-list {
  margin-top: 10px; border: 1px solid var(--hair); border-radius: 8px;
  background: #fff; overflow: hidden;
}
.profile-list-head {
  padding: 10px 12px; font-size: 11.5px; font-weight: 500; color: var(--ink-50);
  display: flex; justify-content: space-between; align-items: center;
  cursor: pointer; background: #fafafa;
}
.profile-list-head:hover { background: var(--ink-10); }
.profile-list-row {
  padding: 10px 12px; border-top: 1px solid var(--hair);
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
  font-size: 12.5px;
}
.profile-list-row .ln { color: var(--ink); font-weight: 500; }
.profile-list-row .sub { color: var(--ink-50); font-size: 11px; margin-top: 2px; }
.profile-list-row .meta { flex: 1; min-width: 0; }
.profile-list-empty { padding: 14px 12px; font-size: 12px; color: var(--ink-50); border-top: 1px solid var(--hair); text-align: center; }

.item-card {
  border: 1px solid var(--hair); border-radius: 8px;
  padding: 14px; margin-bottom: 10px; background: #fff;
  transition: border-color 0.15s ease;
}
.item-card:hover { border-color: var(--ink-30); }
.item-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 8px; }
.item-index {
  font-family: 'Noto Sans Mono', monospace;
  font-size: 10px; letter-spacing: 0.4px; color: var(--ink-30); font-weight: 500;
}
.item-amount {
  font-variant-numeric: tabular-nums; font-size: 13px;
  color: var(--ink); font-weight: 600; margin-left: auto; margin-right: 4px;
}
.add-item-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 10px; background: transparent;
  border: 1px dashed var(--hair); border-radius: 8px;
  color: var(--ink-50); font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.15s ease;
}
.add-item-btn:hover { border-color: var(--ink); color: var(--ink); background: var(--ink-10); }

/* ============ PREVIEW CONTAINER ============ */
.preview-bg { background: var(--bg); overflow-y: auto; padding: 32px 16px 80px; }
.paper {
  width: 100%; max-width: 800px; margin: 0 auto; background: #fff;
  box-shadow: 0 2px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
  font-size: 10pt; line-height: 1.5; color: var(--ink);
}
@media (max-width: 640px) { .preview-bg { padding: 16px 10px 60px; } }

/* ============================================================
   THEME 1 — STATEMENT
   Red accent · key-value rows with thin underlines · classic statement layout
   ============================================================ */
.paper.t-statement {
  padding: 44px 48px 36px;
  font-family: 'Noto Sans', system-ui, sans-serif;
  color: #111;
}
@media (max-width: 640px) { .paper.t-statement { padding: 28px 24px 24px; } }

.t-statement .st-head {
  display: grid; grid-template-columns: 1fr auto;
  gap: 20px; align-items: flex-start;
  margin-bottom: 20px;
}
.t-statement .st-brand-name {
  font-size: 13pt; font-weight: 600;
  letter-spacing: -0.2px; color: #111;
  line-height: 1.2; overflow-wrap: anywhere;
}
.t-statement .st-brand-sub {
  margin-top: 3px; font-size: 9pt; color: #555;
}
.t-statement .st-title-col { text-align: right; }
.t-statement .st-title {
  font-size: 13pt; font-weight: 600; color: #b91e2c;
  line-height: 1; letter-spacing: 0.1px;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.t-statement .st-contact {
  margin-top: 8px; font-size: 8.5pt; color: #555;
  line-height: 1.55; overflow-wrap: anywhere;
}
.t-statement .st-contact .strong { color: #111; font-weight: 500; }

.t-statement .st-intro-title {
  font-size: 9pt; font-weight: 600; color: #111;
  margin-bottom: 6px;
}
.t-statement .st-intro {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 2px 40px; margin-bottom: 20px;
}
@media (max-width: 520px) { .t-statement .st-intro { grid-template-columns: 1fr; } }
.t-statement .st-kv {
  display: grid; grid-template-columns: max-content 1fr;
  align-items: baseline; gap: 10px;
  border-bottom: 0.5px solid #c8c8c8;
  padding: 4px 0;
}
.t-statement .st-kv .k { font-size: 9pt; color: #666; }
.t-statement .st-kv .v {
  font-size: 9pt; color: #111; font-weight: 500;
  text-align: right; overflow-wrap: anywhere;
}
.t-statement .st-kv .v.mono { font-family: 'Noto Sans Mono', monospace; font-size: 8.5pt; }

.t-statement .st-parties {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 28px 40px; margin-bottom: 6px;
}
@media (max-width: 520px) { .t-statement .st-parties { grid-template-columns: 1fr; } }
.t-statement .st-party-label {
  font-size: 8pt; font-weight: 600; color: #b91e2c;
  text-transform: uppercase; letter-spacing: 0.4px;
  margin-bottom: 6px;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.t-statement .st-party-name {
  font-size: 10.5pt; font-weight: 600; color: #111;
  margin-bottom: 4px; overflow-wrap: anywhere;
}
.t-statement .st-party-addr {
  font-size: 9.5pt; color: #333; line-height: 1.55;
  white-space: pre-line; overflow-wrap: anywhere;
}
.t-statement .st-party-tax {
  margin-top: 5px; font-family: 'Noto Sans Mono', monospace;
  font-size: 8.5pt; color: #555;
}
.t-statement .st-iban-head { font-size: 9pt; font-weight: 600; color: #111; margin-bottom: 4px; }
.t-statement .st-iban-val {
  font-family: 'Noto Sans Mono', monospace;
  font-size: 9pt; color: #111; font-weight: 500; margin-bottom: 10px;
  overflow-wrap: anywhere;
}

.t-statement .st-tx-head {
  display: flex; align-items: baseline; gap: 12px;
  border-top: 1px solid #111; padding: 10px 0 8px;
  margin-top: 20px;
  flex-wrap: wrap;
}
.t-statement .st-tx-title { font-size: 10.5pt; font-weight: 600; color: #111; }
.t-statement .st-tx-sub { font-size: 8.5pt; color: #666; }

.t-statement .st-items-head {
  display: grid; grid-template-columns: 70px 1fr 50px 80px 90px;
  gap: 8px; padding: 6px 0;
  border-bottom: 0.5px solid #c8c8c8;
  font-size: 8pt; font-weight: 600; color: #555;
  text-transform: uppercase; letter-spacing: 0.3px;
}
.t-statement .st-items-head div:nth-child(3),
.t-statement .st-items-head div:nth-child(4),
.t-statement .st-items-head div:nth-child(5) { text-align: right; }
.t-statement .st-item {
  display: grid; grid-template-columns: 70px 1fr 50px 80px 90px;
  gap: 8px; padding: 10px 0;
  border-bottom: 0.5px dotted #a0a0a0;
  align-items: flex-start;
}
@media (max-width: 640px) {
  .t-statement .st-items-head, .t-statement .st-item {
    grid-template-columns: 54px 1fr 36px 64px 72px; gap: 5px;
  }
}
.t-statement .st-item-date { font-size: 9pt; color: #111; padding-top: 1px; }
.t-statement .st-item-title {
  font-size: 9.5pt; font-weight: 500; color: #111;
  margin-bottom: 2px; overflow-wrap: anywhere;
}
.t-statement .st-item-body {
  font-size: 8.5pt; color: #666; line-height: 1.5;
  overflow-wrap: anywhere; white-space: pre-line;
}
.t-statement .st-item-qty, .t-statement .st-item-rate, .t-statement .st-item-amount {
  font-size: 9pt; color: #111; padding-top: 1px;
  text-align: right; font-variant-numeric: tabular-nums; overflow-wrap: anywhere;
}
.t-statement .st-item-amount { font-weight: 600; }

.t-statement .st-totals { display: flex; justify-content: flex-end; margin-top: 12px; }
.t-statement .st-totals-inner { width: 55%; min-width: 260px; }
@media (max-width: 520px) { .t-statement .st-totals-inner { width: 100%; } }
.t-statement .st-totals-row {
  display: grid; grid-template-columns: 1fr auto;
  align-items: baseline; gap: 10px;
  padding: 5px 0; font-size: 9pt;
}
.t-statement .st-totals-row .label { color: #666; }
.t-statement .st-totals-row .val {
  font-variant-numeric: tabular-nums; color: #111;
  text-align: right; font-weight: 500; overflow-wrap: anywhere;
}
.t-statement .st-totals-row.grand {
  margin-top: 4px; padding: 8px 0;
  border-top: 1px solid #111; border-bottom: 1.2px solid #b91e2c;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.t-statement .st-totals-row.grand .label {
  font-size: 9pt; font-weight: 600; color: #111;
  text-transform: uppercase; letter-spacing: 0.3px;
}
.t-statement .st-totals-row.grand .val {
  font-size: 12pt; font-weight: 700; color: #b91e2c; letter-spacing: -0.1px;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}

.t-statement .st-payment {
  margin-top: 24px; padding-top: 12px;
  border-top: 0.5px solid #111;
}
.t-statement .st-payment-label {
  font-size: 8.5pt; font-weight: 600; color: #111;
  text-transform: uppercase; letter-spacing: 0.4px;
  margin-bottom: 10px;
}
.t-statement .st-pay-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 2px 36px;
}
@media (max-width: 520px) { .t-statement .st-pay-grid { grid-template-columns: 1fr; } }
.t-statement .pay-row {
  display: grid; grid-template-columns: 110px 1fr;
  align-items: baseline; gap: 10px;
  padding: 5px 0;
}
.t-statement .pay-row.full { grid-column: 1 / -1; }
.t-statement .pay-row .k { font-size: 8.5pt; color: #666; }
.t-statement .pay-row .v {
  font-size: 9pt; color: #111; font-weight: 500;
  text-align: right; overflow-wrap: anywhere;
}
.t-statement .pay-row .v.mono { font-family: 'Noto Sans Mono', monospace; font-size: 8.5pt; }

.t-statement .st-footer {
  margin-top: 18px; padding-top: 10px;
  border-top: 0.5px solid #c8c8c8;
  font-size: 8pt; color: #666;
  display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
}

/* ============================================================
   THEME 2 — FORMAL
   Blue accent · all-caps labels with tight letter-spacing · signature blocks
   ============================================================ */
.paper.t-formal {
  padding: 44px 48px 36px;
  font-family: 'Noto Sans', system-ui, sans-serif;
  color: #000;
}
@media (max-width: 640px) { .paper.t-formal { padding: 28px 24px 24px; } }

.t-formal .fm-head {
  display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
  margin-bottom: 4px;
}
.t-formal .fm-brand-name {
  font-size: 13pt; font-weight: 600; color: #0a3a7e;
  letter-spacing: -0.2px; line-height: 1; overflow-wrap: anywhere;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.t-formal .fm-brand-sub { font-size: 9pt; color: #555; }

.t-formal .fm-rule-top {
  border-top: 2px solid #0a3a7e; margin: 4px 0 22px;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}

.t-formal .fm-top-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 36px; margin-bottom: 22px;
}
@media (max-width: 520px) { .t-formal .fm-top-grid { grid-template-columns: 1fr; gap: 18px; } }
.t-formal .fm-addr {
  font-size: 9.5pt; color: #000; line-height: 1.55;
}
.t-formal .fm-addr-name {
  font-size: 10pt; font-weight: 600; color: #000;
  margin-bottom: 4px; overflow-wrap: anywhere;
}
.t-formal .fm-addr-line { white-space: pre-line; overflow-wrap: anywhere; color: #333; }
.t-formal .fm-addr-tax {
  margin-top: 4px; font-size: 9pt; color: #555;
  font-family: 'Noto Sans Mono', monospace;
}

.t-formal .fm-meta-grid {
  display: grid; grid-template-columns: max-content 1fr;
  gap: 4px 16px; align-content: start;
}
.t-formal .fm-meta-k {
  text-transform: uppercase; letter-spacing: 0.3px; font-weight: 500;
  color: #555; white-space: nowrap; font-size: 8.5pt;
}
.t-formal .fm-meta-k::after { content: ':'; }
.t-formal .fm-meta-v {
  color: #000; font-weight: 400; overflow-wrap: anywhere;
  font-size: 9.5pt;
}
.t-formal .fm-meta-v.mono { font-family: 'Noto Sans Mono', monospace; font-size: 9pt; }

.t-formal .fm-title-block { margin: 6px 0 14px; }
.t-formal .fm-title {
  font-size: 12pt; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px;
  color: #000; line-height: 1;
}
.t-formal .fm-title-sub { margin-top: 4px; font-size: 9pt; color: #555; }

.t-formal .fm-items-head {
  display: grid; grid-template-columns: 80px 1fr 50px 80px 90px;
  gap: 10px; padding: 7px 0;
  border-top: 0.5px solid #000; border-bottom: 0.5px solid #000;
  font-size: 8pt; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.3px; color: #000;
}
.t-formal .fm-items-head div:nth-child(3),
.t-formal .fm-items-head div:nth-child(4),
.t-formal .fm-items-head div:nth-child(5) { text-align: right; }
.t-formal .fm-items-head div::after { content: ':'; }

.t-formal .fm-item {
  display: grid; grid-template-columns: 80px 1fr 50px 80px 90px;
  gap: 10px; padding: 10px 0;
  border-bottom: 0.5px solid #d0d0d0; align-items: flex-start;
}
@media (max-width: 640px) {
  .t-formal .fm-items-head, .t-formal .fm-item {
    grid-template-columns: 62px 1fr 36px 60px 72px; gap: 6px;
  }
}
.t-formal .fm-item-date { font-size: 9pt; color: #111; padding-top: 1px; }
.t-formal .fm-item-title {
  font-size: 9.5pt; font-weight: 500; color: #000;
  margin-bottom: 2px; overflow-wrap: anywhere;
}
.t-formal .fm-item-body {
  font-size: 8.5pt; color: #555; line-height: 1.55;
  overflow-wrap: anywhere; white-space: pre-line;
}
.t-formal .fm-item-qty, .t-formal .fm-item-rate, .t-formal .fm-item-amount {
  font-size: 9pt; color: #000; padding-top: 1px;
  text-align: right; font-variant-numeric: tabular-nums; overflow-wrap: anywhere;
}
.t-formal .fm-item-amount { font-weight: 600; }

.t-formal .fm-totals {
  margin-top: 10px; padding: 10px 0 4px;
  border-top: 1px solid #000;
  display: flex; justify-content: flex-end;
}
.t-formal .fm-totals-inner { width: 55%; min-width: 260px; }
@media (max-width: 520px) { .t-formal .fm-totals-inner { width: 100%; } }
.t-formal .fm-totals-row {
  display: grid; grid-template-columns: 1fr auto;
  padding: 3px 0; font-size: 9pt; gap: 10px;
}
.t-formal .fm-totals-row .label {
  text-transform: uppercase; letter-spacing: 0.3px;
  color: #555; font-size: 8.5pt; font-weight: 500;
}
.t-formal .fm-totals-row .val {
  font-variant-numeric: tabular-nums; color: #000;
  text-align: right; font-weight: 500; overflow-wrap: anywhere;
}
.t-formal .fm-totals-row.grand {
  margin-top: 6px; padding: 8px 0 6px;
  border-top: 2px solid #0a3a7e; border-bottom: 2px solid #0a3a7e;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.t-formal .fm-totals-row.grand .label {
  font-size: 9pt; font-weight: 700; letter-spacing: 0.4px; color: #000;
}
.t-formal .fm-totals-row.grand .val {
  font-size: 12pt; font-weight: 700; color: #0a3a7e; letter-spacing: -0.1px;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}

.t-formal .fm-attest {
  margin-top: 22px; font-size: 9pt; color: #000; line-height: 1.55;
}
.t-formal .fm-attest-addr { margin-top: 2px; color: #555; font-size: 8.5pt; }

.t-formal .fm-signatures {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 36px; margin-top: 36px;
}
@media (max-width: 520px) { .t-formal .fm-signatures { grid-template-columns: 1fr; gap: 24px; } }
.t-formal .fm-sig { border-top: 0.5px solid #000; padding-top: 8px; }
.t-formal .fm-sig-name {
  font-size: 9.5pt; font-weight: 600; color: #000; overflow-wrap: anywhere;
}
.t-formal .fm-sig-id {
  margin-top: 2px; font-family: 'Noto Sans Mono', monospace;
  font-size: 8.5pt; color: #555;
}
.t-formal .fm-sig-role { margin-top: 2px; font-size: 8.5pt; color: #555; }

.t-formal .fm-footer {
  margin-top: 28px; font-size: 8pt; color: #555;
  display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
}

/* ============================================================
   THEME 3 — LEDGER
   Red accent · three-column gray-header summary · » arrows
   ============================================================ */
.paper.t-ledger {
  padding: 40px 44px 32px;
  font-family: 'Noto Sans', system-ui, sans-serif;
  color: #1a1a1a;
}
@media (max-width: 640px) { .paper.t-ledger { padding: 24px 20px 22px; } }

.t-ledger .ld-head {
  display: grid; grid-template-columns: 1fr auto;
  gap: 16px; align-items: baseline; margin-bottom: 14px;
}
.t-ledger .ld-brand-name {
  font-size: 13pt; font-weight: 600; color: #1a1a1a;
  letter-spacing: -0.2px; line-height: 1; overflow-wrap: anywhere;
}
.t-ledger .ld-office {
  text-align: right; font-size: 8.5pt; color: #555; line-height: 1.55;
}
.t-ledger .ld-office .lbl { font-weight: 500; color: #1a1a1a; }

.t-ledger .ld-title {
  font-size: 12pt; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.3px;
  color: #ec0000; margin-bottom: 14px; line-height: 1.15;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}

.t-ledger .ld-three { border: 1px solid #d8d8d8; margin-bottom: 20px; }
.t-ledger .ld-three-head {
  display: grid; grid-template-columns: 1.2fr 1fr 1.2fr;
  background: #eaeaea;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
@media (max-width: 520px) { .t-ledger .ld-three-head { grid-template-columns: 1fr; } }
.t-ledger .ld-three-head > div {
  padding: 7px 14px;
  font-size: 8.5pt; font-weight: 600; color: #1a1a1a;
  text-transform: uppercase; letter-spacing: 0.3px;
  border-right: 1px solid #d8d8d8;
}
.t-ledger .ld-three-head > div:last-child { border-right: none; }
@media (max-width: 520px) {
  .t-ledger .ld-three-head > div { border-right: none; border-bottom: 1px solid #d8d8d8; }
  .t-ledger .ld-three-head > div:last-child { border-bottom: none; }
}

.t-ledger .ld-three-body { display: grid; grid-template-columns: 1.2fr 1fr 1.2fr; }
@media (max-width: 520px) { .t-ledger .ld-three-body { grid-template-columns: 1fr; } }
.t-ledger .ld-three-col {
  padding: 12px 14px; border-right: 1px solid #d8d8d8;
  display: flex; flex-direction: column; gap: 4px; min-width: 0;
}
.t-ledger .ld-three-col:last-child { border-right: none; }
@media (max-width: 520px) {
  .t-ledger .ld-three-col { border-right: none; border-bottom: 1px solid #d8d8d8; }
  .t-ledger .ld-three-col:last-child { border-bottom: none; }
}

.t-ledger .ld-primary {
  display: flex; align-items: baseline; gap: 6px; font-weight: 600;
}
.t-ledger .ld-arrow {
  color: #ec0000; font-weight: 700;
  font-size: 10pt; line-height: 1;
  letter-spacing: -1px; flex-shrink: 0;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.t-ledger .ld-primary-text {
  font-size: 10.5pt; font-weight: 600; color: #1a1a1a;
  letter-spacing: -0.1px; overflow-wrap: anywhere; line-height: 1.25;
}
.t-ledger .ld-primary-text.amount {
  font-size: 12pt; font-weight: 700;
  letter-spacing: -0.2px; font-variant-numeric: tabular-nums;
}
.t-ledger .ld-sub-role { font-size: 8.5pt; color: #666; }
.t-ledger .ld-kv {
  display: grid; grid-template-columns: max-content 1fr;
  gap: 2px 8px; font-size: 8.5pt; line-height: 1.5; margin-top: 4px;
}
.t-ledger .ld-kv .k { color: #666; }
.t-ledger .ld-kv .v { color: #1a1a1a; overflow-wrap: anywhere; min-width: 0; }
.t-ledger .ld-kv .v.mono { font-family: 'Noto Sans Mono', monospace; font-size: 8pt; }
.t-ledger .ld-kv .v.addr { white-space: pre-line; }

.t-ledger .ld-concept {
  padding: 10px 0 14px; border-bottom: 1px solid #d8d8d8; margin-bottom: 12px;
}
.t-ledger .ld-concept-label {
  font-size: 8.5pt; font-weight: 600; color: #1a1a1a;
  text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 3px;
}
.t-ledger .ld-concept-text {
  font-family: 'Noto Sans Mono', monospace;
  font-size: 9pt; color: #1a1a1a; overflow-wrap: anywhere;
}

.t-ledger .ld-items-head {
  display: grid; grid-template-columns: 30px 1fr 50px 80px 90px;
  gap: 8px; padding: 6px 0;
  border-top: 0.5px solid #1a1a1a; border-bottom: 0.5px solid #1a1a1a;
  font-size: 8pt; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.3px; color: #1a1a1a;
}
.t-ledger .ld-items-head div:nth-child(3),
.t-ledger .ld-items-head div:nth-child(4),
.t-ledger .ld-items-head div:nth-child(5) { text-align: right; }
.t-ledger .ld-item {
  display: grid; grid-template-columns: 30px 1fr 50px 80px 90px;
  gap: 8px; padding: 10px 0;
  border-bottom: 0.5px solid #e0e0e0; align-items: flex-start;
}
@media (max-width: 640px) {
  .t-ledger .ld-items-head, .t-ledger .ld-item {
    grid-template-columns: 24px 1fr 36px 60px 72px; gap: 5px;
  }
}
.t-ledger .ld-item-num { font-size: 9pt; color: #888; padding-top: 1px; }
.t-ledger .ld-item-title {
  font-size: 9.5pt; font-weight: 500; color: #1a1a1a;
  margin-bottom: 2px; overflow-wrap: anywhere;
}
.t-ledger .ld-item-body {
  font-size: 8.5pt; color: #555; line-height: 1.5;
  overflow-wrap: anywhere; white-space: pre-line;
}
.t-ledger .ld-item-qty, .t-ledger .ld-item-rate, .t-ledger .ld-item-amount {
  font-size: 9pt; color: #1a1a1a; padding-top: 1px;
  text-align: right; font-variant-numeric: tabular-nums; overflow-wrap: anywhere;
}
.t-ledger .ld-item-amount { font-weight: 600; }

.t-ledger .ld-totals {
  display: grid; grid-template-columns: 1fr 300px;
  margin-top: 12px; gap: 0;
}
@media (max-width: 520px) { .t-ledger .ld-totals { grid-template-columns: 1fr; } }
.t-ledger .ld-totals-note {
  padding-top: 8px; padding-right: 14px;
  font-size: 8.5pt; color: #666;
}
.t-ledger .ld-totals-box { border: 1px solid #d8d8d8; }
.t-ledger .ld-totals-box-head {
  background: #eaeaea; padding: 6px 14px;
  font-size: 8.5pt; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.3px; color: #1a1a1a;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.t-ledger .ld-totals-row {
  display: grid; grid-template-columns: 1fr auto;
  padding: 5px 14px; gap: 10px;
  font-size: 9pt; border-top: 0.5px solid #e0e0e0;
  align-items: baseline;
}
.t-ledger .ld-totals-row .label { color: #666; }
.t-ledger .ld-totals-row .val {
  font-variant-numeric: tabular-nums; color: #1a1a1a;
  text-align: right; font-weight: 500;
}
.t-ledger .ld-totals-row.grand {
  background: #fafafa; border-top: 1px solid #1a1a1a; padding: 9px 14px;
}
.t-ledger .ld-totals-row.grand .label {
  color: #1a1a1a; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.3px; font-size: 9pt;
}
.t-ledger .ld-totals-row.grand .val {
  font-size: 12pt; font-weight: 700; color: #ec0000; letter-spacing: -0.2px;
  display: flex; align-items: baseline; gap: 6px; justify-content: flex-end;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}

.t-ledger .ld-payment { margin-top: 22px; border: 1px solid #d8d8d8; }
.t-ledger .ld-payment-head {
  background: #eaeaea; padding: 7px 14px;
  font-size: 8.5pt; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.3px; color: #1a1a1a;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.t-ledger .ld-pay-grid { display: grid; grid-template-columns: 1fr 1fr; padding: 12px 14px; gap: 8px 28px; }
@media (max-width: 520px) { .t-ledger .ld-pay-grid { grid-template-columns: 1fr; gap: 6px; } }
.t-ledger .pay-row { display: flex; flex-direction: column; min-width: 0; }
.t-ledger .pay-row.full { grid-column: 1 / -1; }
.t-ledger .pay-row .k {
  font-size: 8.5pt; color: #666; margin-bottom: 2px;
}
.t-ledger .pay-row .v {
  font-size: 9pt; color: #1a1a1a; font-weight: 500; overflow-wrap: anywhere;
}
.t-ledger .pay-row .v.mono { font-family: 'Noto Sans Mono', monospace; font-size: 8.5pt; }

.t-ledger .ld-footer {
  margin-top: 16px;
  display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  font-size: 8pt; color: #555;
  border-top: 0.5px solid #d8d8d8; padding-top: 10px;
}
.t-ledger .ld-footer .ref { font-family: 'Noto Sans Mono', monospace; }

/* ============================================================
   THEME 4 — MODERN
   Grayscale · rounded soft panels · calm info area (no black panel)
   ============================================================ */
.paper.t-modern {
  padding: 40px 44px 36px;
  font-family: 'Noto Sans', system-ui, sans-serif;
  color: #0a0a0a; background: #fff;
  border-radius: 6px;
}
@media (max-width: 640px) { .paper.t-modern { padding: 24px 20px 22px; } }

.t-modern .mo-head {
  display: grid; grid-template-columns: 1fr auto;
  align-items: flex-start; gap: 16px; margin-bottom: 22px;
}
.t-modern .mo-brand-name {
  font-size: 13pt; font-weight: 600; color: #0a0a0a;
  letter-spacing: -0.2px; line-height: 1.15; overflow-wrap: anywhere;
}
.t-modern .mo-brand-sub { margin-top: 3px; font-size: 9pt; color: #6b7280; }

.t-modern .mo-title-col { text-align: right; }
.t-modern .mo-title {
  font-size: 14pt; font-weight: 600; color: #0a0a0a;
  letter-spacing: -0.3px; line-height: 1;
}
.t-modern .mo-gen { margin-top: 4px; font-size: 8.5pt; color: #6b7280; }

.t-modern .mo-toprow {
  display: grid; grid-template-columns: 1.1fr 1fr;
  gap: 16px; margin-bottom: 20px; align-items: start;
}
@media (max-width: 520px) { .t-modern .mo-toprow { grid-template-columns: 1fr; } }

.t-modern .mo-addr-block { font-size: 9.5pt; color: #0a0a0a; line-height: 1.6; }
.t-modern .mo-addr-name {
  font-size: 10.5pt; font-weight: 600; letter-spacing: -0.15px;
  margin-bottom: 3px; overflow-wrap: anywhere;
}
.t-modern .mo-addr-lines { color: #4b5563; white-space: pre-line; overflow-wrap: anywhere; }
.t-modern .mo-addr-tax {
  margin-top: 8px;
  display: grid; grid-template-columns: 44px 1fr; gap: 3px 8px; font-size: 8.5pt;
}
.t-modern .mo-addr-tax .k { font-weight: 600; color: #0a0a0a; }
.t-modern .mo-addr-tax .v {
  font-family: 'Noto Sans Mono', monospace;
  color: #4b5563; font-size: 8pt; overflow-wrap: anywhere;
}

/* Info panel — calm light gray instead of black */
.t-modern .mo-info-panel {
  background: #eeeef0;
  border: 1px solid #e0e0e3;
  border-radius: 10px;
  padding: 12px 16px;
  display: grid; gap: 1px;
}
.t-modern .mo-info-row {
  display: grid; grid-template-columns: 1fr auto;
  padding: 5px 0;
  border-bottom: 0.5px solid #dcdce0;
  gap: 10px; font-size: 9pt;
}
.t-modern .mo-info-row:last-child { border-bottom: none; }
.t-modern .mo-info-row .k { color: #6b7280; }
.t-modern .mo-info-row .v {
  color: #0a0a0a; font-weight: 500; text-align: right; overflow-wrap: anywhere;
}

.t-modern .mo-section-label {
  font-size: 10.5pt; font-weight: 600; color: #0a0a0a;
  margin: 20px 0 10px; letter-spacing: -0.1px;
}

.t-modern .mo-panel {
  background: #f7f7f8; border-radius: 10px; padding: 2px 16px;
}
.t-modern .mo-panel-row {
  display: grid; grid-template-columns: 140px 1fr;
  padding: 8px 0; gap: 16px; align-items: baseline;
  border-bottom: 0.5px solid #e5e7eb; font-size: 9pt;
}
.t-modern .mo-panel-row:last-child { border-bottom: none; }
.t-modern .mo-panel-row .k { color: #0a0a0a; font-weight: 500; }
.t-modern .mo-panel-row .v {
  color: #4b5563; text-align: right;
  font-variant-numeric: tabular-nums; overflow-wrap: anywhere;
}
.t-modern .mo-panel-row .v.mono { font-family: 'Noto Sans Mono', monospace; font-size: 8.5pt; }
.t-modern .mo-panel-row .v.name { color: #0a0a0a; font-weight: 500; }
.t-modern .mo-panel-row .v.addr { white-space: pre-line; color: #4b5563; }
.t-modern .mo-panel-row .v.amount { font-size: 10pt; font-weight: 600; color: #0a0a0a; }

.t-modern .mo-items {
  background: #f7f7f8; border-radius: 10px; padding: 2px 16px;
}
.t-modern .mo-item {
  display: grid; grid-template-columns: 28px 1fr 50px 70px 80px;
  gap: 8px; padding: 10px 0;
  border-bottom: 0.5px solid #e5e7eb; align-items: flex-start;
}
.t-modern .mo-item:last-child { border-bottom: none; }
@media (max-width: 640px) {
  .t-modern .mo-item { grid-template-columns: 22px 1fr 36px 56px 70px; gap: 5px; }
}
.t-modern .mo-item-num {
  font-family: 'Noto Sans Mono', monospace;
  color: #9ca3af; font-size: 8.5pt; padding-top: 1px;
}
.t-modern .mo-item-title {
  font-size: 9.5pt; font-weight: 600; color: #0a0a0a;
  margin-bottom: 2px; overflow-wrap: anywhere;
}
.t-modern .mo-item-body {
  font-size: 8.5pt; color: #6b7280; line-height: 1.5;
  overflow-wrap: anywhere; white-space: pre-line;
}
.t-modern .mo-item-qty, .t-modern .mo-item-rate, .t-modern .mo-item-amount {
  font-size: 9pt; color: #0a0a0a; padding-top: 1px;
  text-align: right; font-variant-numeric: tabular-nums; overflow-wrap: anywhere;
}
.t-modern .mo-item-amount { font-weight: 600; }

.t-modern .mo-totals {
  margin-top: 14px; background: #f7f7f8;
  border-radius: 10px; padding: 2px 16px;
}
.t-modern .mo-totals-row {
  display: grid; grid-template-columns: 1fr auto;
  padding: 8px 0; gap: 10px;
  border-bottom: 0.5px solid #e5e7eb; font-size: 9pt;
}
.t-modern .mo-totals-row:last-child { border-bottom: none; }
.t-modern .mo-totals-row .label { color: #6b7280; }
.t-modern .mo-totals-row .val {
  color: #0a0a0a; font-weight: 500;
  font-variant-numeric: tabular-nums; text-align: right; overflow-wrap: anywhere;
}
.t-modern .mo-totals-row.grand .label { color: #0a0a0a; font-weight: 600; font-size: 9.5pt; }
.t-modern .mo-totals-row.grand .val {
  font-size: 12pt; font-weight: 700; color: #0a0a0a; letter-spacing: -0.2px;
}

.t-modern .mo-footer {
  margin-top: 22px; padding-top: 12px;
  border-top: 0.5px solid #e5e7eb;
  font-size: 8pt; color: #9ca3af;
  display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
}
.t-modern .mo-footer .mono { font-family: 'Noto Sans Mono', monospace; }

/* ============ PRINT ============ */
@media print {
  @page { size: A4; margin: 12mm 14mm; }
  html, body, #root, .app { height: auto; overflow: visible; background: #fff; }
  .topbar, .editor { display: none !important; }
  .main { display: block; }
  .preview-bg { background: #fff; padding: 0; overflow: visible; }
  .paper {
    max-width: none; margin: 0; padding: 0;
    box-shadow: none; border-radius: 0;
  }
  .paper.t-statement, .paper.t-formal, .paper.t-ledger, .paper.t-modern { padding: 0; }
  .paper.t-modern { border-radius: 0; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

/* ============================================================
   CONSTANTS, DATA MODEL
   ============================================================ */
const THEMES = [
  { key: 'statement', label: 'Statement' },
  { key: 'formal',    label: 'Formal' },
  { key: 'ledger',    label: 'Ledger' },
  { key: 'modern',    label: 'Modern' },
];
const THEME_KEYS = THEMES.map(t => t.key);

const CURRENCIES = [
  { code: 'EUR', locale: 'en-IE' },
  { code: 'USD', locale: 'en-US' },
  { code: 'GBP', locale: 'en-GB' },
];

const DEFAULT_SENDER_IDENTITY = () => ({
  name: 'Andrey Zhikalov',
  role: 'Autónomo',
  address: 'Av Regne de Valencia, 58, 1b\nValencia, 46005\nEspaña',
  taxLabel: 'ES NIF',
  taxValue: 'Z1100750K',
  phone: '+34 635 84 56 37',
  email: 'and.zhikalov@gmail.com',
});

const DEFAULT_SENDER_PAYMENT = () => ({
  beneficiary: 'Andrey Zhikalov',
  bank: 'Revolut Bank UAB',
  iban: 'ES31 1583 0001 1290 0655 6222',
  swift: 'REVOESM2',
  correspondentBic: 'CHASDEFX',
  bankAddress: 'Calle Príncipe de Vergara 132, 4 planta, 28002, Madrid, Spain',
});

const DEFAULT_DATA = () => {
  const today = new Date();
  const isoDate = (d) => d.toISOString().slice(0, 10);
  const firstOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  return {
    theme: 'statement',
    meta: {
      number: '',
      date: isoDate(today),
      servicePeriodFrom: isoDate(firstOfMonth),
      servicePeriodTo: isoDate(today),
      paymentTermsDays: 15,
      currency: 'EUR',
      taxPercent: 0,
    },
    from: DEFAULT_SENDER_IDENTITY(),
    billedTo: {
      name: 'Client Company',
      address: 'Street Address\nCity, Postcode\nCountry',
      taxLabel: 'VAT',
      taxValue: '',
    },
    items: [
      { id: 1, title: 'Design services',
        desc: 'Brief description of the scope and deliverables.',
        qty: 1, rate: 500 },
    ],
    payment: DEFAULT_SENDER_PAYMENT(),
  };
};

const DEFAULT_SENDERS = () => ([
  {
    id: 'me-default',
    label: 'Andrey Zhikalov (Autónomo)',
    from: DEFAULT_SENDER_IDENTITY(),
    payment: DEFAULT_SENDER_PAYMENT(),
  },
]);

const DEFAULT_CLIENTS = () => ([
  {
    id: 'c-seed-1',
    label: 'smiit GmbH',
    name: 'smiit GmbH',
    address: 'Reiherweg 96, 89584\nEhingen, Germany',
    taxLabel: 'VAT',
    taxValue: 'DE35 7299 821',
  },
]);

/* ============================================================
   HELPERS
   ============================================================ */
function toNum(v) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(amount, currency = 'EUR') {
  const ccy = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  try {
    return new Intl.NumberFormat(ccy.locale, {
      style: 'currency', currency: ccy.code,
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(toNum(amount));
  } catch {
    return `${ccy.code} ${toNum(amount).toFixed(2)}`;
  }
}

function parseISO(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}
function formatDateLong(iso) {
  const d = parseISO(iso);
  if (!d) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
function formatDateShort(iso) {
  const d = parseISO(iso);
  if (!d) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' });
}
function formatDateDigits(iso) {
  const d = parseISO(iso);
  if (!d) return '—';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getUTCFullYear()}`;
}
function formatPeriod(from, to) {
  const a = parseISO(from), b = parseISO(to);
  if (!a && !b) return '—';
  if (!a) return formatDateLong(to);
  if (!b) return formatDateLong(from);
  const yA = a.getUTCFullYear(), yB = b.getUTCFullYear();
  const left = yA === yB ? formatDateShort(from) : `${formatDateShort(from)} ${yA}`;
  return `${left} — ${formatDateShort(to)} ${yB}`;
}
function addDays(iso, days) {
  const d = parseISO(iso);
  if (!d) return null;
  d.setUTCDate(d.getUTCDate() + toNum(days));
  return d.toISOString().slice(0, 10);
}
function newId(prefix = 'c') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/* ============================================================
   ICONS
   ============================================================ */
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconPrint = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);
const IconReset = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 3-6.7" /><polyline points="3 4 3 10 9 10" />
  </svg>
);
const IconChevron = ({ open }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function InvoiceEditor({ initialData, initialClients, initialSenders } = {}) {
  const [data, setData] = useState(() => initialData || DEFAULT_DATA());
  const [clients, setClients] = useState(() => initialClients || DEFAULT_CLIENTS());
  const [senders, setSenders] = useState(() => initialSenders || DEFAULT_SENDERS());
  const [clientsOpen, setClientsOpen] = useState(false);
  const [sendersOpen, setSendersOpen] = useState(false);
  const [loaded, setLoaded] = useState(Boolean(initialData));
  const nextItemIdRef = useRef(
    initialData?.items?.length
      ? Math.max(0, ...initialData.items.map(i => i.id || 0)) + 1
      : 2
  );

  useEffect(() => {
    if (initialData) return;
    (async () => {
      try {
        const r1 = await storage.get('az-invoice-v1');
        if (r1?.value) {
          const parsed = JSON.parse(r1.value);
          if (parsed?.meta && Array.isArray(parsed.items)) {
            if (!THEME_KEYS.includes(parsed.theme)) parsed.theme = 'statement';
            setData(parsed);
            nextItemIdRef.current = Math.max(0, ...parsed.items.map(i => i.id || 0)) + 1;
          }
        }
        const r2 = await storage.get('az-clients-v1');
        if (r2?.value) {
          const parsed = JSON.parse(r2.value);
          if (Array.isArray(parsed)) setClients(parsed);
        }
        const r3 = await storage.get('az-senders-v1');
        if (r3?.value) {
          const parsed = JSON.parse(r3.value);
          if (Array.isArray(parsed) && parsed.length > 0) setSenders(parsed);
        }
      } catch {}
      setLoaded(true);
    })();
  }, [initialData]);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      storage.set('az-invoice-v1', JSON.stringify(data)).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [data, loaded]);

  useEffect(() => {
    if (!loaded) return;
    storage.set('az-clients-v1', JSON.stringify(clients)).catch(() => {});
  }, [clients, loaded]);

  useEffect(() => {
    if (!loaded) return;
    storage.set('az-senders-v1', JSON.stringify(senders)).catch(() => {});
  }, [senders, loaded]);

  const subtotal = useMemo(
    () => data.items.reduce((s, it) => s + toNum(it.qty) * toNum(it.rate), 0),
    [data.items]
  );
  const taxAmount = useMemo(
    () => subtotal * toNum(data.meta.taxPercent) / 100,
    [subtotal, data.meta.taxPercent]
  );
  const total = subtotal + taxAmount;
  const dueDateIso = useMemo(
    () => addDays(data.meta.date, data.meta.paymentTermsDays),
    [data.meta.date, data.meta.paymentTermsDays]
  );

  const patchMeta = (p) => setData(d => ({ ...d, meta: { ...d.meta, ...p } }));
  const patchFrom = (p) => setData(d => ({ ...d, from: { ...d.from, ...p } }));
  const patchBilledTo = (p) => setData(d => ({ ...d, billedTo: { ...d.billedTo, ...p } }));
  const patchPayment = (p) => setData(d => ({ ...d, payment: { ...d.payment, ...p } }));
  const setTheme = (theme) => setData(d => ({ ...d, theme }));

  const updateItem = (id, p) =>
    setData(d => ({ ...d, items: d.items.map(it => (it.id === id ? { ...it, ...p } : it)) }));
  const removeItem = (id) =>
    setData(d => ({ ...d, items: d.items.filter(it => it.id !== id) }));
  const addItem = () => {
    const id = nextItemIdRef.current++;
    setData(d => ({ ...d, items: [...d.items, { id, title: '', desc: '', qty: 1, rate: 0 }] }));
  };

  const loadClient = (clientId) => {
    if (!clientId) return;
    const c = clients.find(x => x.id === clientId);
    if (!c) return;
    patchBilledTo({
      name: c.name || '', address: c.address || '',
      taxLabel: c.taxLabel || '', taxValue: c.taxValue || '',
    });
  };
  const saveAsClient = () => {
    const bt = data.billedTo;
    if (!bt.name?.trim()) { alert('Please fill in the client name first.'); return; }
    const label = prompt('Save this client as:', bt.name) || bt.name;
    setClients(cs => [...cs, {
      id: newId('c'), label: label.trim() || bt.name,
      name: bt.name, address: bt.address,
      taxLabel: bt.taxLabel, taxValue: bt.taxValue,
    }]);
  };
  const deleteClient = (id) => {
    const c = clients.find(x => x.id === id);
    if (!confirm(`Delete client "${c?.label || 'this client'}"?`)) return;
    setClients(cs => cs.filter(x => x.id !== id));
  };

  const loadSender = (senderId) => {
    if (!senderId) return;
    const s = senders.find(x => x.id === senderId);
    if (!s) return;
    setData(d => ({ ...d, from: { ...s.from }, payment: { ...s.payment } }));
  };
  const saveAsSender = () => {
    if (!data.from.name?.trim()) { alert('Please fill in your name first.'); return; }
    const suggested = data.from.name + (data.from.role ? ` (${data.from.role})` : '');
    const label = prompt('Save this profile (From + Payment details) as:', suggested) || data.from.name;
    setSenders(ss => [...ss, {
      id: newId('s'), label: label.trim() || data.from.name,
      from: { ...data.from }, payment: { ...data.payment },
    }]);
  };
  const deleteSender = (id) => {
    const s = senders.find(x => x.id === id);
    if (!confirm(`Delete profile "${s?.label || 'this profile'}"? Only the saved entry is removed; the current invoice is untouched.`)) return;
    setSenders(ss => ss.filter(x => x.id !== id));
  };

  const resetAll = () => {
    if (confirm('Reset all invoice fields to the default template? Saved clients and sender profiles will be kept.')) {
      setData(DEFAULT_DATA());
      nextItemIdRef.current = 2;
    }
  };
  const handlePrint = () => window.print();

  const ccy = data.meta.currency;
  const theme = THEME_KEYS.includes(data.theme) ? data.theme : 'statement';
  const previewProps = { data: { ...data, theme }, subtotal, taxAmount, total, dueDateIso };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="app">
        <div className="topbar">
          <div className="topbar-title">
            <span className="brand">Andrey Zhikalov</span>
            <span className="sep" />
            <span>Invoice Editor</span>
          </div>
          <div className="topbar-actions">
            <div className="theme-switch" role="tablist" aria-label="Design theme">
              {THEMES.map(t => (
                <button
                  key={t.key}
                  className={theme === t.key ? 'active' : ''}
                  onClick={() => setTheme(t.key)}
                  type="button" role="tab" aria-selected={theme === t.key}
                >{t.label}</button>
              ))}
            </div>
            <button className="btn btn-ghost" onClick={resetAll} title="Reset invoice fields">
              <IconReset /> Reset
            </button>
            <button className="btn btn-primary" onClick={handlePrint}>
              <IconPrint /> Print / Save PDF
            </button>
          </div>
        </div>

        <div className="main">
          <div className="editor">
            {/* Invoice Details */}
            <div className="section">
              <div className="section-label">Invoice Details</div>
              <div className="field">
                <label className="field-label">Invoice Number</label>
                <input className="input is-mono"
                  value={data.meta.number}
                  onChange={e => patchMeta({ number: e.target.value })}
                  placeholder="#3" />
              </div>
              <div className="field-row field-row-2">
                <div className="field">
                  <label className="field-label">Invoice Date</label>
                  <input type="date" className="input is-mono"
                    value={data.meta.date}
                    onChange={e => patchMeta({ date: e.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label">Payment Terms (days)</label>
                  <input type="number" min="0" step="1"
                    className="input input-num is-mono"
                    value={data.meta.paymentTermsDays}
                    onChange={e => patchMeta({ paymentTermsDays: e.target.value })} />
                </div>
              </div>
              <div className="field-row field-row-2">
                <div className="field">
                  <label className="field-label">Service Period — From</label>
                  <input type="date" className="input is-mono"
                    value={data.meta.servicePeriodFrom}
                    onChange={e => patchMeta({ servicePeriodFrom: e.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label">Service Period — To</label>
                  <input type="date" className="input is-mono"
                    value={data.meta.servicePeriodTo}
                    onChange={e => patchMeta({ servicePeriodTo: e.target.value })} />
                </div>
              </div>
              <div className="field-row field-row-2">
                <div className="field">
                  <label className="field-label">Currency</label>
                  <select className="select"
                    value={data.meta.currency}
                    onChange={e => patchMeta({ currency: e.target.value })}>
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Tax % (0 for reverse charge)</label>
                  <input type="number" min="0" step="0.5"
                    className="input input-num is-mono"
                    value={data.meta.taxPercent}
                    onChange={e => patchMeta({ taxPercent: e.target.value })} />
                </div>
              </div>
            </div>

            {/* From — with Sender picker */}
            <div className="section">
              <div className="section-label">From — Your Details</div>

              <div className="picker">
                <div className="picker-label">Saved sender profiles (loads From + Payment)</div>
                <select className="select" value=""
                  onChange={e => { loadSender(e.target.value); e.target.value = ''; }}>
                  <option value="">— Select a profile to autofill —</option>
                  {senders.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                <button className="btn btn-ghost" onClick={saveAsSender}>
                  <IconPlus /> Save
                </button>
              </div>

              <div className="field-row field-row-2">
                <div className="field">
                  <label className="field-label">Name</label>
                  <input className="input"
                    value={data.from.name}
                    onChange={e => patchFrom({ name: e.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label">Role / Subtitle</label>
                  <input className="input"
                    value={data.from.role}
                    onChange={e => patchFrom({ role: e.target.value })}
                    placeholder="Autónomo" />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Address</label>
                <textarea className="textarea" rows={3}
                  value={data.from.address}
                  onChange={e => patchFrom({ address: e.target.value })} />
              </div>
              <div className="field-row field-row-2">
                <div className="field">
                  <label className="field-label">Tax label</label>
                  <input className="input"
                    value={data.from.taxLabel}
                    onChange={e => patchFrom({ taxLabel: e.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label">Tax value (NIF)</label>
                  <input className="input is-mono"
                    value={data.from.taxValue}
                    onChange={e => patchFrom({ taxValue: e.target.value })} />
                </div>
              </div>
              <div className="field-row field-row-2">
                <div className="field">
                  <label className="field-label">Phone</label>
                  <input className="input is-mono"
                    value={data.from.phone}
                    onChange={e => patchFrom({ phone: e.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label">Email</label>
                  <input className="input is-mono"
                    value={data.from.email}
                    onChange={e => patchFrom({ email: e.target.value })} />
                </div>
              </div>

              <div className="profile-list">
                <div className="profile-list-head" onClick={() => setSendersOpen(o => !o)}>
                  <span>Manage saved profiles ({senders.length})</span>
                  <IconChevron open={sendersOpen} />
                </div>
                {sendersOpen && (
                  <>
                    {senders.length === 0 && (
                      <div className="profile-list-empty">No saved profiles yet.</div>
                    )}
                    {senders.map(s => (
                      <div className="profile-list-row" key={s.id}>
                        <div className="meta">
                          <div className="ln">{s.label}</div>
                          <div className="sub">
                            {s.from?.name || ''}{s.from?.taxValue ? ` · ${s.from.taxValue}` : ''}
                          </div>
                        </div>
                        <button className="btn btn-ghost"
                          style={{ fontSize: 11, padding: '5px 10px' }}
                          onClick={() => loadSender(s.id)}>
                          Load
                        </button>
                        <button className="icon-btn" onClick={() => deleteSender(s.id)}
                          aria-label="Delete profile" title="Delete profile">
                          <IconTrash />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Billed To — Client */}
            <div className="section">
              <div className="section-label">Billed To — Client</div>

              <div className="picker">
                <div className="picker-label">Saved clients</div>
                <select className="select" value=""
                  onChange={e => { loadClient(e.target.value); e.target.value = ''; }}>
                  <option value="">— Select to autofill —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <button className="btn btn-ghost" onClick={saveAsClient}>
                  <IconPlus /> Save
                </button>
              </div>

              <div className="field">
                <label className="field-label">Client name</label>
                <input className="input"
                  value={data.billedTo.name}
                  onChange={e => patchBilledTo({ name: e.target.value })}
                  placeholder="Client Ltd" />
              </div>
              <div className="field">
                <label className="field-label">Address</label>
                <textarea className="textarea" rows={3}
                  value={data.billedTo.address}
                  onChange={e => patchBilledTo({ address: e.target.value })} />
              </div>
              <div className="field-row field-row-2">
                <div className="field">
                  <label className="field-label">Tax label</label>
                  <input className="input"
                    value={data.billedTo.taxLabel}
                    onChange={e => patchBilledTo({ taxLabel: e.target.value })}
                    placeholder="VAT" />
                </div>
                <div className="field">
                  <label className="field-label">Tax value</label>
                  <input className="input is-mono"
                    value={data.billedTo.taxValue}
                    onChange={e => patchBilledTo({ taxValue: e.target.value })}
                    placeholder="DE35 7299 821" />
                </div>
              </div>

              <div className="profile-list">
                <div className="profile-list-head" onClick={() => setClientsOpen(o => !o)}>
                  <span>Manage saved clients ({clients.length})</span>
                  <IconChevron open={clientsOpen} />
                </div>
                {clientsOpen && (
                  <>
                    {clients.length === 0 && (
                      <div className="profile-list-empty">No saved clients yet.</div>
                    )}
                    {clients.map(c => (
                      <div className="profile-list-row" key={c.id}>
                        <div className="meta">
                          <div className="ln">{c.label}</div>
                          <div className="sub">{c.name}{c.taxValue ? ` · ${c.taxValue}` : ''}</div>
                        </div>
                        <button className="btn btn-ghost"
                          style={{ fontSize: 11, padding: '5px 10px' }}
                          onClick={() => loadClient(c.id)}>
                          Load
                        </button>
                        <button className="icon-btn" onClick={() => deleteClient(c.id)}
                          aria-label="Delete client" title="Delete client">
                          <IconTrash />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="section">
              <div className="section-label">Line Items — Services</div>
              {data.items.map((item, idx) => (
                <div className="item-card" key={item.id}>
                  <div className="item-card-head">
                    <span className="item-index">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="item-amount">
                      {formatMoney(toNum(item.qty) * toNum(item.rate), ccy)}
                    </span>
                    <button className="icon-btn" onClick={() => removeItem(item.id)}
                      aria-label="Remove item" title="Remove item">
                      <IconTrash />
                    </button>
                  </div>
                  <div className="field">
                    <label className="field-label">Title</label>
                    <input className="input"
                      value={item.title}
                      onChange={e => updateItem(item.id, { title: e.target.value })}
                      placeholder="Service title" />
                  </div>
                  <div className="field">
                    <label className="field-label">Description</label>
                    <textarea className="textarea" rows={3}
                      value={item.desc}
                      onChange={e => updateItem(item.id, { desc: e.target.value })} />
                  </div>
                  <div className="field-row field-row-2">
                    <div className="field">
                      <label className="field-label">Quantity</label>
                      <input type="number" step="any" min="0"
                        className="input input-num is-mono"
                        value={item.qty}
                        onChange={e => updateItem(item.id, { qty: e.target.value })} />
                    </div>
                    <div className="field">
                      <label className="field-label">Rate ({ccy})</label>
                      <input type="number" step="0.01" min="0"
                        className="input input-money is-mono"
                        value={item.rate}
                        onChange={e => updateItem(item.id, { rate: e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}
              {data.items.length === 0 && (
                <div style={{
                  padding: 24, textAlign: 'center', color: 'var(--ink-50)',
                  border: '1px dashed var(--hair)', borderRadius: 8, marginBottom: 10, fontSize: 13,
                }}>No line items yet.</div>
              )}
              <button className="add-item-btn" onClick={addItem}>
                <IconPlus /> Add line item
              </button>
            </div>

            {/* Payment */}
            <div className="section">
              <div className="section-label">Payment Information</div>
              <div className="field-row field-row-2">
                <div className="field">
                  <label className="field-label">Beneficiary</label>
                  <input className="input"
                    value={data.payment.beneficiary}
                    onChange={e => patchPayment({ beneficiary: e.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label">Bank</label>
                  <input className="input"
                    value={data.payment.bank}
                    onChange={e => patchPayment({ bank: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label className="field-label">IBAN</label>
                <input className="input is-mono"
                  value={data.payment.iban}
                  onChange={e => patchPayment({ iban: e.target.value })} />
              </div>
              <div className="field-row field-row-2">
                <div className="field">
                  <label className="field-label">SWIFT / BIC</label>
                  <input className="input is-mono"
                    value={data.payment.swift}
                    onChange={e => patchPayment({ swift: e.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label">Correspondent BIC</label>
                  <input className="input is-mono"
                    value={data.payment.correspondentBic}
                    onChange={e => patchPayment({ correspondentBic: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Bank address</label>
                <textarea className="textarea" rows={2}
                  value={data.payment.bankAddress}
                  onChange={e => patchPayment({ bankAddress: e.target.value })} />
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          <div className="preview-bg">
            <div className={`paper t-${theme}`}>
              <Preview theme={theme} {...previewProps} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   PREVIEW DISPATCHER
   ============================================================ */
function Preview({ theme, ...props }) {
  if (theme === 'formal') return <FormalPreview {...props} />;
  if (theme === 'ledger') return <LedgerPreview {...props} />;
  if (theme === 'modern') return <ModernPreview {...props} />;
  return <StatementPreview {...props} />;
}

/* ============================================================
   THEME 1 — STATEMENT
   ============================================================ */
function StatementPreview({ data, subtotal, taxAmount, total, dueDateIso }) {
  const { meta, from, billedTo, items, payment } = data;
  const ccy = meta.currency;
  return (
    <>
      <div className="st-head">
        <div>
          <div className="st-brand-name">{from.name || '—'}</div>
          {from.role && <div className="st-brand-sub">{from.role}</div>}
        </div>
        <div className="st-title-col">
          <div className="st-title">Invoice</div>
          <div className="st-contact">
            {from.phone && <>Contact tel <span className="strong">{from.phone}</span><br/></>}
            {from.email && <>Email <span className="strong">{from.email}</span></>}
          </div>
        </div>
      </div>

      <div className="st-intro-title">Current Invoice Statement</div>
      <div className="st-intro">
        <div className="st-kv"><span className="k">Invoice number</span><span className="v mono">{meta.number || '—'}</span></div>
        <div className="st-kv"><span className="k">Currency</span><span className="v">{ccy}</span></div>
        <div className="st-kv"><span className="k">Issue date</span><span className="v">{formatDateLong(meta.date)}</span></div>
        <div className="st-kv"><span className="k">Due date</span><span className="v">{formatDateLong(dueDateIso)}</span></div>
        <div className="st-kv"><span className="k">Payment terms</span><span className="v">Net {toNum(meta.paymentTermsDays)} days</span></div>
        <div className="st-kv"><span className="k">Tax treatment</span><span className="v">{toNum(meta.taxPercent) === 0 ? 'Reverse charge — 0%' : toNum(meta.taxPercent) + '%'}</span></div>
      </div>

      <div className="st-parties">
        <div>
          <div className="st-party-label">Billed To</div>
          <div className="st-party-name">{billedTo.name || '—'}</div>
          <div className="st-party-addr">{billedTo.address || '—'}</div>
          {billedTo.taxValue && (
            <div className="st-party-tax">{billedTo.taxLabel}: {billedTo.taxValue}</div>
          )}
        </div>
        <div>
          <div className="st-iban-head">International Bank Account Number</div>
          <div className="st-iban-val">{payment.iban || '—'}</div>
          <div className="st-iban-head">SWIFT / BIC</div>
          <div className="st-iban-val">{payment.swift || '—'}</div>
        </div>
      </div>

      <div className="st-tx-head">
        <div className="st-tx-title">Transactions</div>
        <div className="st-tx-sub">Services during {formatPeriod(meta.servicePeriodFrom, meta.servicePeriodTo)}</div>
      </div>

      <div className="st-items-head">
        <div>Date</div><div>Description</div>
        <div>Qty</div><div>Rate</div><div>Amount</div>
      </div>
      {items.map((it) => {
        const amt = toNum(it.qty) * toNum(it.rate);
        return (
          <div className="st-item" key={it.id}>
            <div className="st-item-date">{formatDateShort(meta.date)}</div>
            <div>
              <div className="st-item-title">{it.title || '—'}</div>
              {it.desc && <div className="st-item-body">{it.desc}</div>}
            </div>
            <div className="st-item-qty">{toNum(it.qty)}</div>
            <div className="st-item-rate">{formatMoney(it.rate, ccy)}</div>
            <div className="st-item-amount">{formatMoney(amt, ccy)}</div>
          </div>
        );
      })}

      <div className="st-totals">
        <div className="st-totals-inner">
          <div className="st-totals-row">
            <div className="label">Subtotal</div>
            <div className="val">{formatMoney(subtotal, ccy)}</div>
          </div>
          <div className="st-totals-row">
            <div className="label">Tax ({toNum(meta.taxPercent)}%)</div>
            <div className="val">{formatMoney(taxAmount, ccy)}</div>
          </div>
          <div className="st-totals-row grand">
            <div className="label">Balance Due</div>
            <div className="val">{formatMoney(total, ccy)}</div>
          </div>
        </div>
      </div>

      <div className="st-payment">
        <div className="st-payment-label">Payment Details</div>
        <div className="st-pay-grid">
          <div className="pay-row"><span className="k">Beneficiary</span><span className="v">{payment.beneficiary || '—'}</span></div>
          <div className="pay-row"><span className="k">Bank</span><span className="v">{payment.bank || '—'}</span></div>
          <div className="pay-row"><span className="k">IBAN</span><span className="v mono">{payment.iban || '—'}</span></div>
          <div className="pay-row"><span className="k">SWIFT / BIC</span><span className="v mono">{payment.swift || '—'}</span></div>
          {payment.correspondentBic && (
            <div className="pay-row"><span className="k">Correspondent</span><span className="v mono">{payment.correspondentBic}</span></div>
          )}
          {payment.bankAddress && (
            <div className="pay-row full"><span className="k">Bank address</span><span className="v">{payment.bankAddress}</span></div>
          )}
        </div>
      </div>

      <div className="st-footer">
        <div>Correspondence: {from.name || '—'}{from.address ? ' · ' + from.address.split('\n')[0] : ''}</div>
        <div>Invoice Nº {meta.number || '—'}</div>
      </div>
    </>
  );
}

/* ============================================================
   THEME 2 — FORMAL
   ============================================================ */
function FormalPreview({ data, subtotal, taxAmount, total, dueDateIso }) {
  const { meta, from, billedTo, items, payment } = data;
  const ccy = meta.currency;
  return (
    <>
      <div className="fm-head">
        <span className="fm-brand-name">{from.name || '—'}</span>
        {from.role && <span className="fm-brand-sub">— {from.role}</span>}
      </div>
      <div className="fm-rule-top" />

      <div className="fm-top-grid">
        <div className="fm-addr">
          <div className="fm-addr-name">{billedTo.name || '—'}</div>
          <div className="fm-addr-line">{billedTo.address || '—'}</div>
          {billedTo.taxValue && (
            <div className="fm-addr-tax">{billedTo.taxLabel}: {billedTo.taxValue}</div>
          )}
        </div>
        <div className="fm-meta-grid">
          <div className="fm-meta-k">Date</div><div className="fm-meta-v">{formatDateLong(meta.date)}</div>
          <div className="fm-meta-k">Invoice No.</div><div className="fm-meta-v mono">{meta.number || '—'}</div>
          <div className="fm-meta-k">Account Name</div><div className="fm-meta-v">{payment.beneficiary || '—'}</div>
          <div className="fm-meta-k">IBAN</div><div className="fm-meta-v mono">{payment.iban || '—'}</div>
          <div className="fm-meta-k">Swift/BIC</div><div className="fm-meta-v mono">{payment.swift || '—'}</div>
          <div className="fm-meta-k">Due Date</div><div className="fm-meta-v">{formatDateLong(dueDateIso)}</div>
        </div>
      </div>

      <div className="fm-title-block">
        <div className="fm-title">Invoice</div>
        <div className="fm-title-sub">
          Service period: {formatDateDigits(meta.servicePeriodFrom)} — {formatDateDigits(meta.servicePeriodTo)}
        </div>
      </div>

      <div className="fm-items-head">
        <div>Date</div><div>Description</div>
        <div>Qty</div><div>Rate</div><div>Amount</div>
      </div>
      {items.map((it) => {
        const amt = toNum(it.qty) * toNum(it.rate);
        return (
          <div className="fm-item" key={it.id}>
            <div className="fm-item-date">{formatDateDigits(meta.date)}</div>
            <div>
              <div className="fm-item-title">{it.title || '—'}</div>
              {it.desc && <div className="fm-item-body">{it.desc}</div>}
            </div>
            <div className="fm-item-qty">{toNum(it.qty)}</div>
            <div className="fm-item-rate">{formatMoney(it.rate, ccy)}</div>
            <div className="fm-item-amount">{formatMoney(amt, ccy)}</div>
          </div>
        );
      })}

      <div className="fm-totals">
        <div className="fm-totals-inner">
          <div className="fm-totals-row">
            <div className="label">Subtotal</div>
            <div className="val">{formatMoney(subtotal, ccy)}</div>
          </div>
          <div className="fm-totals-row">
            <div className="label">Tax {toNum(meta.taxPercent)}%</div>
            <div className="val">{formatMoney(taxAmount, ccy)}</div>
          </div>
          <div className="fm-totals-row grand">
            <div className="label">Balance — {formatDateDigits(meta.date)}</div>
            <div className="val">{formatMoney(total, ccy)}</div>
          </div>
        </div>
      </div>

      <div className="fm-attest">
        For and on behalf of {from.name || '—'}{from.role ? ' — ' + from.role : ''}
        <div className="fm-attest-addr">{(from.address || '').split('\n').join(', ')}</div>
      </div>

      <div className="fm-signatures">
        <div className="fm-sig">
          <div className="fm-sig-name">{from.name || '—'}</div>
          <div className="fm-sig-id">ID: {from.taxValue || '—'}</div>
          <div className="fm-sig-role">{from.role || 'Service Provider'}</div>
        </div>
        <div className="fm-sig">
          <div className="fm-sig-name">{billedTo.name || '—'}</div>
          <div className="fm-sig-id">
            {billedTo.taxLabel ? billedTo.taxLabel + ': ' : 'ID: '}{billedTo.taxValue || '—'}
          </div>
          <div className="fm-sig-role">Client</div>
        </div>
      </div>

      <div className="fm-footer">
        <div>Page 1 of 1</div>
        <div>{from.phone}{from.phone && from.email && ' / '}{from.email}</div>
      </div>
    </>
  );
}

/* ============================================================
   THEME 3 — LEDGER
   ============================================================ */
function LedgerPreview({ data, subtotal, taxAmount, total, dueDateIso }) {
  const { meta, from, billedTo, items, payment } = data;
  const ccy = meta.currency;
  const fromCity = (from.address || '').split('\n').find(l => l.trim()) || '';
  return (
    <>
      <div className="ld-head">
        <span className="ld-brand-name">{from.name || '—'}</span>
        <div className="ld-office">
          <div><span className="lbl">Office:</span> {fromCity || '—'}</div>
          <div><span className="lbl">Issue date:</span> {formatDateDigits(meta.date)}</div>
        </div>
      </div>

      <div className="ld-title">Invoice</div>

      <div className="ld-three">
        <div className="ld-three-head">
          <div>Issued by</div>
          <div>Amount</div>
          <div>Billed to</div>
        </div>
        <div className="ld-three-body">
          <div className="ld-three-col">
            <div className="ld-primary">
              <span className="ld-arrow">»</span>
              <span className="ld-primary-text">{from.name || '—'}</span>
            </div>
            {from.role && <div className="ld-sub-role">{from.role}</div>}
            <div className="ld-kv">
              {from.taxValue && <><div className="k">{from.taxLabel || 'Tax ID'}:</div><div className="v mono">{from.taxValue}</div></>}
              {from.email &&    <><div className="k">Email:</div><div className="v">{from.email}</div></>}
              {from.phone &&    <><div className="k">Phone:</div><div className="v mono">{from.phone}</div></>}
              {from.address &&  <><div className="k">Address:</div><div className="v addr">{from.address}</div></>}
            </div>
          </div>
          <div className="ld-three-col">
            <div className="ld-primary">
              <span className="ld-arrow">»</span>
              <span className="ld-primary-text amount">{formatMoney(total, ccy)}</span>
            </div>
            <div className="ld-kv">
              <div className="k">Currency:</div><div className="v">{ccy}</div>
              <div className="k">Invoice Nº:</div><div className="v mono">{meta.number || '—'}</div>
              <div className="k">Due date:</div><div className="v">{formatDateDigits(dueDateIso)}</div>
              <div className="k">Tax:</div><div className="v">{toNum(meta.taxPercent)}%</div>
            </div>
          </div>
          <div className="ld-three-col">
            <div className="ld-primary">
              <span className="ld-arrow">»</span>
              <span className="ld-primary-text">{billedTo.name || '—'}</span>
            </div>
            <div className="ld-kv">
              {billedTo.taxValue && <><div className="k">{billedTo.taxLabel || 'Tax ID'}:</div><div className="v mono">{billedTo.taxValue}</div></>}
              {billedTo.address &&  <><div className="k">Address:</div><div className="v addr">{billedTo.address}</div></>}
            </div>
          </div>
        </div>
      </div>

      <div className="ld-concept">
        <div className="ld-concept-label">Concept:</div>
        <div className="ld-concept-text">
          SERVICE PERIOD: {formatDateDigits(meta.servicePeriodFrom)} - {formatDateDigits(meta.servicePeriodTo)}
        </div>
      </div>

      <div className="ld-items-head">
        <div>#</div><div>Description</div>
        <div>Qty</div><div>Rate</div><div>Amount</div>
      </div>
      {items.map((it, i) => {
        const amt = toNum(it.qty) * toNum(it.rate);
        return (
          <div className="ld-item" key={it.id}>
            <div className="ld-item-num">{String(i + 1).padStart(2, '0')}</div>
            <div>
              <div className="ld-item-title">{it.title || '—'}</div>
              {it.desc && <div className="ld-item-body">{it.desc}</div>}
            </div>
            <div className="ld-item-qty">{toNum(it.qty)}</div>
            <div className="ld-item-rate">{formatMoney(it.rate, ccy)}</div>
            <div className="ld-item-amount">{formatMoney(amt, ccy)}</div>
          </div>
        );
      })}

      <div className="ld-totals">
        <div className="ld-totals-note">
          Amounts in {ccy}.{' '}
          {toNum(meta.taxPercent) === 0 && 'Tax 0% — reverse charge applies.'}
        </div>
        <div className="ld-totals-box">
          <div className="ld-totals-box-head">Settlement</div>
          <div className="ld-totals-row">
            <div className="label">Subtotal</div>
            <div className="val">{formatMoney(subtotal, ccy)}</div>
          </div>
          <div className="ld-totals-row">
            <div className="label">Tax ({toNum(meta.taxPercent)}%)</div>
            <div className="val">{formatMoney(taxAmount, ccy)}</div>
          </div>
          <div className="ld-totals-row grand">
            <div className="label">Total</div>
            <div className="val">{formatMoney(total, ccy)}</div>
          </div>
        </div>
      </div>

      <div className="ld-payment">
        <div className="ld-payment-head">Payment Information</div>
        <div className="ld-pay-grid">
          <div className="pay-row"><span className="k">Beneficiary</span><span className="v">{payment.beneficiary || '—'}</span></div>
          <div className="pay-row"><span className="k">Bank</span><span className="v">{payment.bank || '—'}</span></div>
          <div className="pay-row"><span className="k">IBAN</span><span className="v mono">{payment.iban || '—'}</span></div>
          <div className="pay-row"><span className="k">SWIFT / BIC</span><span className="v mono">{payment.swift || '—'}</span></div>
          {payment.correspondentBic && (
            <div className="pay-row"><span className="k">Correspondent BIC</span><span className="v mono">{payment.correspondentBic}</span></div>
          )}
          {payment.bankAddress && (
            <div className="pay-row full"><span className="k">Bank address</span><span className="v">{payment.bankAddress}</span></div>
          )}
        </div>
      </div>

      <div className="ld-footer">
        <div>
          <span className="ref">Invoice Nº: {meta.number || '—'}</span>
          {' / '}
          <span className="ref">Period: {formatDateDigits(meta.servicePeriodFrom).slice(3)}</span>
        </div>
        <div>Page 1 of 1</div>
      </div>
    </>
  );
}

/* ============================================================
   THEME 4 — MODERN
   ============================================================ */
function ModernPreview({ data, subtotal, taxAmount, total, dueDateIso }) {
  const { meta, from, billedTo, items, payment } = data;
  const ccy = meta.currency;
  return (
    <>
      <div className="mo-head">
        <div>
          <div className="mo-brand-name">{from.name || '—'}</div>
          {from.role && <div className="mo-brand-sub">{from.role}</div>}
        </div>
        <div className="mo-title-col">
          <div className="mo-title">Invoice</div>
          <div className="mo-gen">Generated on {formatDateLong(meta.date)}</div>
        </div>
      </div>

      <div className="mo-toprow">
        <div className="mo-addr-block">
          <div className="mo-addr-name">{from.name || '—'}</div>
          <div className="mo-addr-lines">{from.address || '—'}</div>
          <div className="mo-addr-tax">
            {from.taxValue && <><span className="k">{from.taxLabel || 'Tax'}</span><span className="v">{from.taxValue}</span></>}
            {payment.iban && <><span className="k">IBAN</span><span className="v">{payment.iban}</span></>}
            {payment.swift && <><span className="k">BIC</span><span className="v">{payment.swift}</span></>}
          </div>
        </div>
        <div className="mo-info-panel">
          <div className="mo-info-row"><span className="k">Value Date</span><span className="v">{formatDateLong(meta.date)}</span></div>
          <div className="mo-info-row"><span className="k">Due Date</span><span className="v">{formatDateLong(dueDateIso)}</span></div>
          <div className="mo-info-row"><span className="k">Status</span><span className="v">Pending</span></div>
          <div className="mo-info-row"><span className="k">Type</span><span className="v">Services Invoice</span></div>
        </div>
      </div>

      <div className="mo-section-label">Invoice details</div>
      <div className="mo-panel">
        <div className="mo-panel-row">
          <div className="k">Amount</div>
          <div className="v amount">{formatMoney(total, ccy)}</div>
        </div>
        <div className="mo-panel-row">
          <div className="k">Invoice No</div>
          <div className="v mono">{meta.number || '—'}</div>
        </div>
        <div className="mo-panel-row">
          <div className="k">Period</div>
          <div className="v">{formatDateDigits(meta.servicePeriodFrom)} — {formatDateDigits(meta.servicePeriodTo)}</div>
        </div>
        <div className="mo-panel-row">
          <div className="k">Payment terms</div>
          <div className="v">Net {toNum(meta.paymentTermsDays)} days</div>
        </div>
        <div className="mo-panel-row">
          <div className="k">Tax</div>
          <div className="v">{toNum(meta.taxPercent)}%{toNum(meta.taxPercent) === 0 ? ' — reverse charge' : ''}</div>
        </div>
      </div>

      <div className="mo-section-label">Billed to</div>
      <div className="mo-panel">
        <div className="mo-panel-row">
          <div className="k">Name</div>
          <div className="v name">{billedTo.name || '—'}</div>
        </div>
        <div className="mo-panel-row">
          <div className="k">Address</div>
          <div className="v addr">{billedTo.address || '—'}</div>
        </div>
        {billedTo.taxValue && (
          <div className="mo-panel-row">
            <div className="k">{billedTo.taxLabel || 'Tax'}</div>
            <div className="v mono">{billedTo.taxValue}</div>
          </div>
        )}
      </div>

      <div className="mo-section-label">Line items</div>
      <div className="mo-items">
        {items.map((it, i) => {
          const amt = toNum(it.qty) * toNum(it.rate);
          return (
            <div className="mo-item" key={it.id}>
              <div className="mo-item-num">{String(i + 1).padStart(2, '0')}</div>
              <div>
                <div className="mo-item-title">{it.title || '—'}</div>
                {it.desc && <div className="mo-item-body">{it.desc}</div>}
              </div>
              <div className="mo-item-qty">{toNum(it.qty)}</div>
              <div className="mo-item-rate">{formatMoney(it.rate, ccy)}</div>
              <div className="mo-item-amount">{formatMoney(amt, ccy)}</div>
            </div>
          );
        })}
      </div>

      <div className="mo-totals">
        <div className="mo-totals-row">
          <div className="label">Subtotal</div>
          <div className="val">{formatMoney(subtotal, ccy)}</div>
        </div>
        <div className="mo-totals-row">
          <div className="label">Tax ({toNum(meta.taxPercent)}%)</div>
          <div className="val">{formatMoney(taxAmount, ccy)}</div>
        </div>
        <div className="mo-totals-row grand">
          <div className="label">Total due</div>
          <div className="val">{formatMoney(total, ccy)}</div>
        </div>
      </div>

      <div className="mo-section-label">Beneficiary details</div>
      <div className="mo-panel">
        <div className="mo-panel-row">
          <div className="k">Name</div>
          <div className="v name">{payment.beneficiary || '—'}</div>
        </div>
        <div className="mo-panel-row">
          <div className="k">IBAN</div>
          <div className="v mono">{payment.iban || '—'}</div>
        </div>
        <div className="mo-panel-row">
          <div className="k">BIC</div>
          <div className="v mono">{payment.swift || '—'}</div>
        </div>
        {payment.correspondentBic && (
          <div className="mo-panel-row">
            <div className="k">Correspondent BIC</div>
            <div className="v mono">{payment.correspondentBic}</div>
          </div>
        )}
        <div className="mo-panel-row">
          <div className="k">Bank</div>
          <div className="v name">{payment.bank || '—'}</div>
        </div>
        {payment.bankAddress && (
          <div className="mo-panel-row">
            <div className="k">Bank address</div>
            <div className="v addr">{payment.bankAddress}</div>
          </div>
        )}
      </div>

      <div className="mo-footer">
        <div>{from.phone}{from.phone && from.email && ' · '}{from.email}</div>
        <div className="mono">Page 1 of 1</div>
      </div>
    </>
  );
}
