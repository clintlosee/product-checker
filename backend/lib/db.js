import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

//* Set up the DB
const adapter = new FileSync('db.json');
const db = low(adapter);

//* Set some defaults (required if your JSON file is empty)
db.defaults({ data: [] }).write();

export default db;
