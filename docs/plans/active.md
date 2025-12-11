# Active Sprint Plan

## Phase 2: Refactor & Modernization (Current Focus)
目標：基於新的架構決策 (Shadcn UI + Firebase-ready Schema) 重建專案，並建立高品質的 CI/CD 流程。

### Status: 🚧 重構進行中 (Re-initialization)
我們已決定捨棄舊的 MVP 代碼，採用全新的技術堆疊重新初始化。

- [x] **Archive**: 將舊專案 `web/` 移動至 `web-legacy/` (備份參考用)。
- [ ] **Establish Root-level Tooling (Monorepo)**: 統一管理專案開發工具。
    - [ ] 在專案根目錄 `/` 初始化 `package.json`。
    - [ ] 安裝 `husky`, `lint-staged`, `prettier`, `prettier-plugin-tailwindcss` 至根目錄。
    - [ ] 設定根目錄的 `.husky/pre-commit` hook (執行 `lint-staged`)。
    - [ ] 設定根目錄的 `.lintstagedrc` (處理 `web/` 中的檔案)。
    - [ ] 設定根目錄的 `.prettierrc` (通用格式化規則)。
- [ ] **Init**: 初始化新的 Next.js 專案 (`web/`)。
    - [ ] 執行 `create-next-app` (App Router).
    - [ ] 設定 Tailwind CSS.
    - [ ] 初始化 Shadcn UI (`npx shadcn-ui@latest init`).
    - [ ] **Setup Testing**: 安裝並設定 Vitest 與 React Testing Library (針對 `web/`)。
- [ ] **CI/CD**: 建立 GitHub Actions 自動化流程。
    - [ ] 建立 `.github/workflows/ci.yml`: 包含 Linting, Type Check, Testing (利用 Root Tooling)。
    - [ ] 建立 `.github/workflows/deploy.yml`: 整合 Vercel CLI 進行部署 (需設定 Secrets)。
- [ ] **Setup**: 安裝並設定 Firebase SDK。
- [ ] **Refine Core Data Model**: 更新 `docs/specs/core_data_model.md` 以支援更靈活的交易紀錄。
    - [ ] 將 `Expense` 擴充為 `Transaction` (支援 `type: 'EXPENSE' | 'TRANSFER'`)。
    - [ ] 明確定義基本欄位：`date` (交易時間), `note` (備註/描述)。
    - [ ] 設計 `TRANSFER` (轉帳) 專用的欄位 (fromUser, toUser)。
- [ ] **Migration**: 依照 `docs/specs/core_data_model.md` 逐步搬遷/重寫功能。