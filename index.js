const fetch = require("node-fetch");

var express = require('express');
var app = express();
var fs = require("fs");
var port=process.env.PORT || 5000;
const datafile=__dirname + "/" + "data.json";



function activity_data(dosome,inreq)
{
	var activity_form={
		time:Date.now(),
		doing:dosome,
		req_data:"",
	};
	/*
	console.log("headers = " + JSON.stringify(req.headers));// 包含了各种header，包括x-forwarded-for(如果被代理过的话)
	console.log("x-forwarded-for = " + req.header('x-forwarded-for'));// 各阶段ip的CSV, 最左侧的是原始ip
	console.log("ips = " + JSON.stringify(req.ips));// 相当于(req.header('x-forwarded-for') || '').split(',')
	console.log("remoteAddress = " + req.connection.remoteAddress);// 未发生代理时，请求的ip
	console.log("ip = " + req.ip);// 同req.connection.remoteAddress, 但是格式要好一些
	require('dns').reverse(req.connection.remoteAddress, function(err, domains) {
	console.log(domains);
	});
	*/
	var req_data={
		//headers :inreq.headers,
		x_forwarded_for :inreq.header('x-forwarded-for'),
		ip : inreq.ip,

	};
	//console.log(req_data)

	activity_form["req_data"]=req_data
	
	return activity_form
}
app.get('/newdata_list', function (req, res) {
		var id = req.query.id
		fs.readFile(datafile, 'utf8', function (err, data) {

		data=JSON.parse(data)
		//save data
		data["activity"].push(activity_data("newdata_list",req))

		fs.writeFile(datafile,JSON.stringify(data), function (err) {
			
			res.end(JSON.stringify(data["newdata"]))
		});

		console.log("newdata_list");


	});

})
app.get('/readFile', function (req, res) {
		var id = req.query.id
		fs.readFile(datafile, 'utf8', function (err, data) {

		data=JSON.parse(data)
		data["activity"].push(activity_data("readFile",req))

		fs.writeFile(datafile,JSON.stringify(data), function (err) {
			
			res.end(JSON.stringify(data))
		});

		console.log("readFile");


	});

})
app.get('/adduser', function (req, res) {


	var add = req.query.add;
	add= JSON.parse(add);

	var data = fs.readFileSync(datafile, 'utf8');
	
	data=JSON.parse(data);
	
	data["newdata"].push(add);
	data["activity"].push(activity_data("adduser",req));

	//writeFile
	
	fs.writeFile(datafile,JSON.stringify(data), function (err) {
		console.log("add:"+JSON.stringify(add))
		res.end(JSON.stringify(data["newdata"]))
	});

});

app.get('/remove', function (req, res) {
	var no = req.query.no
	no=parseInt(no)
	var user = req.query.user
	//var pass = req.query.pass

	var data = fs.readFileSync(datafile, 'utf8');
	data=JSON.parse(data)
	var old= data["newdata"][no] 

	if (user==data["user"]) {

		data["newdata"][no]={remove_time:Date.now()}
		data["activity"].push(activity_data("remove",req))

	}else
	{
		res.end("bad")
		data["activity"].push(activity_data("remove fail",req))



	}
	
	fs.writeFile(datafile,JSON.stringify(data), function (err) {
		console.log("remove:"+JSON.stringify(old))
		res.end(JSON.stringify(data["newdata"]))
	});
	

});



//line
var line_url="https://notify-bot.line.me/oauth/authorize?client_id=dXtFf8wHYEcYPDb3VjlgtN&redirect_uri=https://nodeherku.herokuapp.com/line/callback&response_type=code&scope=notify&state=15213315456494986"
var redirect_uri="https://nodeherku.herokuapp.com/linecallback"
var client_id="dXtFf8wHYEcYPDb3VjlgtN"
var client_secret="h35rW4QE2s6qMkNXTzkHr5qsfwNjEl5ma7qaIHN1qqj"

function send_message(access_token,text) {
	
	/*
	access_token=access_token["access_token"]
	console.log(access_token)
	*/
	/*
	var data = fs.readFileSync(datafile, 'utf8');

	data=JSON.parse(data)

	if (data["line_access_token"].indexOf(access_token)==-1) 
	{
		data["line_access_token"].push(access_token)
		fs.writeFile(datafile,JSON.stringify(data), function (err) {
		})
	}
	
	*/
	fetch("https://notify-api.line.me/api/notify", {
		body: "message="+text,
		headers: {
		Authorization: "Bearer "+access_token,
		"Content-Type": "application/x-www-form-urlencoded"
		},
		method: "POST"
	}).then(res=>res.json())
	.catch(err => console.error(err))
	// body...
}

app.get('/line_send_message', function (req, res) {
	var text = req.query.text
	var no =req.query.no
	no=parseInt(no)

	var data = fs.readFileSync(datafile, 'utf8');
	data=JSON.parse(data)
	

	data["activity"].push(activity_data("line_send_message"+no.toString(),req))

	var acc=data["line_access_token"][no]
	send_message(acc,text)
	res.end("send_message:"+text)
	
	
	fs.writeFile(datafile,JSON.stringify(data), function (err) {
		console.log("run javascript_code:"+JSON.stringify(code))
		res.end(JSON.stringify(data["javascript"]))
	});
	
	
	

});
app.get('/linecallback', function (req, res) {


	function get_token(incode)
	{

		


		console.log(incode)
		var data={
			client_id: client_id,
			client_secret:client_secret,
			code: incode,
			grant_type: "authorization_code",
			redirect_uri: redirect_uri
		}
		var options={
			method: 'POST',
		    headers: {
		        'Content-Type': 'application/json'
		    }
		}
		var url="https://notify-bot.line.me/oauth/token?"+ new URLSearchParams(data).toString()
		console.log(url)
		//send messger
		fetch(url, options)
		.then(res => res.json())
		.then(res => send_message(res["access_token"],"你好"))
		.catch(err => console.error(err))

	}
	

	var url="https://notify-bot.line.me/oauth/token?"
	var code = req.query.code

	if (code!="") 
	{
		get_token(code)

		res.end("good")

	}else
	{
		res.end("bad")
	}
});



//java code
app.get('/javascript_code', function (req, res) {
	var code = req.query.code

	
	var data = fs.readFileSync(datafile, 'utf8');
	data=JSON.parse(data)
	data["activity"].push(activity_data("javascript add code",req))

	
	
	data["javascript"].push(code)
	
	fs.writeFile(datafile,JSON.stringify(data), function (err) {
		console.log("new javascript_code:"+JSON.stringify(code))
		res.end(JSON.stringify(data["javascript"]))
	});


});

app.get('/javascript_run', function (req, res) {
	var code = req.query.code
	var type = req.query.type
	var no   = req.query.no
	no=parseInt(no)

	var data = fs.readFileSync(datafile, 'utf8');
	//console.log(data)
	data=JSON.parse(data);


	
	if(type=="newcode"){

		data["javascript"].push(code);
		data["activity"].push(activity_data("js newcode",req));


	}else if(type=="old")
	{
		code=data["javascript"][no]
		data["activity"].push(activity_data("js run old code"+no.toString(),req))

	}

	
	//save data
	
	fs.writeFile(datafile,JSON.stringify(data), function (err) {
		res.end(JSON.stringify(data["javascript"]))
	});

	
	console.log("run javascript_code:"+JSON.stringify(code))

	var acc=data["line_access_token"][0];

	console.log("send_message to "+acc)
	send_message(acc,"server run: "+code);
	eval(code)

	

});
var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("应用实例，访问地址为 http://localhost:%s", port)
  //console.log("应用实例，访问地址为 http://%s:%s",host, port)

})
