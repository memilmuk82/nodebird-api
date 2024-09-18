const express = require('express'); // Express 모듈을 가져옴
const { renderLogin, createDomain } = require('../controllers'); // controllers에서 renderLogin과 createDomain 함수 가져옴
const { isLoggedIn } = require('../middlewares'); // middlewares에서 isLoggedIn 미들웨어 함수 가져옴

const router = express.Router(); // 라우터 객체 생성

router.get('/', renderLogin); // 루터 경로에 GET 요청이 들어오면 renderLogin 함수 실행
// renderLogin: controllers에서 가져온 함수로, 로그인 페이지를 렌더링하는 역할

router.post('/domain', isLoggedIn, createDomain); // /domain 경로에 POST 요청 시, isLoggedIn 미들웨어 실행 후 createDomain 함수 실행
// createDomain: 도메인 생성을 처리하는 함수로, POST 요청 시 필요한 비즈니스 로직을 수행
// isLoggedIn: 사용자가 인증되었는지 확인하는 미들웨어, 인증되지 않았으면 오류를 반환하거나 로그인 페이지로 리다이렉션 함.

module.exports = router; // 이 라우터 모듈을 외부로 내보냄.