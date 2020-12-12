const express = require('express');
const bodyParser = require('body-parser');
const static = require('serve-static');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');

// 핸들러
const expressErrorHandler = require('express-error-handler'); // 에러 핸들러
const passport = require('passport');
const { allowedNodeEnvironmentFlags } = require('process');
const socketio = require('socket.io');
// npm i cors /
const cors = require('cors');
const app = express();
const router = express.Router();


app.use(cookieParser()); //미들웨어 등록
app.use(expressSession({ // 세션 셋팅
    secret: '!@#$%^&*()',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60 * 60 * 1000 } //  천시간
}));

app.use(logger('dev'));


// passport 사용 설정
// passport의 세션을 사용하려면 그 전에 express의 세션을 사용하는 코드가 먼저 나와야 합니다.
app.use(passport.initialize()); //  초기화
app.use(passport.session());// 세션 사용


app.use(bodyParser.urlencoded({extended: false}))
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/', router);

//페이지가 없을때 이쪽으로 호출 에러페이지
 const errorHandler = expressErrorHandler({
     static: {
         '404' : './public/404.html' // 에러핸들러가 실행됨
     }
 });
app.use(expressErrorHandler.httpError(404)); // http에서 404 에러가 나면
app.use(errorHandler); // 위에 에러 핸들러로 보냄


// localhost:3000/views
app.set('views', __dirname + '/views'); //현재 디렉토리에서 뷰스폴더로 이어줌
app.set('views engine', 'ejs');

const config = require('./config/config');// 컨피그 파일을 읽는다
const database = require('./database/database'); // 데이터베이스 파일을 읽어온다

// passport 설정
const configPassport = require('./config/passport');
configPassport(app, passport)             // 패스포트모듈에 익스프레스와 패스포트를 넣어준다


// 라우터 설정
const userPassport = require('./routes/route_member');
userPassport(router,passport);



const server = app.listen(config.server_port, () =>{ 
    console.log(`${config.server_port}포트로 서버 실행중 ...`);
   database.init(app, config);
});

const io = socketio(server); // 웹서버 소켓 
console.log('socket.io 준비 완료!');

