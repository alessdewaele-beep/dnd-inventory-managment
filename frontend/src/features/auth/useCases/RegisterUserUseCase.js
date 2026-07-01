import { HTTPError } from "@/shared/lib/client/errors";

export default class RegisterUserUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(user) {
    if (!user.username || !user.password) {
      throw new Error("Vul alle velden in!");
    }
    if (user.password.length < 8) {
      throw new Error("Wachtwoord moet minstens 8 tekens zijn");
    }

    try {
      return await this.repository.registerUser(user);
    } catch (err) {
      if (err instanceof HTTPError) {
        throw new Error(err.body?.error || "Registreren mislukt");
      }
      throw err;
    }
  }
}
