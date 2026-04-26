package com.example.popupmapapi.popup.service;

import com.example.popupmapapi.common.error.BusinessException;
import com.example.popupmapapi.common.error.ErrorCode;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class KakaoGeocodingService implements GeocodingService {

    private final RestClient restClient;
    private final String restApiKey;

    public KakaoGeocodingService(KakaoLocalProperties properties) {
        this.restClient = RestClient.builder().baseUrl(properties.baseUrl()).build();
        this.restApiKey = properties.restApiKey();
    }

    @Override
    public GeocodingResult geocodeAddress(String address) {
        if (!StringUtils.hasText(restApiKey)) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "카카오 로컬 API 키가 설정되지 않았습니다.");
        }

        try {
            KakaoAddressSearchResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v2/local/search/address.json")
                            .queryParam("query", address)
                            .build())
                    .header(HttpHeaders.AUTHORIZATION, "KakaoAK " + restApiKey)
                    .retrieve()
                    .body(KakaoAddressSearchResponse.class);

            if (response == null || response.documents() == null || response.documents().isEmpty()) {
                throw new BusinessException(ErrorCode.INVALID_REQUEST, "입력한 주소로 위치를 찾을 수 없습니다.");
            }

            KakaoAddressDocument document = response.documents().getFirst();
            return new GeocodingResult(new BigDecimal(document.y()), new BigDecimal(document.x()));
        } catch (BusinessException exception) {
            throw exception;
        } catch (RestClientException | NumberFormatException exception) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "주소 좌표 변환 중 오류가 발생했습니다.");
        }
    }

    private record KakaoAddressSearchResponse(List<KakaoAddressDocument> documents) {
    }

    private record KakaoAddressDocument(String x, String y) {
    }
}
