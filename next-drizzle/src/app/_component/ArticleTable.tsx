import { Article, User } from '@/db/schema/schema';
import { deleteArticleById } from '../_action/deleteArticleById';
import DeleteArticleButton from './DeleteArticleButton';

type ArticleTableType = {
  articles: (Article & { author?: User })[];
};

// 為何要把 server action 透過 props 傳遞？
// https://www.reddit.com/r/nextjs/comments/13ilupe/nextjs_134_error_invariant_static_generation/
async function ArticleTable({ articles }: ArticleTableType) {
  return (
    <div>
      <div className=" flex flex-row gap-4">
        <h2 className="text-3xl">Articles</h2>
      </div>
      <table className="w-full table-auto text-left">
        <thead>
          <tr>
            <th>Id</th>
            <th>Author Name</th>
            <th>Title</th>
            <th>Like</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id}>
              <td>{article.id}</td>
              <td>
                {article.author ? (
                  <p>{article.author.name}</p>
                ) : (
                  <p className="text-red-500 font-bold">Author Not Found</p>
                )}
              </td>
              <td>{article.title}</td>
              <td>{article.like}</td>
              <td>
                <DeleteArticleButton
                  deleteArticle={deleteArticleById}
                  id={article.id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ArticleTable;
