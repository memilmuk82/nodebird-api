const jwt = require('jsonwebtoken'); // JWT 모듈 불러오기
const { Domain, User, Post, Hashtag } = require('../models'); // Domain, User, Post, Hashtag 모델 불러오기

// 토큰을 생성하는 함수
// 전달 받은 클라이언트 비밀키로 도메인이 등록될 것인지 확인
// 등록되지 않은 도메인 -> 에러메시지
// 등록된 도메인 -> 토큰 발급
exports.createToken = async (req, res) => {
    const { clientSecret } = req.body; // 클라이언트에서 전달받은 clientSecret 추출
    try {
        const domain = await Domain.findOne({
            where: { clientSecret }, // clientSecret을 기준으로 도메인 검색
            include: {
                model: User, // 연결된 User 정보도 함께 가져옴
                attribute: ['nick', 'id'], // User 모델에서 가져올 필드 정의
            },
        });
        
        if (!domain) { // 도메인이 존재하지 않는 경우
            return res.status(401).json({
                code: 401,
                message: '등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요', // 에러 메시지 전송
            });
        }

        // 토큰 생성
        const token = jwt.sign({
            id: domain.User.id, // 토큰에 담길 유저 id
            nick: domain.User.nick, // 토큰에 담길 유저 닉네임
        }, process.env.JWT_SECRET /* 토큰의 비밀 키 */, { 
            expiresIn: '1m', // 토큰 만료 시간 설정 (1분)
            // vercel/ms(https://github.com/vercel/ms)의 형식 사용
            // 1분은 60000ms이기 때문에 '60 * 1000'로 써도 됨.
            // 토큰 발급 후 1분이 지나면 토큰이 만료됨 -> 만료되었다면 토큰 재발급
            issuer: 'nodebird', // 토큰 발행자 설정
        });

        return res.json({
            code: 200,
            message: '토큰이 발급되었습니다', // 성공 메시지 전송
            token, // 생성된 토큰 반환
        });
    } catch (error) { // 에러 처리
        console.error(error); // 에러 로그 출력
        return res.status(500).json({
            code: 500,
            message: '서버 에러', // 서버 에러 메시지 전송
        });
    }
};

// 토큰을 검증하고 그 결과를 반환하는 함수
// 토큰을 검증하는 미들웨어 -> 검증 성공 -> 토큰의 내용물을 응답으로 전송
exports.tokenTest = (req, res) => {
    res.json(res.locals.decoded); // 미들웨어에서 검증된 토큰의 decoded 정보를 반환
};

// 사용자의 게시물을 가져오는 함수
exports.getMyPosts = (req, res) => {
    Post.findAll({ where: { userId: res.locals.decoded.id } }) // 현재 사용자 ID를 기준으로 게시물 검색
        .then((posts) => { // 게시물 검색 성공
            console.log(posts); // 검색된 게시물 로그 출력
            res.json({ // 성공 응답
                code: 200,
                payload: posts, // 검색된 게시물 반환
            });
        })
        .catch((error) => { // 에러 처리
            console.error(error); // 에러 로그 출력
            return res.status(500).json({ // 500 Internal Server Error 응답
                code: 500,
                message: '서버 에러', // 서버 에러 메시지 전송
            });
        });
};

// 해시태그에 따른 게시물을 가져오는 함수
exports.getPostsByHashtag = async (req, res) => {
    try {
        const hashtag = await Hashtag.findOne({ where: { title: req.params.title } }); // 해시태그 검색
        if (!hashtag) { // 해시태그가 존재하지 않는 경우
            return res.status(404).json({ // 404 Not Found 응답
                code: 404,
                message: '검색 결과가 없습니다.', // 검색 결과 없음 메시지 전송
            });
        }
        const posts = await hashtag.getPosts(); // 해시태그에 연결된 게시물 가져오기
        return res.json({ // 성공 응답
            code: 200,
            payload: posts, // 검색된 게시물 반환
        });
    } catch (error) { // 에러 처리
        console.error(error); // 에러 로그 출력
        return res.status(500).json({ // 500 Internal Server Error 응답
            code: 500,
            message: '서버 에러', // 서버 에러 메시지 전송
        });
    }
};