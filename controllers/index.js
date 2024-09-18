const { v4: uuidv4 } = require('uuid'); // uuid 라이브러리에서 v4 메소드를 uuidv4로 불러옴, 고유한 ID 생성에 사용
const { User, Domain } = require('../models'); // User와 Domain 모델을 불러옴

// 로그인 페이지를 렌더링하는 함수 -> 접속시 로그인 화면을 보여줌.
exports.renderLogin = async (req, res, next) => {
    try {
        // 현재 요청의 사용자 ID로 데이터베이스에서 사용자 정보를 검색
        const user = await User.findOne({
            where: { id: req.user?.id || null }, // 요청한 사용자 ID가 없으면 null로 설정
            // 시퀄라이즈 where에는 undefined가 들어가면 안되므로 req.user?.id || null 사용
            include: { model: Domain }, // 사용자의 도메인 정보도 함께 포함
        });
        // 로그인 페이지를 렌더링, 사용자와 사용자의 도메인을 전달
        res.render('login', {
            user,
            domains: user?.Domains, // 사용자의 도메인이 있을 경우 포함
        });
    } catch(err) {
        console.error(err); // 오류 발생 시 콘솔에 오류 출력
        next(err); // 오류를 다음 미들웨어로 전달
    }
}

// 도메인을 생성하는 함수 -> 폼으로부터 온 데이터를 도메인 모델에 저장
exports.createDomain = async (req, res, next) => {
    try {
        // 새로운 도메인 레코드를 데이터베이스에 생성
        await Domain.create({
            UserId: req.user.id, // 현재 요청한 사용자의 ID를 사용자 ID로 설정
            host: req.body.host, // 요청 본문에서 호스트 정보를 가져옴
            type: req.body.type, // 요청 본문에서 도메인 타입을 가져옴
            clientSecret: uuidv4(), // 고유한 클라이언트 비밀값을 UUID로 생성
        });
        res.redirect('/'); // 도메인 생성 후 홈으로 리다이렉트
    } catch(err) {
        console.error(err); // 오류 발생 시 콘솔에 오류 출력
        next(err); // 오류를 다음 미들웨어로 전달
    }
};