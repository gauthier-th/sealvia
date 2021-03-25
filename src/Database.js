import { openDatabase } from 'expo-sqlite';

class Database {

  constructor() {
    this.db = openDatabase('db.db');
    this.db.transaction(tx => {
      tx.executeSql(
        'create table if not exists favorites (id integer primary key not null, line text, stop text, direction text);'
      );
    });
  }

  /**
   * @returns {Promise.<import('expo-sqlite').ResultSet>}
   */
  async addFavorite(line, stop, direction) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'insert into favorites values (NULL, ?, ?, ?);',
          [line, stop, direction],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  /**
   * @returns {Promise.<import('expo-sqlite').ResultSet>}
   */
  async removeFavorite(id) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'delete from favorites where id=?;',
          [id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  /**
   * @returns {Promise.<import('expo-sqlite').ResultSet>}
   */
  async listFavorite() {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'select * from favorites;',
          [],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

}

export default Database;