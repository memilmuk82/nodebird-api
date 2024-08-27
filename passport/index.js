const passport = require('passport'); // passport 모듈 불러오기
const local = require('./localStrategy'); // 로컬 인증 전략 불러오기
const kakao = require('./kakaoStrategy'); // 카카오 인증 전략 불러오기
const User = require('../models/user'); // User 모델 불러오기

module.exports = () => {
    // 사용자 정보를 세션에 저장 -> 사용자 인증 시 호출
    passport.serializeUser((user, done) => {
        // done(null, user.id)는 세션에 사용자 ID를 저장합니다.
        done(null, user.id); // 로그인 시 실행 -> 사용자 ID를 세션에 저장
        // null -> 에러가 발생할 때 사용
        // user.id -> 저장하고 싶은 데이터(사용자 ID)
    });
    
    // 세션에 저장된 사용자 ID를 통해 사용자 정보를 복원 -> 매 요청 시 호출
    passport.deserializeUser((id, done) => {
        // id -> serializeUser 메서드 안의 user.id
        // User 모델에서 ID를 사용해 사용자 정보 찾기
        // include에서 계속 attributes 지정 
        // -> 실수로 비밀번호를 조회하는 것 방지(브라우저에서 회원 비밀번호 조회 X)
        User.findOne({ 
            where: { id }, // 사용자 ID를 조건으로 검색
            include: [{ // 사용자와 연관된 데이터를 포함
                model: User, // User 모델 포함
                attributes: ['id', 'nick'], // 포함할 속성 -> id,  nick
                as: 'Followers', // 팔로워 정보 가져오기
            }, {
                model: User, // User 모델 포함
                attributes: ['id', 'nick'], // 포함할 속성 -> id,  nick
                as: 'Followings', // 팔로잉 정보 가져오기
            }],
        })
        .then(user => done(null, user)) // 사용자 정보를 찾아 done 콜백으로 전달 -> req.user에 저장
        .catch(err => done(err)); // 오류 발생 시 done 콜백으로 에러 전달
    });
    
    local(); // 로컬 인증 전략 설정
    kakao(); // 카카오 인증 전략 설정
}