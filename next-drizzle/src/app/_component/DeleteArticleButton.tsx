'use client';

type DeleteArticleButtonType = {
  deleteArticle: (id: string) => void;
  id: string;
};

function DeleteArticleButton({ deleteArticle, id }: DeleteArticleButtonType) {
  return (
    <button
      className="bg-red-400 p-1 rounded border-2 border-transparent hover:border-black"
      onClick={() => deleteArticle(id)}
    >
      Delete
    </button>
  );
}

export default DeleteArticleButton;
