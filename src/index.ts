import {Checker} from './checker'
import dotenv from 'dotenv';
dotenv.config();

(async () => {
    const checker = new Checker();

    await checker.execute();
})()