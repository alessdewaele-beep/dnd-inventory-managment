// Saves a user's full HP tracker state ({ enabled, maxHp, currentHp, tempHp }).
export default class UpdateHpUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(userId, hp) {
    return this.repository.updateHp(userId, hp);
  }
}
