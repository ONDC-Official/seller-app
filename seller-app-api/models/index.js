import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import config from '../lib/config';

const dbConfig = config.get('database');
let basename = path.basename(__filename);
let db = {};

const sequelize = new Sequelize(dbConfig.name, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    operatorsAliases: false,
    pool: dbConfig.pool,
    timezone: '+05:30',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    logging:true
});

// Or you can simply use a connection uri
// const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');

fs.readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        var model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
//
sequelize
    .sync({alter: true})
    .then(() => console.log('Completed!'))


module.exports = db;