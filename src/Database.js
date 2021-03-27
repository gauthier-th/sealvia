import { openDatabase } from 'expo-sqlite';

class Database {

  constructor() {
    this.db = openDatabase('db.db');
    this.db.transaction(tx => {
      tx.executeSql(
        'create table if not exists favorites (id integer primary key not null, custom_order int, line text, stop text, code text, direction text);'
      );
    });
  }

  /**
   * @returns {Promise.<import('expo-sqlite').ResultSet>}
   */
  async addFavorite(line, stop, code, direction) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'insert into favorites values (NULL, NULL, ?, ?, ?, ?);',
          [line, stop, code, direction],
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
          'select * from favorites order by custom_order asc, id asc;',
          [],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  /**
   * @param {{ id: number, order: number }[]} favorites 
   * @returns {Promise.<import('expo-sqlite').ResultSet[]>}
   */
  async setOrder(favorites) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        Promise.all(favorites.map(fav => (
          new Promise((res, rej) => {
            tx.executeSql(
              'update favorites set custom_order=? where id=?',
              [fav.order, fav.id],
              (_, result) => res(result),
              (_, error) => rej(error)
            )
          })
        ))).then(resolve).catch(reject);
      });
    });
  }

}

export default Database;