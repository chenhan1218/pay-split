# Product Backlog

這裡存放尚未排入當前 Sprint 的想法。

## Features
- **結算 (Settlement)**: 計算「誰該給誰多少錢」，並建議最短轉帳路徑。
- **多幣別 (Multi-currency)**: 支援輸入不同幣別，自動換算匯率。
- **使用者帳號**: 雲端同步與權限管理。
- **UI 重構 (Shadcn UI)**: 引入 Shadcn UI，全面翻新介面，確保 Mobile-first 體驗與現代審美。
- **Firebase Migration**: 將目前的 LocalStorage Data Layer 替換為真正的 Firebase SDK，實現資料雲端同步。

## Technical Debt / Infrastructure
- **Vercel Deployment**: 設定 Next.js 專案於 Vercel 自動部署，包含 Preview Deployment。
