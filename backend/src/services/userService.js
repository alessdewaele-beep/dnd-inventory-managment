const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userRepository = require("../repositories/userRepository");
const campaignRepository = require("../repositories/campaignRepository");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config");
const bcrypt = require("bcrypt");
const User = require("../models/User");

class UserService {
  async register(user) {
    if (!user.username || !user.password || !user.campaignId) {
      throw new Error("Alle velden zijn verplicht");
    }
    try {
      console.log(user);
      return await userRepository.createUser(user);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        throw new Error("Username bestaat al");
      }
      throw err;
    }
  }

  async login(username, password) {
    const user = await userRepository.findByUsername(username);
    if (!user) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    return { token, id: user.id, username: user.username, role: user.role };
  }

  // Volledige lijst voor het admin-scherm: id, username, role, campaign_id,
  // created_at. Nooit password_hash (repository selecteert die niet).
  async getAll() {
    return userRepository.getAll();
  }

  async deleteUser(id) {
    return userRepository.deleteById(id);
  }

  // Beheert rol en campagne-koppeling van een gebruiker (admin).
  async updateUser(id, data) {
    const allowed = {};
    if (data.role !== undefined) allowed.role = data.role;
    if (data.campaign_id !== undefined) allowed.campaign_id = data.campaign_id;
    const updated = await userRepository.update(id, allowed);
    if (!updated) return null;
    return {
      id: updated.id,
      username: updated.username,
      role: updated.role,
      campaign_id: updated.campaign_id,
    };
  }

  // Genereert een tijdelijk wachtwoord, slaat het (gehasht) op en geeft het
  // eenmalig terug zodat de admin het aan de speler kan doorgeven.
  async resetPassword(id) {
    const user = await userRepository.findById(id);
    if (!user) return null;
    const tempPassword = crypto.randomBytes(6).toString("hex"); // 12 tekens
    await userRepository.updatePassword(id, tempPassword);
    return { id: user.id, username: user.username, password: tempPassword };
  }

  // Mag `requester` de spelers van deze campaign opvragen?
  // Toegestaan voor de Admin en de DM van die campaign.
  async canViewCampaignPlayers(requester, campaignId) {
    if (requester.role === "Admin") return true;
    const campaign = await campaignRepository.getById(campaignId);
    return !!campaign && campaign.dungeon_master === requester.id;
  }

  async getPlayersByCampaign(campaignId) {
    const rows = await userRepository.getByCampaignId(campaignId);
    return rows.map((user) => new User(user.username, user.id, user.role));
  }
}

module.exports = UserService;
