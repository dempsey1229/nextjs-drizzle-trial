'use server';

import { faker } from '@faker-js/faker';
import dbInstance from '@/db/drizzleInstance';
import { users } from '@/db/schema/schema';
import { revalidatePath } from 'next/cache';

export async function addRandomUser() {
  await dbInstance.insert(users).values({
    name: faker.person.firstName(),
    gender: faker.helpers.arrayElement(['male', 'female', null]),
  });
  revalidatePath('/');
}
