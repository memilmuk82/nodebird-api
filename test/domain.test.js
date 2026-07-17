const test = require('node:test');
const assert = require('node:assert/strict');

const { isAllowedOrigin, normalizeHost } = require('../utils/domain');

test('도메인 값을 비교 가능한 호스트로 정규화한다', () => {
    assert.equal(normalizeHost('https://Example.com:4000/'), 'example.com:4000');
    assert.equal(normalizeHost('example.com:4000/'), 'example.com:4000');
});

test('등록된 도메인과 요청 Origin이 일치할 때만 허용한다', () => {
    assert.equal(isAllowedOrigin('example.com', 'https://example.com'), true);
    assert.equal(isAllowedOrigin('example.com', 'https://attacker.example'), false);
    assert.equal(isAllowedOrigin('example.com', ''), false);
});
