import {Notifier} from "./notifier";
import axios from 'axios';
import {VfsResponseType} from "./vfs-response.type";

import dotenv from 'dotenv';

dotenv.config();

const authToken = process.env.AUTHENTICATED_TOKEN;
const checkUrl = process.env.VFS_GLOBAL_URL;

export class Checker {
    private notifier: Notifier = new Notifier();

    public async execute() {
        try {
            const authToken = await this.authenticate()
            await this.checkDates(authToken);
        } catch (e: any) {
            await this.notifier.sendMessage(`Something went wrong. Details: ${e.message}`);
        }
    }

    /*
    *   The auth process is manual for now.
    *   Later should be replaced with crawler + captcha solver: https://www.npmjs.com/package/2captcha
    */
    private async authenticate(): Promise<string> {
        if (!authToken) {
            throw new Error('Auth token is EMPTY!');
        }

        console.log("About to authenticate");
        let data;
        try {
            const response = await axios.post<VfsResponseType>("https://lift-api.vfsglobal.com/user/login", "username=scorpionsve88@gmail.com&password=hyuJk1+hEKNMu7Av6l//7UjY/NcrL3FhayjXpXdNAD5RbhlqFiEjHsTbIRhTxusha6iiAdScjw7/w3Vler7i8TiUCGI6eVvhKNZYRPpH0XGWgvzhMqCWrHDTOmQAUOrUnE+miIM+WYjzgxdYmR53wjuH3/ZAmSiLDuCJIBgpuPw=&missioncode=pol&countrycode=blr&captcha_version=v2&captcha_api_key=03AFcWeA40seRw2M-vKFzR1fAyiTRCFQ7DQM6IbDAu3G3u9a9LvedsldpJnkuRMCppAMV6vtLDixxbD4wqF3ycIljSXGbB23bapCHVlb3qKLWD371TbfcAmVVqFSJpcCb0C-vSruT7gF-Zd4pdcu1usrsyhWU5QdOaSHPehW4z0XFbKcoXZcKcRYw16jnHo-kJ8zTuYU7Y_Qmf7zthk4wVpvD2spuGgugN6RemKzieYbvri8eM914-Sld1qV_q4e1UgmwKH65gaZW3BQuB4CO5M0K0se9XnTwGwaBLKNyaBDQEQZkFebHL9DitNGnqULZyQad2-8-FXw4FgIx01YLuq1nvMl46HpSLEZgtzV5anCjFstOqs4C0cNkWKmNlWYSCn4Nq8yVLYY8pP-DwBhpsnpVc-xfyOraejOpsQgDPoEqWfCLws6WgeMZyYIx38zOqDk76oPQeJdS6HHJIcmrq4c-Q_HeIIyFLi0B2m8M2ptuj9wrmMp7PGWHO7D5DOdtH5aXN1wf4w9O-hhge48LYYM2yqm_PX1XLi6utse3SRoU1xR24zny3QAtNUfTTookcPqjMKr5y048_OLubiJcP-IaSER1g-npoxOV-I8xgcCJR4ItHQZy4X3g", {
                headers: {
                    ':authority': 'lift-api.vfsglobal.com',
                    ':method': 'POST',
                    ':path': '/user/login',
                    ':scheme': 'https',
                    Origin: 'https://visa.vfsglobal.com',
                    Referer: 'https://visa.vfsglobal.com/',
                    Route: `blr/ru/pol`,
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-site',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
                }
            });
            data = response.data;
        } catch (e) {
            console.log('error: ', e);
        }

        console.log('auth data: ', data);

        return Promise.resolve(authToken);
    }

    private async checkDates(authToken: string) {
        if (!checkUrl) {
            throw new Error('URL is EMPTY!');
        }

        let data;
        try {
            const response = await axios.post<VfsResponseType>(checkUrl, {
                "countryCode": "blr",
                "missionCode": "pol",
                "vacCode": "POL-MIN",
                "visaCategoryCode": "SENGEN",
                "roleName": "Individual",
                "loginUser": "scorpionsve88@gmail.com",
                "payCode": ""
            }, {
                headers: {
                    Authorize: authToken,
                    Route: `blr/ru/pol`,
                    'Sec-Ch-Ua': '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
                    'Sec-Ch-Ua-Mobile': '?0',
                    'Sec-Ch-Ua-Platform': '"macOS"',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-site',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
                }
            });
            data = response.data;
        } catch (e: any) {
            console.log(e);
            throw new Error('error');
        }

        if (data?.error?.description) {
            throw new Error(`Error during fetching the available slots: ${data.error?.description}`);
        }


        await this.notifier.sendMessage(`Some dates are available: ${JSON.stringify(data.earliestSlotLists)}`);
    }
}