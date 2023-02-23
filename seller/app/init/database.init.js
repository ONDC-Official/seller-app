import mongoose from 'mongoose';
import { mergedEnvironmentConfig } from '../config/env.config.js';

const config = mergedEnvironmentConfig.mongodb;
mongoose.connect(`${config.host}/${config.name}`,{
    useNewUrlParser:true
});

mongoose.set('debug', (collectionName, method, query, doc) => {
    console.log(`[MONGOOS]:${collectionName}.${method}`, JSON.stringify(query), doc);
});

