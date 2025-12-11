# Active Sprint Plan

## Phase 2: Refactor & Modernization (Current Focus)
目標：基於新的架構決策 (Shadcn UI + Firebase-ready Schema) 重建專案。

### Status: 🚧 重構進行中 (Re-initialization)
我們已決定捨棄舊的 MVP 代碼，採用全新的技術堆疊重新初始化。

- [x] **Archive**: 將舊專案 `web/` 移動至 `web-legacy/` (備份參考用)。
- [ ] **Init**: 初始化新的 Next.js 專案 (`web/`)。
    - [ ] 執行 `create-next-app`
    - [ ] 設定 Tailwind CSS
    - [ ] 初始化 Shadcn UI (`npx shadcn-ui@latest init`)
- [ ] **Setup**: 安裝並設定 Firebase SDK。
- [ ] **Migration**: 依照 `docs/specs/core_data_model.md` 逐步搬遷/重寫功能。