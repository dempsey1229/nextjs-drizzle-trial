# nextjs-drizzle-trial

## 專案背景

筆者為了研究 [Drizzle](https://orm.drizzle.team/) 決定寫一個在 Nextjs 的小專案做測試，並且希望有個前端的小操作界面。
因為不想寫 API 所以使用 Nextjs 的 [Server Action](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) 來開發，也就是說此專案並沒有 `axios` `@tanstack/react-query` 等套件。

## 簡略使用說明

1. 用 `yarn` 安裝套件
2. `yarn dev` 啟動專案，會跑在 localhost:3000
3. `yarn drizzle-kit studio` 可以打開 Drizzle 提供的資料庫。點此[連結](https://local.drizzle.studio/)
4. 在 `db/drizzleInstance.ts` `db/migrationRunner.ts` 內有設定資料庫的連結。筆者是使用 [neon](https://neon.tech/) 這個 serverless db。在 `.env.local` 放入
   ```
   DRIZZLE_DATABASE_URL_ON_NEON={{connection_string}}
   ```
   後就能連結到資料庫。
5. 需要用其他資料庫的話請自己參照文件，並修改上述兩個檔案。

- `yarn drizzle-kit generate:pg`: 透過 schema 自動產生 migration file
- `yarn drizzle-kit push:pg` 產生 migration file 後將 neon 上的資料庫 migrate

## 結論

筆者認為使用 Drizzle 能帶來以下好處並解決公司原有問題：

1. 使後端開發流程更有規範、簡化。
   目前公司後端的開發依賴在 `knex` 以及自建的 `commonModel` 上，`commonModel` 定義了常用的 CRUD method。
   使用 Drizzle 後後端開發流程變成全部可以在 Drizzle 完成，比起以往要讀 `knex` 的文件，看懂自訂的 `commonModel`。現在只需要看完 Drizzle Doc 就能涵蓋資料庫設計(shema), migration, query method 等內容。
   除了降低了自定義的 model 可能有錯誤的潛在風險，也大大降低新人的學習門檻。

2. 自動化管理 migration
   只要寫(更改)好 schema, 剩下的 migration 由程式自動維護。

3. typesafe, auto-complete。
   省去以往要自己定義 table basic model 的功夫。並且支援 typescript 降低開發錯誤風險。

4. 支援 zod。
   不管要做 parse 還是 transform， zod 都是一個很好的中間工具。
   如果在前後端不分離的情況下，甚至可以不用自己寫 zod。
   https://orm.drizzle.team/docs/zod

5. 更明確的 foreign key 設計，以及支援軟刪除的實作。
   以往開發公司是以軟刪除為主，並且不在資料庫上做 foreign key 的 constraint (等於是程式實作自己維護)，而維護的方式大部分是以 on delete, set null 為主。
   Drizzle 則是會強制我們設計，沒特別設定的話就是 restrict。
   這樣子的好處是可以從 schema 就知道刪除時會發生什麼事情，例如在 `articles`, `userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' })`。我們可以得知刪除一個 user 時，他底下文章相關的 author (user.id) 會變成 null。

   支援軟刪除的部分會在底下章節說明。

## Drizzle 使用以及技術說明

### Model Type

寫好 schema 透過 Drizzle 對 zod 的套件支援 (drizzle-zod)。
可以直接產生 insertSchema 和 selectSchema。
insertSchema 是用作 insert 資料時判別使用，他會透過 schema 判別哪些是必填欄位哪些是選填。
selectSchema 則是透過 query 後得到的完整資料。

```typescript
// Schema for inserting a user - can be used to validate API requests
const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;

// type InsertUser = {
//     name: string;                                        // User name 必填
//     id?: string | undefined;
//     gender?: "male" | "female" | null | undefined;
//     deletedAt?: Date | null | undefined;
//     createdAt?: Date | null | undefined;
//     updatedAt?: Date | ... 1 more ... | undefined;
// }

// Schema for selecting a user - can be used to validate API responses
const selectUserSchema = createSelectSchema(users);
export type User = z.infer<typeof selectUserSchema>;

// type User = {
//     id: string;
//     name: string;
//     gender: "male" | "female" | null;
//     deletedAt: Date | null;
//     createdAt: Date | null;
//     updatedAt: Date | null;
// }
```

### Reference

除了寫 foreign key 之外，在 ORM 我們需要額外寫 [**relation**](https://orm.drizzle.team/docs/rqb#declaring-relations)，才能在 Query 時透過 [**with**](https://orm.drizzle.team/docs/rqb#include-relations) 去帶出資料。

```typescript
/* 一個 User 可以對應（擁有）到多個 Articles */
export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
}));
/* 一個 Article 可以對應（屬於）到一個 User */
export const articlesRelations = relations(articles, ({ one }) => ({
  author: one(users, {
    fields: [articles.userId],
    references: [users.id],
  }),
}));
```

### Include relations
[文件參考](https://orm.drizzle.team/docs/rqb#include-relations)
![image](https://github.com/dempsey1229/nextjs-drizzle-trial/assets/134914196/b08bed9a-a8f9-4bb7-8bd0-238d6f477e3e)
支援 typescript 所以會補字。

```typescript
// 可以搭配 where 使用
await db.query.posts.findMany({
  where: (posts, { eq }) => eq(posts.id, 1),
  with: {
    comments: {
      where: (comments, { lt }) => lt(comments.createdAt, new Date()),
    },
  },
});
```

### 軟刪除

要實現軟刪除我們可以透過以下幾個步驟。

1. schema 設計時要有 `deletedAt`

```typescript
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
```

2. 刪除相關的動作變成改 `deletedAt`

```typescript
await dbInstance
  .update(users)
  .set({ deletedAt: new Date() })
  .where(eq(users.id, id));
```

3. Query 時加入 `deletedAt` 相關的搜尋條件

```typescript
const users = await dbInstance.query.users.findMany({
  where: (users) => isNull(users.deletedAt),
});
```

但是我們會發現刪除一位 user(Kaleb) 後，article 仍然出現 author 是 Kaleb 的資料。
![image](https://github.com/dempsey1229/nextjs-drizzle-trial/assets/134914196/33855f19-f573-406a-8966-367f0923b0ba)

```typescript
const articlesData = await dbInstance.query.articles.findMany({
  with: { author: true },
});
```

這正是因為軟刪除造成該筆 article 的 userId(author) 仍然有值。
我們可以透過後端或前端程式碼去處理資料

```typescript
const articlesDataRemoveDeletedAuthor = articlesData.map((article) => ({
  ...article,
  author: article.author?.deletedAt ? null : article.author,
}));
```
![image](https://github.com/dempsey1229/nextjs-drizzle-trial/assets/134914196/10b41d73-51a9-432d-8766-f071fb569fcf)
現在 `uuid: afae20d3-33cf-4119-af82-1198dcb0f33b` 的作者變成 not found 了。

#### 延伸問題

那如果我們要做 pagination 等情境，希望 query article 並且 author 已經刪除的 article 不要 query 出來怎麼辦呢？

```typescript
const results = await dbInstance
  .select()
  .from(articles)
  .innerJoin(users, eq(articles.userId, users.id))
  .where(isNull(users.deletedAt));
/*  
   {
      articles: {
        id: '5cbcb513-dc6b-4cb3-96b5-ff6496fad08a',
        title: '',
        content: '',
        like: 0,
        userId: 'a1b87ff6-9640-4f4c-9920-aa8ca283c094',
        deletedAt: null,
        createdAt: 2024-03-25T10:22:40.932Z,
        updatedAt: 2024-03-25T10:22:40.932Z
      },
      users: {
        id: 'a1b87ff6-9640-4f4c-9920-aa8ca283c094',
        name: 'Crawford',
        gender: 'female',
        deletedAt: null,
        createdAt: 2024-03-25T10:21:02.210Z,
        updatedAt: 2024-03-25T10:21:02.210Z
      }
    },
 */
// 資料處理
const articlesHaveAuthor = results.map((result) => ({
  ...result.articles,
  author: result.users,
}));
```
![image](https://github.com/dempsey1229/nextjs-drizzle-trial/assets/134914196/49ee1e37-41b0-4517-b3e8-c7b0b8b67431)

### Pagination

如果做分頁功能時有需要帶入參數，可以參考 [prepared (placeholder)](https://orm.drizzle.team/docs/rqb#prepared-statements) 的文件說明。

## Bug 排解

[此篇文章](https://www.reddit.com/r/nextjs/comments/13ilupe/nextjs_134_error_invariant_static_generation/)是有關 server component 和 server action 的寫法。

總之文章是說**不要從 client component import server action 去用**
應該要**從 server component import server action 然後透過 props 傳給底下的 client component**
不然 server action 裏面呼叫 revalidatePath 會出錯。
