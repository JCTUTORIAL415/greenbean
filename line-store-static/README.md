# 訂單查詢與簽收（靜態應急版）

拳拳超市 大運河、熊熊愛買菜 東海店 兩間店的訂單查詢/現場簽收頁面，UI 沿用 [line-store-platform](../line-store-platform) 的 kiosk 樣式（`kiosk-*` class、色系、簽名板、數字鍵盤皆同款）。

**這是純靜態網頁（GitHub Pages），沒有後端資料庫。** 簽收紀錄存在瀏覽器的 `localStorage`，也就是「哪一台裝置簽的，紀錄就留在那台裝置」。建議：
- 固定用一台平板/手機當「取貨簽收站」給客人查詢+簽名
- 工作人員定期用後台（頁尾「店員後台」，需輸入密碼）匯出 CSV / JSON 備份，避免清瀏覽器快取或換裝置遺失資料

## 結構
- `quanquan-daxiaohe/` — 拳拳超市 大運河（店員密碼 `1234`）
- `xiongxiong-donghai/` — 熊熊愛買菜 東海店（店員密碼 `5678`）
- `assets/` — 共用 CSS/JS
- `build_data.py` — 從 Excel（`訂單匯入_*.xlsx`）重新產生各店 `data.js`

## 更新訂單資料
把新的 Excel 檔放到 `~/Downloads/`，改 `build_data.py` 裡的檔名，重新執行：
```
python3 build_data.py
```
會覆蓋 `*/data.js`，記得重新 commit + push。

## 部署
GitHub Pages，靜態即可，無需 build step。
