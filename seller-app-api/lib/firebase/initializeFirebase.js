import admin from 'firebase-admin';
var config = require('../config');
/**
 * initialize firebase 
 */
const initializeFirebase = () => {
    admin.initializeApp({
        credential: admin.credential.cert(config.get("firebase").account)
    });
}

export default initializeFirebase;