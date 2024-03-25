'use client';

type CreateRandomUserButtomType = {
  addRandomUser: () => void;
};
function AddRandomUserButtom({ addRandomUser }: CreateRandomUserButtomType) {
  return (
    <button
      className="bg-green-400 p-1 rounded border-2 border-transparent hover:border-black"
      onClick={() => addRandomUser()}
    >
      Add Random User
    </button>
  );
}

export default AddRandomUserButtom;
