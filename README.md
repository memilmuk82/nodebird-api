# NodeBird API

NodeBird의 사용자·게시물·해시태그 데이터를 PostgreSQL에서 공유해 조회하는 API 서버이자 개발자 도메인 관리 UI입니다. NodeBird 계정으로 로그인해 API 사용 도메인과 클라이언트 비밀값을 등록하고, 짧은 수명의 JWT를 발급받아 자신의 게시물 또는 특정 해시태그의 게시물을 조회할 수 있습니다.

현재 구현은 인증·API 설계를 연습하기 위한 예제이며 운영용 개발자 플랫폼은 아닙니다.

## 주요 기능

- NodeBird 로컬 계정 및 카카오 계정 인증 라우트
- 로그인 사용자의 API 도메인 등록
- 도메인별 UUID 클라이언트 비밀값 생성·조회
- 등록된 도메인의 `Origin`과 클라이언트 비밀값을 확인한 JWT 발급
- JWT 유효성 테스트
- 토큰 소유자의 게시물 조회
- 해시태그별 게시물 조회

도메인 수정·삭제, 클라이언트 비밀값 회전·폐기, API 사용량·권한 관리 기능은 없습니다. `free`와 `premium` 도메인 유형을 저장하지만 현재 API 제한이나 기능 차이에 사용하지 않습니다.

## 라우트

### 페이지·세션 인증·도메인

| 메서드 | 경로 | 인증 | 동작 |
|---|---|---|---|
| `GET` | `/` | 불필요 | 로그인 또는 도메인 관리 화면 |
| `POST` | `/domain` | 세션 로그인 | 도메인과 새 클라이언트 비밀값 등록 |
| `POST` | `/auth/join` | 비로그인 | 로컬 회원가입 요청 처리 |
| `POST` | `/auth/login` | 비로그인 | 로컬 로그인 |
| `GET` | `/auth/logout` | 세션 로그인 | 로그아웃 |
| `GET` | `/auth/kakao` | 불필요 | 카카오 인증 시작 |
| `GET` | `/auth/kakao/callback` | 불필요 | 카카오 인증 콜백 |

화면에는 별도 회원가입 폼이 없고 `localhost:8001`의 NodeBird에서 가입하라는 고정 안내가 표시됩니다. 카카오 라우트는 존재하지만 현재 로그인 화면에는 카카오 로그인 링크가 없습니다.

### v1 API

| 메서드 | 경로 | 인증 | 동작 |
|---|---|---|---|
| `POST` | `/v1/token` | 등록 도메인의 `Origin`과 클라이언트 비밀값 | 1분 JWT 발급 |
| `GET` | `/v1/test` | JWT | 검증된 JWT payload 반환 |
| `GET` | `/v1/posts/my` | JWT | 토큰 사용자 ID의 게시물 반환 |
| `GET` | `/v1/posts/hashtag/:title` | JWT | 지정 해시태그의 게시물 반환 |

## JWT 요청 방식

`POST /v1/token`은 요청 본문의 `clientSecret`과 `Origin` 헤더를 사용합니다. 아래 값은 실제 자격 증명이 아닌 자리표시자입니다.

```bash
curl -X POST http://localhost:8002/v1/token \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://<등록한 도메인>' \
  -d '{"clientSecret":"<클라이언트 비밀값>"}'
```

발급 토큰에는 등록 도메인 소유자의 사용자 ID와 닉네임이 들어가며 만료 시간은 1분, 발급자(`issuer`) 값은 `nodebird`입니다.

보호된 v1 라우트는 `Authorization` 헤더 전체를 JWT 문자열로 바로 검증합니다. 현재 코드는 표준적인 `Bearer <token>` 형식을 파싱하지 않으므로 다음처럼 **접두사 없이 원시 JWT**를 전달해야 합니다.

```bash
curl http://localhost:8002/v1/test \
  -H 'Authorization: <발급받은 JWT>'
```

만료 토큰에는 JSON과 상태 코드 `419`, 그 밖의 검증 실패에는 `401`을 반환합니다.

## Origin 검사의 범위와 제한

토큰 발급 시 등록된 `host`와 요청 `Origin`을 호스트·포트 형태로 정규화해 비교하고, 빈 Origin은 거부합니다. 그러나 이 검사는 다음 이유로 강한 클라이언트 인증이나 완전한 접근 제어가 아닙니다.

- HTTP 클라이언트나 서버 프로그램은 `Origin` 헤더를 임의로 만들 수 있습니다.
- 정규화 결과에서 URL 스킴을 제외하므로 같은 호스트·포트의 HTTP와 HTTPS를 구분하지 않습니다.
- 애플리케이션에 CORS 미들웨어와 `Access-Control-Allow-Origin` 응답 설정이 없어, 등록된 외부 브라우저 도메인도 preflight 또는 응답 읽기 단계에서 실패할 수 있습니다.
- 클라이언트 비밀값은 브라우저에 배포하기에 적합한 공개 식별자가 아니며 프런트엔드 코드에 넣으면 노출됩니다.

브라우저 앱을 지원하려면 허용 Origin을 스킴까지 포함해 검증하고 명시적인 CORS 정책을 구성해야 합니다. 기밀 클라이언트 인증은 비밀값을 노출하지 않는 서버 간 통신으로 수행해야 합니다.

## 기술 스택

- Node.js, npm
- Express 4, Nunjucks, Morgan
- Passport Local, Passport Kakao
- `express-session`, `cookie-parser`
- JSON Web Token(`jsonwebtoken`)
- Sequelize 6, Sequelize CLI, PostgreSQL, `pg`
- bcrypt
- UUID
- Node.js 내장 테스트 러너
- Nodemon(개발 실행 도구)

`package.json`에는 지원 Node.js 버전을 제한하는 `engines` 항목이 없습니다.

## 프로젝트 구조

```text
.
├── app.js                 # 앱·세션·Passport 설정, DB 동기화, 서버 시작
├── config/config.json     # DB 연결 기본값
├── controllers/           # 페이지, 인증, 도메인, v1 API 처리
├── middlewares/           # 세션 상태와 JWT 검사
├── models/                # NodeBird 공유 모델과 Domain 모델
├── passport/              # 로컬·카카오 인증 전략
├── routes/                # 페이지, 인증, v1 API 라우트
├── utils/domain.js        # 도메인·Origin 정규화와 비교
├── test/domain.test.js    # 도메인 유틸리티 단위 테스트
├── views/                 # 로그인·도메인 관리 및 오류 화면
├── package.json
└── package-lock.json
```

## 설치 및 실행

Node.js/npm과 NodeBird 데이터가 있는 PostgreSQL이 필요합니다.

```bash
npm ci
npm start
```

`npm start`는 `nodemon app`을 실행합니다. 기본 주소는 `http://localhost:8002`이며 개발 실행 방식입니다.

이 프로젝트는 시작 시 `dotenv.config()`로 루트 `.env`를 읽습니다. 실제 값은 README나 Git에 기록하지 말고 로컬의 추적되지 않는 환경 파일 또는 실행 환경의 비밀 관리 기능으로 주입하세요.

## 환경 변수

| 변수 | 필수 여부 | 설명 |
|---|---|---|
| `COOKIE_SECRET` | 필수 | 쿠키와 세션 서명 값 |
| `KAKAO_ID` | 필수 | 앱 시작 시 항상 등록되는 KakaoStrategy의 클라이언트 ID |
| `JWT_SECRET` | v1 API에 필수 | JWT 서명·검증 값 |
| `DB_NAME` | 권장 | PostgreSQL DB 이름. 없으면 파일 설정 사용 |
| `DB_USER` | 권장 | PostgreSQL 사용자. 없으면 파일 설정 사용 |
| `DB_PASSWORD` | 연결 방식에 따라 필요 | PostgreSQL 비밀번호. 없으면 파일 설정 사용 |
| `DB_HOST` | 권장 | PostgreSQL 호스트. 없으면 파일 설정 사용 |
| `DB_PORT` | 선택 | PostgreSQL 포트. 없으면 파일 설정 또는 드라이버 기본값 사용 |
| `DB_DIALECT` | 선택 | Sequelize dialect. 기본값 `postgres` |
| `PORT` | 선택 | HTTP 포트. 기본값 `8002` |
| `NODE_ENV` | 선택 | DB 설정 환경과 오류·보안 쿠키 동작 선택 |

`passportConfig()`가 KakaoStrategy를 조건 없이 초기화하므로 카카오 라우트를 사용하지 않아도 `KAKAO_ID`가 필요하며, 값이 없으면 앱 시작이 실패할 수 있습니다.

현재 `config/config.json`에는 `development` 설정만 있습니다. 다른 `NODE_ENV`에서는 `DB_NAME`, `DB_USER`, `DB_HOST`를 포함한 연결 설정을 실행 환경에서 제공해야 합니다. 카카오 개발자 설정에는 실제 서비스 URL에 대응하는 `/auth/kakao/callback` 리디렉션 URI가 필요합니다.

## 데이터베이스와 모델

이 저장소는 NodeBird의 `User`, `Post`, `Hashtag`, `Follow`, `PostHashtag` 테이블 구조를 복제해 같은 PostgreSQL 데이터베이스에 연결합니다.

- `User`: 로컬·카카오 계정, 게시물, 팔로워·팔로잉 및 등록 도메인과 관계
- `Post`: 사용자와 다대일, 해시태그와 다대다 관계
- `Hashtag`: 게시물과 `PostHashtag`를 통한 다대다 관계
- `Domain`: 사용자와 다대일 관계, 최대 80자 host, `free`·`premium` 유형, UUID 클라이언트 비밀값

`Domain.clientSecret`은 해시하지 않은 UUID로 DB에 저장되고 로그인 사용자의 관리 화면에 그대로 표시됩니다. 값의 회전·폐기·마스킹 기능과 마지막 사용 기록이 없습니다.

시작 시 `sequelize.sync({ force: false })`를 호출하며 마이그레이션 파일은 없습니다. `app.listen()`은 동기화 완료를 기다리지 않으므로 DB 동기화가 실패해도 HTTP 서버가 먼저 열리고 이후 요청이 실패할 수 있습니다. NodeBird와 이 서버가 같은 스키마를 각각 `sync()`하므로 모델 변경은 두 저장소 사이에서 함께 관리해야 합니다.

## 테스트

```bash
npm test
```

현재 테스트는 다음 도메인 유틸리티 동작만 확인합니다.

- URL 또는 host 문자열을 비교 가능한 호스트로 정규화
- 일치하는 Origin 허용, 다른 Origin과 빈 Origin 거부

페이지·인증·도메인 등록, JWT 발급·만료·오류, 실제 DB 조회와 CORS에 대한 라우트·통합 테스트는 없습니다.

## 구현 범위와 보안 제한

- 세션 저장소를 지정하지 않아 `express-session` 기본 MemoryStore를 사용합니다. 재시작과 다중 인스턴스 운영에 적합하지 않습니다.
- 세션 쿠키는 `httpOnly: true`, `sameSite: 'lax'`이고 `secure`는 `NODE_ENV=production`일 때만 활성화됩니다. `trust proxy` 설정과 명시적인 `maxAge`·만료 시각이 없으므로 HTTPS 리버스 프록시 환경의 Secure 쿠키 전달과 실제 세션 만료 동작을 배포 전에 검증해야 합니다.
- 세션 상태 변경 요청과 GET 로그아웃에 CSRF 방어가 없습니다.
- 카카오 OAuth에서 `state` 검증을 명시적으로 활성화하지 않았습니다.
- `jwt.verify()`에서 기대 `issuer`와 허용 알고리즘 목록을 지정하지 않습니다. 서명과 만료 시간은 확인하지만 발급 시 넣은 `nodebird` issuer를 검증 조건으로 강제하지 않습니다.
- JWT에 audience, scope, 도메인 ID 또는 토큰 ID를 넣지 않으며 서버 측 토큰 폐기 목록도 없습니다.
- 도메인 host·type, 회원가입과 API 경로·본문에 대한 명시적 입력 검증과 정규화가 제한적입니다.
- 요청 속도 제한, 로그인 시도 제한, 토큰 발급 제한과 도메인 유형별 할당량이 없습니다.
- 내 게시물과 해시태그 게시물 API에 정렬·페이지네이션·응답 필드 제한이 없습니다.
- Nunjucks의 `autoescape`를 명시적으로 활성화하지 않은 상태에서 닉네임, host와 클라이언트 비밀값을 렌더링합니다.
- 카카오 프로필 전체, 게시물 조회 결과와 오류가 로그에 기록될 수 있어 이메일·SNS 식별자·게시물 등 개인정보가 노출될 수 있습니다.
- 로그인 오류 문구를 URL 쿼리에 넣어 브라우저 기록과 요청 로그에 남길 수 있습니다.
- `NODE_ENV=production`일 때만 오류 스택을 숨기며 보안 헤더와 콘텐츠 보안 정책이 없습니다.
- Docker, CI, 운영 프로세스, 모니터링과 배포 설정이 없습니다.

## 자격 증명 안전 요구사항

현재 `.env`가 Git에 추적되어 있고 `COOKIE_SECRET`, `KAKAO_ID`, `JWT_SECRET` 설정을 포함합니다. `config/config.json`의 개발 설정에도 비어 있지 않은 평문 DB 비밀번호가 있습니다. 실제 값은 이 README에 옮기지 않았으며, 추적된 비밀값은 현재 유효성 여부와 관계없이 노출된 것으로 취급해야 합니다.

안전한 공개·배포 전에 다음 조치가 필요합니다.

1. DB 자격 증명, 쿠키·세션 비밀값과 JWT 서명 값을 폐기·회전합니다. 세션 비밀값과 JWT 비밀값의 교체는 기존 세션과 토큰을 무효화합니다.
2. 데이터베이스 접근 기록·권한과 카카오 애플리케이션 설정을 점검하고, 실제 비밀값이 더 확인되면 함께 폐기·회전합니다.
3. `.env`와 설정 파일에서 비밀값을 제거하고 Git 추적을 해제한 뒤 승인된 비밀 관리 수단으로 전환합니다.
4. 원격 저장소, 브랜치, 태그와 Git 이력을 검사하고 필요한 경우 협업자와 조율한 승인 절차로 이력을 정리합니다.
5. 조치 후 현재 파일과 전체 이력을 재검사해 새 값이 저장소에 포함되지 않았는지 확인합니다.

Domain 클라이언트 비밀값은 별도로 사용 현황을 확인해야 합니다. 실제 서비스에서 사용된 값이라면 회전·폐기 수단을 먼저 구현한 뒤 기존 값을 교체하고, 클라이언트 이전과 접근 기록 점검을 수행해야 합니다.

## 라이선스

루트 `LICENSE`는 Unlicense 문구를 포함하지만 `package.json`의 `license` 값은 `UNLICENSED`입니다. 배포나 재사용 전에 저장소 소유자가 의도한 라이선스를 확인하고 두 메타데이터를 일치시켜야 합니다.
