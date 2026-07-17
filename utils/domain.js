const normalizeHost = (value) => {
    const normalized = String(value || '').trim();
    if (!normalized) {
        return '';
    }
    try {
        const parsed = new URL(normalized);
        if (parsed.host) {
            return parsed.host.toLowerCase();
        }
    } catch (error) {
        // 프로토콜 없는 host 값은 아래 공통 처리로 정규화한다.
    }
    return normalized.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
};

const isAllowedOrigin = (registeredHost, requestOrigin) => {
    const normalizedOrigin = normalizeHost(requestOrigin);
    return Boolean(normalizedOrigin) && normalizedOrigin === normalizeHost(registeredHost);
};

module.exports = { isAllowedOrigin, normalizeHost };
