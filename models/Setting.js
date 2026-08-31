const { db } = require('./User');

class Setting {
  static async getSettings(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM settings WHERE user_id = ? ORDER BY display_order ASC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }

  static async getSetting(userId, key) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM settings WHERE user_id = ? AND key = ?`,
        [userId, key],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });
  }

  static async setSetting(userId, key, value, icon = null, type = 'text', displayOrder = 0) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO settings (user_id, key, value, icon, type, display_order) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id, key) DO UPDATE SET 
           value = excluded.value,
           icon = excluded.icon,
           type = excluded.type,
           display_order = excluded.display_order`,
        [userId, key, value, icon, type, displayOrder],
        function(err) {
          if (err) reject(err);
          resolve(this.changes);
        }
      );
    });
  }

  static async deleteSetting(userId, key) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM settings WHERE user_id = ? AND key = ?`,
        [userId, key],
        function(err) {
          if (err) reject(err);
          resolve(this.changes);
        }
      );
    });
  }

  static async getBioMeta(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM bio_meta WHERE user_id = ?`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });
  }

  static async updateBioMeta(userId, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE bio_meta SET ${setClause} WHERE user_id = ?`,
        [...values, userId],
        function(err) {
          if (err) reject(err);
          resolve(this.changes);
        }
      );
    });
  }
}

module.exports = Setting;
