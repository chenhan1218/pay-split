# 核心資料模型與功能規格 (Firebase 風格)

本文件概述了 Split Payment App 的核心資料模型與功能需求，採用 Firebase (Firestore) NoSQL 文件資料庫架構設計，以支援長期擴展與開發。

## 1. Event (事件 / 群組)

代表一個獨立的分帳群組或活動（例如：「東京五日遊」、「週五聚餐」）。

### 功能需求 (Functional Requirements)
- 使用者可以建立一個新的 Event 並設定名稱。
- 使用者可以檢視並管理 Event 的詳細資訊。
- 使用者可以列出所有參與的 Events。
- 使用者可以將已結束的 Event 封存 (Archive)。

### 資料架構 (Firestore Document - `events/{eventId}`)

```typescript
interface Event {
  id: string; // Event 的唯一識別碼 (e.g., UUID)
  name: string; // Event 的顯示名稱 (e.g., "東京五日遊")
  status: 'active' | 'archived'; // 管理 Event 的狀態
  currency: string; // 預設幣別 (e.g., "TWD", "JPY")。為未來的多幣別支援預留。
  ownerId: string; // 建立此 Event 的 User ID (用於未來權限控管)
  
  // 參與者 (Participants) 嵌入於 Event 文件中。
  // 這樣可以在讀取 Event 詳情時，一次性讀取所有參與者資料，優化讀取效能。
  participants: {
    id: string; // 參與者在此 Event 內的唯一 ID
    name: string; // 參與者的顯示名稱 (e.g., "Alice", "Bob")
    avatarUrl?: string; // 選用：頭像 URL (用於 UI 美化)
    linkedUserId?: string; // 選用：若參與者之後註冊帳號，可連結至全域 User ID
  }[];

  createdAt: number; // 建立時間戳記 (milliseconds)
  updatedAt: number; // 最後更新時間戳記 (milliseconds)
}
```

### Firestore 文件範例 (`events/event_tokyo_001`)

```json
{
  "id": "event_tokyo_001",
  "name": "東京五日遊",
  "status": "active",
  "currency": "JPY",
  "createdAt": 1702272000000, // Dec 11, 2025 10:00:00 GMT+8
  "updatedAt": 1702272000000,
  "ownerId": "user_alice_123", 
  "participants": [
    {
      "id": "part_alice_001",
      "name": "Alice",
      "avatarUrl": "https://example.com/alice.jpg",
      "linkedUserId": "user_alice_123" 
    },
    {
      "id": "part_bob_002",
      "name": "Bob",
      "avatarUrl": null,
      "linkedUserId": null
    }
  ]
}
```

## 2. Expense (消費紀錄)

記錄在 Event 中發生的單筆交易。

### 功能需求 (Functional Requirements)
- 使用者可以在 Event 中新增一筆 Expense。
- Expense 必須包含標題 (Title)、總金額 (Total Amount) 與日期 (Date)。
- **支援多人付款 (Multi-Payer Support)**: 允許一位或多位參與者共同支付該筆消費，並指定各自支付的金額。
- **彈性的分帳邏輯 (Flexible Split Logic)**:
    - **平均分攤 (Split Equally)**: 將總金額平均分配給選定的受益人。
    - **指定金額分攤 (Split by Exact Amount)**: 手動指定每位受益人應負擔的金額。
- 使用者可以檢視 Event 內的所有 Expenses 列表。

### 資料架構 (Firestore Sub-collection Document - `events/{eventId}/expenses/{expenseId}`)

```typescript
interface Expense {
  id: string; // Expense 的唯一識別碼
  eventId: string; // 關聯至父層 Event 的 Foreign Key
  title: string; // 消費描述 (e.g., "居酒屋晚餐")
  amount: number; // 消費總金額
  date: number; // 消費發生的時間戳記 (milliseconds)
  category: string; // 選用：消費類別 (e.g., "Food", "Transportation")
  
  // 付款資訊：誰付了多少錢。
  // Key: Participant ID, Value: 該參與者支付的金額。
  // Example: { "part_alice_001": 1000, "part_bob_002": 500 }
  paidBy: { [participantId: string]: number; };
  
  // 分帳詳情：誰該負擔多少錢。
  // Key: Participant ID, Value: 該參與者應負擔的金額。
  // Example (1000元兩人平分): { "part_alice_001": 500, "part_bob_002": 500 }
  splitDetails: { [participantId: string]: number; };

  createdBy: string; // 建立此 Expense 的 User ID (用於未來權限控管)
  createdAt: number; // 記錄建立的時間戳記 (milliseconds)
}
```

### Firestore 文件範例 (`events/event_tokyo_001/expenses/exp_dinner_001`)

```json
{
  "id": "exp_dinner_001",
  "eventId": "event_tokyo_001",
  "title": "居酒屋晚餐",
  "amount": 1500, // 總金額
  "date": 1702299600000, // Dec 11, 2025 19:00:00 GMT+8
  "category": "Food",
  "paidBy": {
    "part_alice_001": 1500 // Alice 全額支付
  },
  "splitDetails": {
    "part_alice_001": 750, // Alice 應負擔 750
    "part_bob_002": 750    // Bob 應負擔 750
  },
  "createdBy": "user_alice_123",
  "createdAt": 1702299700000
}
```