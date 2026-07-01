import User from "@/entities/user/User";
import { Roles } from "@/entities/user/Roles";

export default class GetAllUsersUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute() {
    const usersRaw = await this.repository.getAllUsers();
    const users = [];
    usersRaw.forEach((user) => {
      const newUser = new User(user.username, null, user.role);
      if (user.role === Roles.DM) newUser.setRole("dm");
      users.push(newUser);
    });
    return users;
  }
}
