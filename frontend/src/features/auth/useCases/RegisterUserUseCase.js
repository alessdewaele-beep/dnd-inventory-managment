import { HTTPError } from "@/shared/lib/client/errors";

export default class RegisterUserUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(user) {
    if (!user.username || !user.password) {
      throw new Error("Please fill in all fields!");
    }
    if (user.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    try {
      return await this.repository.registerUser(user);
    } catch (err) {
      if (err instanceof HTTPError) {
        throw new Error(err.body?.error || "Registration failed");
      }
      throw err;
    }
  }
}
