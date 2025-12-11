# Pay-Split

一個簡單、公平且直覺的 Web 應用程式，專為解決團體分帳與共享消費管理而設計。Pay-Split 採用現代化 Web 技術構建，旨在消除多人付款時的尷尬與複雜計算，確保每個人都能公平分擔費用。

## 功能特色 (規劃中)

- **活動制消費追蹤 (Event-based Expense Tracking)**: 建立專屬活動（例如：「東京五日遊」、「週五聚餐」），並在其中記錄所有相關花費。
- **支援多人付款 (Multi-Payer Support)**: 輕鬆記錄誰付了錢、付了多少，支援一人先墊或多人合資。
- **彈性的分帳邏輯 (Flexible Split Logic)**: 支援平均分攤、指定金額分攤等多種模式。
- **即時更新 (Real-time Updates)**: 所有的變更與餘額計算皆即時同步。
- **友善的使用者介面 (User-friendly Interface)**: 優先考量行動裝置體驗。

## 快速開始 (本地開發指南)

若要在您的本機環境執行 Pay-Split，請依照以下步驟操作：

### 前置需求

- Node.js (v18 或更高版本)
- npm (或是您習慣的套件管理器)

### 安裝步驟

1.  **複製專案 (Clone)**:
    ```bash
    git clone https://github.com/YOUR_GITHUB_USERNAME/pay-split.git
    cd pay-split
    ```
2.  **安裝根目錄依賴 (Root Dependencies)**:
    這將會安裝 `husky`, `lint-staged`, `prettier` 等專案管理工具。
    ```bash
    npm install
    ```
3.  **安裝 Web 專案依賴**:
    進入 `web` 目錄並安裝應用程式所需的套件。
    ```bash
    cd web
    npm install
    ```

### 啟動開發伺服器

執行以下指令以啟動 Next.js 開發環境：

```bash
cd web
npm run dev
```

接著在瀏覽器中開啟 [http://localhost:3000](http://localhost:3000) 即可看到畫面。

### 執行測試

若要執行 Web 專案的單元測試：

```bash
cd web
npm run test
```

### 程式碼格式化與檢查

本專案使用 Prettier 與 ESLint 來維護程式碼品質，並透過 Husky 在 commit 前自動檢查。您也可以手動執行：

- **格式化所有檔案**:
  ```bash
  npx prettier --write .
  ```
- **檢查 Web 專案代碼**:
  ```bash
  cd web
  npm run lint
  ```

## 專案文件 (Documentation)

關於詳細的功能規格、架構設計與當前的開發計畫，請參閱 `docs/` 目錄：

- [**專案索引 (Project Index)**](docs/INDEX.md)
- [**當前開發計畫 (Active Plan)**](docs/plans/active.md)
- [**核心資料模型規格 (Core Data Model Specs)**](docs/specs/core_data_model.md)
