const bcrypt = require('bcrypt'); // bcrypt 모듈을 불러와 비밀번호 해싱 기능 사용
const passport = require('passport'); // passport 모듈을 불러와 인증 기능 사용
const User = require('../models/user'); // User 모델을 불러와 데이터베이스와 상호작용

// 회원가입 처리 함수
exports.join = async (req, res, next) => {
    const { email, nick, password } = req.body; // 요청 본문에서 이메일, 닉네임, 비밀번호 추출
    try {
        const exUser = await User.findOne({ where: { email } }); // 주어진 이메일로 기존 사용자 검색
        if (exUser) { // 사용자가 이미 존재할 경우
            return res.redirect('/join?error=exist'); // 회원가입 페이지로 리다이렉트 및 에러 쿼리 추가
        }
        
        // 비밀번호 해싱: bcrypt의 hash 메서드를 사용해 비밀번호를 해싱
        const hash = await bcrypt.hash(password, 12); // 12는 해시의 복잡도 (수치가 클수록 시간 증가)

        // 새로운 사용자 생성
        await User.create({
            email, // 이메일
            nick, // 닉네임
            password: hash, // 해싱된 비밀번호
        });

        return res.redirect('/'); // 메인 페이지로 리다이렉트
    } catch (error) { // 오류 발생 시
        console.error(error); // 오류를 콘솔에 출력
        return next(error); // 다음 미들웨어로 오류 전달
    }
};

// 로그인 처리 함수
exports.login = (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => { // 로컬 로그인 전략으로 인증 시도
        if (authError) { // 인증 과정에서 오류 발생 시
            console.error(authError); // 오류를 콘솔에 출력
            return next(authError); // 다음 미들웨어로 오류 전달
        }
        
        if (!user) { // 사용자가 존재하지 않을 경우
            return res.redirect(`/?error=${info.message}`); // 메인 페이지로 리다이렉트 및 에러 메시지 전달
        }

        return req.login(user, (loginError) => { // 사용자 로그인 수행
            if (loginError) { // 로그인 과정에서 오류 발생 시
                console.error(loginError); // 오류를 콘솔에 출력
                return next(loginError); // 다음 미들웨어로 오류 전달
            }
            return res.redirect('/'); // 로그인 성공 시 메인 페이지로 리다이렉트
        });
    })(req, res, next); // passport.authenticate 호출 시 (req, res, next) 전달
};

// 로그아웃 처리 함수
exports.logout = (req, res) => {
    req.logout(() => { // req.logout 메서드를 호출하여 로그아웃 수행
        res.redirect('/'); // 로그아웃 후 메인 페이지로 리다이렉트
    });
};