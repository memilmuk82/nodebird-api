const express = require('express'); // Express 웹 프레임워크 불러오기
const path = require('path'); // path 모듈 불러오기: 파일 및 디렉터리 경로 처리
const cookieParser = require('cookie-parser'); // cookie-parser 미들웨어 불러오기: 쿠키 파싱
const passport = require('passport'); // Passport 라이브러리 불러오기: 인증 처리용
const morgan = require('morgan'); // Morgan 미들웨어 불러오기: HTTP 요청 로깅
const session = require('express-session'); // express-session 미들웨어 불러오기: 세션 관리
const nunjucks = require('nunjucks'); // Nunjucks: 템플릿 엔진 불러오기
const dotenv = require('dotenv'); // dotenv 모듈 불러오기: .env파일(환경변수)

dotenv.config(); // .env 파일의 환경 변수를 불러와 process.env에 설정

const v1 =require('./routes/v1'); // v1 API 라우터 불러오기
const authRouter = require('./routes/auth'); // 인증 관련 라우터 모듈 불러오기
const indexRouter = require('./routes');  // 메인 인덱스 라우터 모듈 불러오기
const { sequelize } = require('./models'); // Sequelize ORM을 통해 데이터베이스 모델 불러오기
const passportConfig = require('./passport'); // Passport 설정 파일 불러오기

const app = express(); // Express 애플리케이션 인스턴스 생성
passportConfig(); // Passport 설정을 실행하여 초기화
app.set('port', process.env.PORT || 8002); // 서버가 사용할 포트를 설정, 환경 변수 PORT가 없으면 기본값 8002 사용
app.set('view engine', 'html'); // Nunjucks 템플릿 엔진을 HTML 렌더링 엔진으로 설정
nunjucks.configure('views', {
    express: app, // Express 애플리케이션과 Nunjucks 템플릿 엔진을 연동
    watch: true, // 템플릿 파일이 변경될 때 자동으로 다시 로드하도록 설정
}); // Nunjucks 템플릿 엔진 설정 완료
sequelize.sync({ force: false }) // Sequelize를 사용하여 데이터베이스와 모델 동기, 테이블을 덮어쓰지 않음
    .then(() => {
        console.log('데이터베이스 연결 성공'); // 데이터베이스 연결 성공 시 메시지를 출력
    })
    .catch((err) => {
        console.log(err); // 데이터베이스 연결 실패 시 오류를 출력
    });

app.use(morgan('dev')) // Morgan 미들웨어: HTTP 요청 로그를 'dev' 모드로 출력
app.use(express.static(path.join(__dirname, 'public'))); // 'public' 디렉터리에 있는 정적 파일을 제공하기 위한 미들웨어 설정
app.use(express.json()); // JSON 형식의 요청 본문을 파싱하기 위한 미들웨어 설정
app.use(express.urlencoded({ extended: false })); // URL-인코딩된 요청 본문을 파싱하기 위한 미들웨어 설정
app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키 파싱을 위한 미들웨어 설정, 쿠키 서명에 사용할 비밀키 설정
app.use(session({
    resave: false, // 세션이 변경되지 않은 경우 세션 저장 방지
    saveUninitialized: false, // 초기화되지 않은 세션을 저장하지 않음
    secret: process.env.COOKIE_SECRET, // 세션 암호화를 위한 비밀키 설정
    cookie: {
        httpOnly: true, // JavaScript를 통해 클라이언트 측에서 쿠키에 접근할 수 없도록 설정
        secure: false, // HTTPS에서만 쿠키를 전송할지 여부를 설정 -> 개발환경에서는 false로 설정
    },
}));
app.use(passport.initialize()); // Passport 초기화 수행
app.use(passport.session()); // Passport가 세션을 사용할 수 있도록 설정

app.use('/v1', v1); // '/v1' 경로에 대해 v1 라우터를 사용
app.use('/auth', authRouter); // '/auth' 경로에 대해 authRouter를 사용하여 인증 관련 라우트 처리
app.use('/', indexRouter); // 루트 경로 '/'에 대해 indexRouter를 사용하여 기본 라우트 처리

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404; // 에러 상태 코드를 404로 설정
    next(error); // 다음 에러 처리 미들웨어로 에러를 전달
}); // 정의되지 않은 라우트로 접근했을 때 404 오류를 처리하기 위한 미들웨어 설정

app.use((err, req, res, next) => {
    res.locals.message = err.message; // 템플릿에서 사용할 수 있도록 에러 메시지를 지역 변수로 설정
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}; // 프로덕션 환경이 아닌 경우에만 에러 객체를 지역 변수로 설정
    res.status(err.status || 500); // 응답 상태 코드를 에러의 상태 코드로 설정하고, 설정되지 않은 경우 500(서버 오류)으로 설정
    res.render('error'); // 'error' 템플릿을 렌더링하여 에러 페이지를 응답으로 보냄.
}); // 에러를 처리하기 위한 미들웨어 설정

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '빈 포트에서 대기 중'); // 서버가 지정된 포트에서 시작되면 콘솔에 메시지 출력
}); // 설정된 포트에서 서버를 시작하여 요청 대기