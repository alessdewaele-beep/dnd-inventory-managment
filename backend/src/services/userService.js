const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const campaignRepository = require("../repositories/campaignRepository");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config");
const bcrypt = require("bcrypt");
const User = require("../models/User");

class UserService {
  async register(user) {
    if (!user.username || !user.password || !user.campaignId) {
      throw new Error("Please fill in a username, password and campaign.");
    }
    try {
      return await userRepository.createUser(user);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        throw new Error("That username is already taken. Please choose another.");
      }
      throw err;
    }
  }

  async login(username, password) {
    // Deliberately the same message whether the username is unknown or the
    // password is wrong, so we don't reveal which usernames exist.
    const user = await userRepository.findByUsername(username);
    if (!user) throw new Error("Incorrect username or password.");

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new Error("Incorrect username or password.");

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    return { token, id: user.id, username: user.username, role: user.role };
  }

  // Builds the public profile object (without password_hash) and resolves
  // the campaign name based on campaign_id.
  async #toProfile(userRow) {
    let campaignName = null;
    if (userRow.campaign_id) {
      const campaign = await campaignRepository.getById(userRow.campaign_id);
      campaignName = campaign ? campaign.name : null;
    }
    return {
      id: userRow.id,
      username: userRow.username,
      role: userRow.role,
      campaign_id: userRow.campaign_id ?? null,
      campaign_name: campaignName,
      backstory: userRow.backstory ?? null,
    };
  }

  // Own profile of the logged-in user.
  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) return null;
    return this.#toProfile(user);
  }

  // Self-service update: only the own username and (for players) backstory.
  // On a username change, returns a new JWT so the token stays in sync with
  // the new username.
  async updateSelf(requester, data) {
    const current = await userRepository.findById(requester.id);
    if (!current) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    const updates = {};
    let usernameChanged = false;

    if (data.username !== undefined) {
      const username = String(data.username).trim();
      if (!username) {
        const err = new Error("Username may not be empty");
        err.status = 400;
        throw err;
      }
      if (username !== current.username) {
        updates.username = username;
        usernameChanged = true;
      }
    }

    // Backstory is only for players.
    if (data.backstory !== undefined) {
      if (current.role !== "Player") {
        const err = new Error("Only players have a backstory");
        err.status = 403;
        throw err;
      }
      updates.backstory = data.backstory === "" ? null : data.backstory;
    }

    let updated = current;
    if (Object.keys(updates).length > 0) {
      try {
        updated = await userRepository.update(requester.id, updates);
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          const dup = new Error("This username is already in use");
          dup.status = 409;
          throw dup;
        }
        throw err;
      }
    }

    const profile = await this.#toProfile(updated);

    // New token only when the username actually changed.
    let token;
    if (usernameChanged) {
      token = jwt.sign(
        { id: updated.id, username: updated.username, role: updated.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
    }

    return { user: profile, token };
  }

  // Change password with verification of the current password.
  async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      const err = new Error("Current and new password are required");
      err.status = 400;
      throw err;
    }
    if (String(newPassword).length < 6) {
      const err = new Error("New password must be at least 6 characters");
      err.status = 400;
      throw err;
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      const err = new Error("Current password is incorrect");
      err.status = 400;
      throw err;
    }

    await userRepository.updatePassword(userId, newPassword);
    return true;
  }

  // Full list for the admin screen: id, username, role, campaign_id,
  // created_at. Never password_hash (the repository does not select it).
  async getAll() {
    return userRepository.getAll();
  }

  async deleteUser(id) {
    return userRepository.deleteById(id);
  }

  // Manages a user's role and campaign assignment (admin).
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

  // May `requester` request the players of this campaign?
  // Allowed for the Admin and the DM of that campaign.
  async canViewCampaignPlayers(requester, campaignId) {
    if (requester.role === "Admin") return true;
    const campaign = await campaignRepository.getById(campaignId);
    return !!campaign && campaign.dungeon_master === requester.id;
  }

  async getPlayersByCampaign(campaignId) {
    const rows = await userRepository.getByCampaignId(campaignId);
    return rows.map((user) => new User(user.username, user.id, user.role));
  }

  // All players from the campaign(s) that `dm` leads, excluding the DM themselves.
  // Used by the DM screen to view inventories and send items.
  async getMyCampaignPlayers(dm) {
    const campaigns = await campaignRepository.getByDungeonMaster(dm.id);
    const seen = new Map();
    for (const campaign of campaigns) {
      const rows = await userRepository.getByCampaignId(campaign.id);
      for (const user of rows) {
        if (user.id !== dm.id) seen.set(user.id, user);
      }
    }
    return [...seen.values()].map(
      (user) => new User(user.username, user.id, user.role)
    );
  }
}

module.exports = UserService;
