# Tech Stack - Pay-Split

## 1. 前端框架 (Frontend Framework)
- **Next.js (App Router)**: 使用最新版 App Router 以獲得最佳的效能與開發體驗.
- **React**: 使用 React 18+ 的併發特性與 Hooks.
- **TypeScript**: 強制使用嚴格類型的 TypeScript 程式碼，確保資料流的穩定.

## 2. 樣式與 UI 元件 (Styling & UI Components)
- **Tailwind CSS 4**: 用於高效且響應式的樣式開發.
- **Radix UI / Shadcn UI**: 提供可存取、現代化且一致的 UI 組件庫.
- **Lucide React**: 作為標準圖標庫.

## 3. 資料處理與驗證 (Data & Validation)
- **Zod**: 用於 Schema 驗證與類型推斷.
- **React Hook Form**: 用於處理複雜的表單邏輯與驗證回饋.
- **date-fns**: 處理日期與時間格式化.

## 4. 後端服務 (Backend Services)
- **Firebase**:
  - **Firestore**: 作為 NoSQL 文件型資料庫，存儲活動與消費數據.
  - **Firebase Authentication**: 處理匿名登入或社交登入（視後續需求）.

## 5. 品質保證與開發工具 (QA & Tools)
- **Vitest**: 快速的單元與整合測試執行器.
- **React Testing Library**: 專注於使用者行為的組件測試.
- **Biome**: 統一的程式碼格式化 (Formatter) 與檢查 (Linter).
- **Husky & lint-staged**: 確保在 Commit 前通過 Lint 與格式檢查.
- **pnpm**: 採用 Workspace 模式管理 Monorepo 依賴.
