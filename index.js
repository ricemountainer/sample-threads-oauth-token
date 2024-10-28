const express = require('express');
const app = express();
const port = process.env['PORT'] || 5000;
//https://qiita.com/taoka-toshiaki/items/e606e2cfa31c6e2ed771

const APP_ID = process.env['THREADS_APP_ID'];
const APP_SECRET = process.env['THREADS_APP_SECRET'];
const REDIRECT_URI = process.env['THREADS_OAUTH_REDIRECT_URI'];
const ENDPOINT_URL = 'https://graph.threads.net';

app.get('/' , async(req,res)=>{
    console.log(`APP_ID=${APP_ID}`);
    console.log(`APP_SECRET=${APP_SECRET}`);
    console.log(`REDIRECT_URI=${REDIRECT_URI}`);
    console.log(`ENDPOINT_URL=${ENDPOINT_URL}`);
    res.send('hello');
});

app.get('/auth/makeAuthorizeUrl' , async(req,res)=>{
    const params = {
        client_id: APP_ID,
        scope: 'threads_basic,threads_content_publish',
        redirect_uri: REDIRECT_URI,
        response_type: 'code'
    };

    const queryString = new URLSearchParams(params).toString();
    const url = 'https://threads.net/oauth/authorize?' + queryString;
    console.log('authorization url=' + url);
    res.send(url);
});

app.get('/auth/redirectCallback' , async (req,res)=>{
    //const msg = `hello /callback;req=${JSON.stringify(req.query)}`;
    let msg = '';
    try {
        if (req.query.code) {
            const code = req.query.code;
            console.log(`code=${code}`);

            const shortAccessTokenResult = getShortAccessToken(code);
            const longAccessTokenResult = changeShortAccessToken2LongAccessToken(shortAccessTokenResult);
            msg = JSON.stringify(longAccessTokenResult);
        }

        res.send('result=' + msg);
    } catch(error) {
        throw error;
    }
});

const getShortAccessToken = async (code) => {
    try {
        const data = new URLSearchParams();
        data.append('client_id', APP_ID);
        data.append('client_secret', APP_SECRET);
        data.append('grant_type', 'authorization_code');
        data.append('redirect_uri', REDIRECT_URI);
        data.append('code' , code);
        const result = await fetch(ENDPOINT_URL + '/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: data.toString(),
        });
        const resultJson = await result.json();
        console.log("short access token result=" + JSON.stringify(resultJson));
        return resultJson;
    } catch(error) {
        console.log('error happened in getShortAccessToken;' + JSON.stringify(error));
        throw error;
    }
};

const changeShortAccessToken2LongAccessToken = async(shortAccessTokenResult) => {
    try {
        const url = ENDPOINT_URL + `/access_token?grant_type=th_exchange_token&client_secret=${APP_SECRET}&access_token=${shortAccessTokenResult.access_token}`;
        const result = await fetch (url, );
        const resultJson = await result.json();
        console.log('change ShortAccessToken to LongAccessToken result=' + JSON.stringify(resultJson));
        return resultJson;
    } catch(error) {
        console.log('error happened in changeShortAccessToken2LongAccessToken;' + JSON.stringify(error));
        throw error;
    }
};

app.listen(port, (err)=>{
    if(err) {
        console.log(`error happened during app#listen`);
        throw err;
    }
    console.log('server listened by port ' + String(port) + '...');
});