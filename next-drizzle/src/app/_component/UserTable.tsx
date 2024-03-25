import { User } from '@/db/schema/schema';
import { addRandomUser } from '../_action/addRandomUser';
import { deleteUserById } from '../_action/deleteUserById';
import AddRandomUserButtom from './AddRandomUserButton';
import DeleteUserButton from './DeleteUserButton';
import { addArticle } from '../_action/addArticle';
import AddArticle from './AddArticle';

type UserTableType = {
  users: User[];
};

// 為何要把 server action 透過 props 傳遞？
// https://www.reddit.com/r/nextjs/comments/13ilupe/nextjs_134_error_invariant_static_generation/
async function UserTable({ users }: UserTableType) {
  return (
    <div>
      <div className=" flex flex-row gap-4">
        <h2 className="text-3xl">Users</h2>
        <AddRandomUserButtom addRandomUser={addRandomUser} />
      </div>
      <table className="w-full table-auto text-left">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Gender</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.gender || 'unknow'}</td>
              <td>
                <DeleteUserButton deleteUser={deleteUserById} id={user.id} />
              </td>
              <td>
                <AddArticle addArticle={addArticle} user={user} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;
