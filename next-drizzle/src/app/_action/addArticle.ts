'use server';

import dbInstance from '@/db/drizzleInstance';
import { articles } from '@/db/schema/schema';
import { revalidatePath } from 'next/cache';

export type addArticleType = {
  title: string;
  content: string;
  userId: string;
};
export async function addArticle({ title, content, userId }: addArticleType) {
  await dbInstance.insert(articles).values({
    title,
    content,
    userId,
  });
  revalidatePath('/');
}
