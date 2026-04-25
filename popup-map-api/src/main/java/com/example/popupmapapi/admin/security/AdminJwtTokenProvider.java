package com.example.popupmapapi.admin.security;

import com.example.popupmapapi.admin.domain.AdminRole;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminJwtTokenProvider {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final String JWT_ALGORITHM = "HS256";
    private static final String TOKEN_TYPE = "JWT";
    private static final String ISSUER = "popup-map-api";

    private final AdminSecurityProperties properties;
    private final ObjectMapper objectMapper;

    public String createToken(String email) {
        Instant now = Instant.now();
        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", JWT_ALGORITHM);
        header.put("typ", TOKEN_TYPE);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("iss", ISSUER);
        payload.put("sub", email);
        payload.put("role", AdminRole.ADMIN.name());
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", now.plusSeconds(properties.expiresIn()).getEpochSecond());

        String headerPart = encodeJson(header);
        String payloadPart = encodeJson(payload);
        String unsignedToken = headerPart + "." + payloadPart;
        return unsignedToken + "." + sign(unsignedToken);
    }

    public boolean isValidAdminToken(String token) {
        return getValidAdminEmail(token).isPresent();
    }

    public Optional<String> getValidAdminEmail(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return Optional.empty();
            }
            String unsignedToken = parts[0] + "." + parts[1];
            if (!constantTimeEquals(sign(unsignedToken), parts[2])) {
                return Optional.empty();
            }

            Map<String, Object> header = decodeJson(parts[0]);
            Map<String, Object> payload = decodeJson(parts[1]);
            if (JWT_ALGORITHM.equals(header.get("alg"))
                    && TOKEN_TYPE.equals(header.get("typ"))
                    && ISSUER.equals(payload.get("iss"))
                    && AdminRole.ADMIN.name().equals(payload.get("role"))
                    && !isExpired(payload.get("exp"))
                    && payload.get("sub") instanceof String email
                    && !email.isBlank()) {
                return Optional.of(email);
            }
            return Optional.empty();
        } catch (RuntimeException exception) {
            return Optional.empty();
        }
    }

    public long expiresIn() {
        return properties.expiresIn();
    }

    private boolean isExpired(Object exp) {
        if (!(exp instanceof Number expNumber)) {
            return true;
        }
        return Instant.now().getEpochSecond() >= expNumber.longValue();
    }

    private String encodeJson(Map<String, Object> value) {
        try {
            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(objectMapper.writeValueAsBytes(value));
        } catch (Exception exception) {
            throw new IllegalStateException("JWT JSON 직렬화에 실패했습니다.", exception);
        }
    }

    private Map<String, Object> decodeJson(String value) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(value);
            return objectMapper.readValue(decoded, new TypeReference<>() {
            });
        } catch (Exception exception) {
            throw new IllegalArgumentException("JWT JSON 파싱에 실패했습니다.", exception);
        }
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(properties.jwtSecret().getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("JWT 서명 생성에 실패했습니다.", exception);
        }
    }

    private boolean constantTimeEquals(String expected, String actual) {
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                actual.getBytes(StandardCharsets.UTF_8)
        );
    }
}
