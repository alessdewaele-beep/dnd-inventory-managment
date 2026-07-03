// Updates the user's own username and/or backstory. Returns { user, token };
// token is only present when the username actually changed.
export default class UpdateProfileUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(data) {
    return this.repository.updateProfile(data);
  }
}
