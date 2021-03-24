import { openDatabase } from 'expo-sqlite';

class Database {

  constructor() {
    this.db = openDatabase('db.db');
    // this.db.transaction(tx => {
    //   tx.executeSql(
    //     'create table if not exists favorites (id integer primary key not null, done int, value text);'
    //   );
    // });
  }



}

export default Database;