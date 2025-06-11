## 命名規則

變數名(Variable Names):

- 只使用英文小寫字元、下底線、數字
- 蛇形命名法 snake_case
- 名字要以字母開頭，不能以下底線結尾
- 保證名字長度不超過 20 個字節
- 避免使用縮寫詞

保留字(Reserved Words):

- 保留字使用全大寫例如: `SELECT`, `WHERE` 或 `AS`

---

## 資料表名稱(Table Names)

- 英文單數詞(Singular)
- 全英文小寫(以下底線\_分隔字詞)

## 關聯表名稱(Relationship Table Names)

這裡指的是多對多(n:m 或 many-to-many)的關聯表名稱命名風格。

關聯表名稱為兩個資料表的名稱的複數形式，並且以這兩個資料表的名稱按字母順序排列，並且以 `_` 分隔。

盡量避免連接兩個表的名字作為關聯表（relationship table）的名字。與其使用 cars_mechanics 做表名不如使用 services。

例如: `newspaper`與`reader`兩個資料表，一種報紙會有很多讀者，一個讀者也可以有很多報紙。 雖然關聯資料表可以為`newspaper_reader`的命名，但使用`subscription`更好。

## 欄位名稱(Field Names)

- 全英文小寫，無空白與數字
- 選擇短名稱，不超過兩個單詞
- 主鍵(Primary key)使用 id
- 避免使用縮寫或簡稱

## 外鍵名稱(Foreign Key Names)

- 外鍵名稱應該是參考表的名稱加上\_id，例如 user_id 或 product_id

## 時間戳記或日期欄位(Timestamp / Date Column Names)

- 日期類型(Date-only)需要加上\_date 後綴字。例如 birth_date, report_date 等
- 日期加時間(Date+time)類型應該加上\_at 後綴字。例如 created_at, posted_at 等
- 時間戳記(Timestamps)應該加上\_at 後綴字，而且必須使用 UTC 時間。例如 created_at, updated_at 等。

## prisma Model命名

- 大駝峰命名法