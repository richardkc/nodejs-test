var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]
let sessions = {}

if (!port) {
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url
  var queryString = ''
  if (pathWithQuery.indexOf('?') >= 0) { queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('方方说：含查询字符串的路径\n' + pathWithQuery)

  if (path === '/') {
    var string = fs.readFileSync('./index.html', 'utf8')
    var amount = fs.readFileSync('./data', 'utf8')
    let cookies = ''
    if(request.headers.cookie){
      cookies = request.headers.cookie.split(';')   //['email=...,'a=1','b=2']
    }
    let hash = {}
    for(let i=0;i<cookies.length;i++){
      let parts = cookies[i].split('=')
      let key = parts[0]
      let value = parts[1]
      hash[key] = value
    }
    console.log('hash')
    console.log(hash)
    console.log(hash.sign_in_email)
    let mySession = sessions[hash.sessionId]
    let email
    if(mySession){
      email = mySession.sign_in_email
    }
    console.log('email')
    console.log(email)
    let users = fs.readFileSync('./db/users', 'utf8')
    console.log(users)
    users = JSON.parse(users)
    let foundUser
    for(let i=0;i<users.length;i++){
      if(users[i].email === email){
        foundUser = users[i]
        break
      }
    }
    console.log('foundUser')
    console.log(foundUser)
    if(foundUser){
      string = string.replace('__password__',foundUser.password)
    }else{
      string = string.replace('__password__','没有这个账号啦')
    }



    string = string.replace('&&&amount&&&', amount)
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  } else if (path === '/sign_up' && method === 'GET') {
    let string = fs.readFileSync('./sign_up.html', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  } else if (path === '/sign_up' && method === 'POST') {   //注册
    readBody(request).then((body) => {
      let strings = body.split('&')   //['email=1','password=2','password_confirmation=3']
      let hash = {}
      strings.forEach((string) => {
        //string === 'email=1' ...
        let parts = string.split('=')  //['email','1'] ...
        let key = parts[0]
        let value = parts[1]
        hash[key] = decodeURIComponent(value)
      })
      let {email, password, password_confirmation} = hash
      if (email.indexOf('@') === -1) {
        response.setHeader('Content-Type', 'application/json;charset=utf-8')
        response.statusCode = 400
        response.write(`
        {
          "errors":{
            "email": "invalid"
          }
        }
        `)
      } else if (password !== password_confirmation) {
        response.statusCode = 400
        response.write('password not match')
      } else {
        var users = fs.readFileSync('./db/users', 'utf8')
        try {
          users = JSON.parse(users)
        } catch (exception) {
          users = []
        }
        let inUse = false
        for (let i = 0; i < users.length; i++) {
          let user = users[i]
          if (user.email === email) {
            inUse = true
            break
          }
        }
        if (inUse) {
          response.statusCode = 400
          response.write('email has been used')
        } else {
          users.push({email: email, password: password})
          var usersString = JSON.stringify(users)
          fs.writeFileSync('./db/users', usersString)
          response.statusCode = 200
        }
      }
      response.end()
    })
    /*
    let body = []      //请求体
    request.on('data',(chunck) => {
      body.push(chunck)
    }).on('end',() => {
      body = Buffer.concat(body).toString();
      console.log(body)
      response.statusCode = 200
      response.end()
    })
    */
  } else if (path === '/sign_in' && method === 'GET') {
    let string = fs.readFileSync('./sign_in.html', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  } else if (path === '/sign_in' && method === 'POST') {  //登陆
    readBody(request).then((body) => {
      let strings = body.split('&')   //['email=1','password=2','password_confirmation=3']
      let hash = {}
      strings.forEach((string) => {
        //string === 'email=1' ...
        let parts = string.split('=')  //['email','1'] ...
        let key = parts[0]
        let value = parts[1]
        hash[key] = decodeURIComponent(value)
      })
      let {email, password} = hash
      console.log(email)
      console.log(password)
      var users = fs.readFileSync('./db/users', 'utf8')
      try {
        users = JSON.parse(users)
      } catch (exception) {
        users = []
      }
      let found = false
      for(let i=0;i<users.length;i++){
        if(users[i].email === email && users[i].password === password){
          found = true
          break
        }
      }
      console.log(found)
      if(found){
        let sessionId = Math.random() * 10000
        sessions[sessionId] = {sign_in_email: email}
        response.setHeader('Set-Cookie', `sessionId=${sessionId}`)
        response.statusCode = 200
      }else{
        response.statusCode = 401
      }
      response.end()
    })
  } else if (path === '/css/sign_in.css') {
    var string = fs.readFileSync('./css/sign_in.css', 'utf8')
    response.setHeader('content-Type', 'text/css')
    response.write(string)
    response.end()
  } else if (path === '/js/sign_in.js') {
    var string = fs.readFileSync('./js/sign_in.js', 'utf8')
    response.setHeader('content-Type', 'application/javascript')
    response.write(string)
    response.end()
  
  } else if (path === '/css/sign_up.css') {
    var string = fs.readFileSync('./css/sign_up.css', 'utf8')
    response.setHeader('content-Type', 'text/css')
    response.write(string)
    response.end()
  } else if (path === '/js/sign_up.js') {
    var string = fs.readFileSync('./js/sign_up.js', 'utf8')
    response.setHeader('content-Type', 'application/javascript')
    response.write(string)
    response.end()
  } else if (path === '/css/default.css') {
    var string = fs.readFileSync('./css/default.css', 'utf8')
    response.setHeader('content-Type', 'text/css')
    response.write(string)
    response.end()
  } else if (path === '/js/main.js') {
    var string = fs.readFileSync('./js/main.js', 'utf8')
    response.setHeader('content-Type', 'application/javascript')
    response.write(string)
    response.end()
  } else if (path === '/pay') {
    var amount = fs.readFileSync('./data', 'utf8')
    var newAmount = amount - 1
    fs.writeFileSync('./data', newAmount)
    response.setHeader('Content-Type', 'application/javascript')
    response.statusCode = 200
    response.write(`${query.callback}.call(undefined,'success')`)
    response.end()
  } else {
    response.statusCode = 404
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write('找不到对应的路径，你需要自行修改 index.js')
    response.end()
  }

  /******** 代码结束，下面不要看 ************/
})


server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = []
    request.on('data', (chunck) => {
      body.push(chunck)
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      resolve(body)
    })
  })
}
