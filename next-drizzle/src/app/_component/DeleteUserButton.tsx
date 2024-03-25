'use client';

type DeleteUserButtonType = {
  deleteUser: (id: string) => void;
  id: string;
};

function DeleteUserButton({ deleteUser, id }: DeleteUserButtonType) {
  return (
    <button
      className="bg-red-400 p-1 rounded border-2 border-transparent hover:border-black"
      onClick={() => deleteUser(id)}
    >
      Delete
    </button>
  );
}

export default DeleteUserButton;
