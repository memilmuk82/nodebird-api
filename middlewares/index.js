// 사용자가 로그인한 상태인지 확인하는 미들웨어
exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) { // 사용자가 인증된 상태인지 확인
        // Passport -> res객체에 isAuthenticated 메서드 추가
        // 로그인 중이면 req.isAuthenticated()가 True, 그렇지 않으면 False
        next(); // 인증된 상태이면 다음 미들웨어로 이동
    } else {
        res.status(403).send('로그인 필요'); 
        // 인증되지 않은 상태이면 403 상태 코드와 함께 '로그인 필요' 메시지 전송
    }
};

// 사용자가 로그인하지 않은 상태인지 확인하는 미들웨어
exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { // 사용자가 인증되지 않은 상태인지 확인
        next(); // 인증되지 않은 상태이면 다음 미들웨어로 이동
    } else {
        const message = encodeURIComponent('로그인한 상태입니다.'); // 인증된 상태이면 메시지 인코딩
        res.redirect(`/?error=${message}`); // 메시지를 포함하여 리다이렉트
    }
};