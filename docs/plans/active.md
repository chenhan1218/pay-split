# Active Sprint Plan

## Phase 2: Refactor & Modernization (Current Focus)

目標：基於新的架構決策 (Shadcn UI + Firebase-ready Schema) 重建專案，並建立高品質的 CI/CD 流程。

### Status: 🚧 重構進行中 (Re-initialization)

我們已決定捨棄舊的 MVP 代碼，採用全新的技術堆疊重新初始化。

- [x] **Archive**: 將舊專案 `web/` 移動至 `web-legacy/` (備份參考用)。
- [x] **Establish Root-level Tooling (Monorepo)**: 統一管理專案開發工具。
  - [x] 在專案根目錄 `/` 初始化 `package.json`。
  - [x] 安裝 `husky`, `lint-staged`, `prettier`, `prettier-plugin-tailwindcss` 至根目錄。
  - [x] 設定根目錄的 `.husky/pre-commit` hook (執行 `lint-staged`)。
  - [x] 設定根目錄的 `.lintstagedrc` (處理 `web/` 中的檔案)。
  - [x] 設定根目錄的 `.prettierrc` (通用格式化規則)。
- [x] **Init**: 初始化新的 Next.js 專案 (`web/`)。
  - [x] 執行 `create-next-app` (App Router).
  - [x] 設定 Tailwind CSS.
  - [x] 初始化 Shadcn UI (`npx shadcn-ui@latest init`).
  - [x] **Setup Testing**: 安裝並設定 Vitest 與 React Testing Library (針對 `web/`)。
- [x] **CI/CD**: 建立 GitHub Actions 自動化流程。
  - [x] 建立 `.github/workflows/ci.yml`: 包含 Linting, Type Check, Testing (利用 Root Tooling)。
  - [x] 建立 `.github/workflows/deploy.yml`: 整合 Vercel CLI 進行部署 (需設定 Secrets)。
- [x] **Setup**: 安裝並設定 Firebase SDK。
  - [x] 安裝 `firebase` 與 `zod` (用於環境變數驗證)。
  - [x] 建立 `web/src/config/env.ts` 進行 Type-safe Env 驗證。
  - [x] 建立 `web/src/lib/firebase.ts` 初始化 Firebase App。
  - [x] 建立 `web/.env.example` 範本。
- [x] **Document Environment Variables**: 更新 `web/README.md`，加入 Firebase 環境變數設定說明。
- [ ] **Refine Core Data Model**: 更新 `docs/specs/core_data_model.md` 以支援更靈活的交易紀錄。
  - [ ] 將 `Expense` 擴充為 `Transaction` (支援 `type: 'EXPENSE' | 'TRANSFER'`)。
  - [ ] 明確定義基本欄位：`date` (交易時間), `note` (備註/描述)。
  - [ ] 設計 `TRANSFER` (轉帳) 專用的欄位 (fromUser, toUser)。
- [ ] **Migration**: 依照 `docs/specs/core_data_model.md` 逐步搬遷/重寫功能。
