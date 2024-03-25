import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    gender: text('gender', { enum: ['male', 'female'] }),

    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (users) => {
    return {
      nameIndex: uniqueIndex('name_idx').on(users.name),
    };
  }
);

// Schema for inserting a user - can be used to validate API requests
const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;

// Schema for selecting a user - can be used to validate API responses
const selectUserSchema = createSelectSchema(users);
export type User = z.infer<typeof selectUserSchema>;

export const articles = pgTable('articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content').notNull(),
  like: integer('like').default(0),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),

  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
const insertArticleSchema = createInsertSchema(articles);
export type InsertArticle = z.infer<typeof insertArticleSchema>;

const selectArticleSchema = createSelectSchema(articles);
export type Article = z.infer<typeof selectArticleSchema>;

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
