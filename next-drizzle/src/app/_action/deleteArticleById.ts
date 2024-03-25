'use server';

import dbInstance from '@/db/drizzleInstance';
import { articles } from '@/db/schema/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function deleteArticleById(id: string) {
  await dbInstance.delete(articles).where(eq(articles.id, id));
  revalidatePath('/');
}
