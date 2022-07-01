var express = require('express');
var axios = require('axios')
const queryString = require('node:querystring');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'LINE LOGIN' });
});

router.get('/callback', function (req, res, next) {
	console.log(req.query.code, req.query.state);
	const URL = 'https://api.line.me/oauth2/v2.1/token?';
	const getTokenUrl = `${URL}`;
	const getTokenBody = queryString.stringify({
		grant_type: 'authorization_code',
		code: req.query.code,
		redirect_uri: 'https://de51-122-117-240-98.jp.ngrok.io/callback',
		client_id: '1657265626',
		client_secret: '',
	});
	axios.post(getTokenUrl, getTokenBody).then((e1) => {
		const token = e1.data.access_token;
		const idToken = e1.data.id_token;
		const getProfileApiUrl = 'https://api.line.me/v2/profile';
		axios({
			method: 'GET',
			url: getProfileApiUrl,
			responseType: 'json', // responseType 也可以寫在 header 裡面
			headers: {
				Authorization: `Bearer ${token}`, // Bearer 跟 token 中間有一個空格
			},
		}).then((e2) => {
			console.log(`line user id: ${e2.data.userId}, display name:${e2.data.displayName}`);
			const getVerifyApiUrl = 'https://api.line.me/oauth2/v2.1/verify';
			const getVerifyBody = queryString.stringify({
				client_id: '1657265626',
				id_token: idToken,
			});
			axios.post(getVerifyApiUrl, getVerifyBody).then((e3) => {
				console.log(`line email: ${e3.data.email}`);
				req.session.line = e3.data;
				res.render('successLogin', { title: '成功登入' ,...e3.data});
			}).catch((error) => {
				console.log(`錯誤: ${error}`);
			});
		}).catch((error) => {
			console.log(`錯誤: ${error}`);
			res.render('index', { title: '登入失敗請重新登入' });
		});
	})
		.catch((error) => {
			console.log(error);
			res.render('index', { title: '登入失敗請重新登入' });
	});
		
});

module.exports = router;
