'use server';

import dbInstance from '@/db/drizzleInstance';
import { users } from '@/db/schema/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function deleteUserById(id: string) {
  await dbInstance.delete(users).where(eq(users.id, id));
  revalidatePath('/');
}
