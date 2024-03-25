import { revalidatePath } from 'next/cache';
import dbInstance from '@/db/drizzleInstance';
import UserTable from './_component/UserTable';
import ArticleTable from './_component/ArticleTable';

async function getUsers() {
  const users = await dbInstance.query.users.findMany();
  revalidatePath('/');
  return users;
}

async function getArticles() {
  const articles = await dbInstance.query.articles.findMany({
    with: { author: true },
  });
  revalidatePath('/');
  return articles;
}

export default async function Home() {
  const users = await getUsers();
  const articles = await getArticles();
  return (
    <div className="container m-auto bg-slate-400 rounded-xl p-4 h-screen">
      <UserTable users={users} />
      <ArticleTable articles={articles} />
    </div>
  );
}
