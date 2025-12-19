# Track Plan: 完善核心資料模型與活動管理 MVP

## Phase 1: 基礎架構與資料模型
- [ ] Task: 定義 Event 與 Expense 的 Zod Schemas
  - Why: 確保資料庫讀寫的類型安全與驗證。
- [ ] Task: 實作 Event Service 的核心 CRUD
  - Why: 封裝與 Firestore 的互動邏輯。
  - Sub-task: 撰寫 Event Service 單元測試。
  - Sub-task: 實作 `createEvent`, `getEvent`, `listEvents`。
- [ ] Task: Conductor - User Manual Verification 'Phase 1: 基礎架構與資料模型' (Protocol in workflow.md)

## Phase 2: 活動管理 UI
- [ ] Task: 實作「建立活動」對話框 (CreateEventDialog)
  - Why: 提供使用者介面來新增活動。
- [ ] Task: 實作活動列表頁面 (EventsListPage)
  - Why: 展示所有進行中的活動。
- [ ] Task: 實作活動詳情基礎頁面
  - Why: 作為消費紀錄展示的入口。
- [ ] Task: Conductor - User Manual Verification 'Phase 2: 活動管理 UI' (Protocol in workflow.md)
