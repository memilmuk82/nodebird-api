# nodebird-api

PostgreSQL 연결 설정은 `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`,
`DB_PORT`, `DB_DIALECT` 환경 변수로 덮어쓸 수 있다. API 토큰은 등록된 도메인의
`Origin` 헤더와 클라이언트 비밀값이 모두 일치할 때만 발급한다.
웹 API 서버 만들기
