import { revalidatePath } from 'next/cache';
import dbInstance from '@/db/drizzleInstance';
import UserTable from './_component/UserTable';
import ArticleTable from './_component/ArticleTable';
import { eq, isNull } from 'drizzle-orm';
import { articles, users } from '@/db/schema/schema';

async function getUsers() {
  const usersData = await dbInstance.query.users.findMany({
    where: (users) => isNull(users.deletedAt),
  });
  revalidatePath('/');
  return usersData;
}

async function getArticles() {
  const articlesData = await dbInstance.query.articles.findMany({
    with: { author: true },
  });
  const articlesDataRemoveDeletedAuthor = articlesData.map((article) => ({
    ...article,
    author: article.author?.deletedAt ? null : article.author,
  }));

  revalidatePath('/');

  return articlesDataRemoveDeletedAuthor;
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
