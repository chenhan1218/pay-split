# Active Sprint Plan

## Phase 2: Refactor & Modernization (Current Focus)

目標：基於新的架構決策 (Shadcn UI + Firebase-ready Schema) 重建專案，並建立高品質的 CI/CD 流程。

### Status: 🚧 重構進行中 (Re-initialization)

我們已決定捨棄舊的 MVP 代碼，採用全新的技術堆疊重新初始化。

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
- [x] **Refine Core Data Model**: 更新 `docs/specs/core_data_model.md` 以支援更靈活的交易紀錄。
  - [x] 將 `Expense` 擴充為 `Transaction` (支援 `type: 'EXPENSE' | 'TRANSFER'`)。
  - [x] 明確定義基本欄位：`date` (交易時間), `note` (備註/描述)。
  - [x] 設計 `TRANSFER` (轉帳) 專用的欄位 (fromUser, toUser)。
- [x] **Feature Implementation: Core Services**: 依照新的資料模型實作核心功能。
  - [x] **Data Schemas**: 使用 Zod 定義 `Event` 與 `Transaction` 的驗證規則與型別。
  - [x] **Event Service**: 實作 `Event` 的 CRUD 邏輯 (Firebase)。
  - [x] **Transaction Service**: 實作 `Transaction` (Expense/Transfer) 的 CRUD 邏輯 (Firebase)。
  - [x] **Service Testing**: 為上述服務撰寫單元測試 (Vitest)。

## Phase 3: Core UI Implementation (Current Focus)

目標：基於 Shadcn UI 實作使用者介面，並串接 Phase 2 完成的後端 Services。

### Status: ✅ UI 實作完成

- [x] **Layout & Navigation (佈局與導航)**
  - [x] 實作全域 Layout (Navbar, 手機版響應式容器)。
  - [x] 設定 Shadcn UI Theme 與全域樣式。
- [x] **Feature: Events (活動群組)**
  - [x] **Event List**: 在首頁顯示參與的所有活動。
  - [x] **Create Event**: 建立新活動的對話框或頁面。
  - [x] **Event Detail**: 單一活動的儀表板 (Dashboard)。
- [x] **Feature: Transactions (交易紀錄)**
  - [x] **Transaction List**: 在活動內顯示消費/轉帳列表。
  - [x] **Add Transaction**: 新增消費或轉帳的表單 (整合 `react-hook-form` + `zod`)。
