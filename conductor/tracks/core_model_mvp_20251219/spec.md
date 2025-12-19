# Track Spec: 完善核心資料模型與活動管理 MVP

## 1. 軌道目標 (Goals)
建立穩固的資料模型基礎，並實作最核心的活動管理功能，讓使用者能建立活動並查看詳情。

## 2. 核心功能 (Features)
- **資料模型定義 (Firestore)**：
  - `events`: 存儲活動名稱、幣別、參與者清單、建立時間等。
  - `expenses`: 存儲消費金額、付款人、分擔方式、歸屬活動 ID 等。
- **活動管理 (UI)**：
  - 活動列表頁：顯示所有參與的活動。
  - 建立活動：輸入名稱、選擇幣別與成員。
  - 活動詳情頁：顯示活動內的消費紀錄摘要。

## 3. 技術規格 (Technical Specs)
- **Service Layer**:
  - `event-service.ts`: 處理 Firestore 中的活動 CRUD 操作。
  - `expense-service.ts`: 處理消費紀錄的基礎讀取。
- **Schema**:
  - 使用 Zod 定義 `Event` 與 `Expense` 的類型，確保資料一致性。

## 4. 驗證標準 (Acceptance Criteria)
- 能夠成功在 Firestore 建立活動文件。
- 活動列表能即時反映新建立的活動。
- 代碼測試覆蓋率需符合工作流程要求 (>80%)。
