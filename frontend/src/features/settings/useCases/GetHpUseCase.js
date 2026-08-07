// Fetches a user's HP tracker state ({ enabled, maxHp, currentHp, tempHp }).
export default class GetHpUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(userId) {
    return this.repository.getHp(userId);
  }
}
