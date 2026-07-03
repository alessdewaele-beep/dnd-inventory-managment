import { Roles } from "@/entities/user/Roles";

class User {
  constructor(username, password, id = null) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.role = Roles.PLAYER;
  }

  setRole(role) {
    this.role = role;
  }
}

export default User;
