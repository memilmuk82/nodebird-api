const passport = require('passport'); // passport 모듈 불러오기
const KakaoStrategy = require('passport-kakao').Strategy; // passport-kakao 모듈에서 KakaoStrategy 불러오기

const User = require('../models/user'); // User 모델 불러오기

module.exports = () => { // 모듈을 내보내는 함수
    passport.use(new KakaoStrategy({ // passport에 새로운 KakaoStrategy 설정
        clientID: process.env.KAKAO_ID, // Kakao 애플리케이션의 클라이언트 ID 설정
        // clientID -> 카카오에서 발급해주는 아이디
        // 노출되지 않기 위해 process.env.KAKAO_ID로 설정
        callbackURL: '/auth/kakao/callback', // 인증 후 Kakao가 리디렉션할 URL 설정
    }, async (accessToken, refreshToken, profile, done) => { // KakaoStrategy 인증 콜백 함수
        console.log('kakao profile', profile); // Kakao 프로필 정보를 콘솔에 출력
        try {
            const exUser = await User.findOne({ // 기존 사용자 찾기
                where: { snsId: profile.id.toString(), provider: 'kakao'}, // snsId와 provider가 일치하는 사용자 찾기
            });
            if (exUser) { // 사용자가 이미 존재하면
                done(null, exUser); // 해당 사용자 정보를 반환
            } else { // 사용자가 존재하지 않으면
                const newUser = await User.create({ // 새로운 사용자 생성
                    email: profile._json?.kakao_account?.email, // 사용자 이메일 설정
                    nick: profile.displayName, // 사용자 닉네임 설정
                    snsId: profile.id, // snsId 설정
                    provider: 'kakao', // provider를 'kakao'로 설정
                });
                done(null, newUser); // 새로 생성된 사용자 정보를 반환
            }
        } catch (error) { // 오류가 발생하면
            console.error(error); // 오류를 콘솔에 출력하고
            done(error); // 오류를 반환
        }
    }));
};