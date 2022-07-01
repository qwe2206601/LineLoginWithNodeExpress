var express = require('express');
var router = express.Router();
var axios = require('axios')
const queryString = require('node:querystring');
/* GET users listing. */
router.get('/callback', function (req, res, next) {
	res.send('respond with a resource');
});
//請求連動 https://notify-bot.line.me/oauth/authorize?response_type=code&scope=notify&response_mode=form_post&client_id=wXyzk8T5jjNLO83XVAZGJK&redirect_uri=https://12d8-122-117-240-98.jp.ngrok.io/notify/callback&state=f094a459-1d16-42d6-a709-c2b61ec53d60
router.post('/callback',async function (req, res, next) {
	const getTokenBody = queryString.stringify({
		grant_type: 'authorization_code',
		code: req.body.code,
		redirect_uri: 'https://de51-122-117-240-98.jp.ngrok.io/notify/callback',
		client_id: 'wXyzk8T5jjNLO83XVAZGJK',
		client_secret: '',
	});
	req.session.line[req.sessionID] = {};
	await axios.post('https://notify-bot.line.me/oauth/token', getTokenBody).then((res) => {
		axios({
			method: 'post',
			url: 'https://notify-api.line.me/api/notify',
			responseType: 'json', // responseType 也可以寫在 header 裡面
			headers: {
				Authorization: `Bearer ${res.data.access_token}`, // Bearer 跟 token 中間有一個空格
			},
			params: {
				message: req.session.line.name + '訂閱成功',
			},
		}).catch((error) => {
			console.log(`錯誤: ${error}`);
		});
		return res.data;
	})
	.then((res) => {
		console.log(res)
		req.session.line[req.sessionID] = res;
	})
	.catch((error) => {
		console.log(`錯誤: ${error}`);
	});
	res.render('successNotify', { title: 'Notify' ,...req.session.line});
});
router.post('/sendMessage', function (req, res, next) {
	console.log(req.session.line[req.sessionID])
	axios({
		method: 'post',
		url: 'https://notify-api.line.me/api/notify',
		responseType: 'json', // responseType 也可以寫在 header 裡面
		headers: {
			Authorization: `Bearer ${req.session.line[req.sessionID].access_token}`, // Bearer 跟 token 中間有一個空格
		},
		params: {
			message: '發送者：'+req.session.line.name+'，訊息：'+ req.body.message,
		},
	}).catch((error) => {
		console.log(`錯誤: ${error}`);
	});
});
router.post('/revoke', function (req, res, next) {
	axios({
		method: 'post',
		url: 'https://notify-api.line.me/api/revoke',
		responseType: 'json', // responseType 也可以寫在 header 裡面
		headers: {
			Authorization: `Bearer ${req.session.line[req.sessionID].access_token}`, // Bearer 跟 token 中間有一個空格
		},
	}).then((re) => {
		console.log(re)
	}).catch((error) => {
		console.log(`錯誤: ${error}`);
	});
});

module.exports = router;
