# Popup Map API 명세서

## 1. 문서 개요

이 문서는 `PRD.md`를 기준으로 Popup Map MVP 구현에 필요한 API 요청/응답 형식, 인증, 에러 응답, enum 값을 정의한다.

## 2. 공통 규칙

### Base URL

```text
로컬: http://localhost:8080
운영: TBD
```

### API Prefix

```text
/api/v1
```

### Content-Type

```http
Content-Type: application/json
```

### 날짜 형식

날짜는 ISO-8601 형식의 `yyyy-MM-dd`를 사용한다.

```json
"startDate": "2026-04-24"
```

### 날짜/시간 형식

관리용 생성/수정 시각은 ISO-8601 date-time 형식을 사용한다.

```json
"createdAt": "2026-04-24T10:30:00"
```

### 좌표 형식

- 위도: `latitude`, `lat`
- 경도: `longitude`, `lng`
- 타입: `number`
- 위도 범위: `-90` 이상 `90` 이하
- 경도 범위: `-180` 이상 `180` 이하

## 3. 인증

### 공개 API

공개 API는 인증 없이 호출할 수 있다.

### 관리자 API

관리자 API는 인증된 관리자만 호출할 수 있다.

```http
Authorization: Bearer {accessToken}
```

인증 방식은 MVP에서는 JWT Bearer Token을 기준으로 한다.

## 4. 공통 응답

### 페이지 응답

목록 API는 다음 페이지 응답 형식을 사용한다.

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5,
  "first": true,
  "last": false
}
```

### 에러 응답

```json
{
  "timestamp": "2026-04-24T10:30:00",
  "status": 400,
  "code": "INVALID_REQUEST",
  "message": "요청 값이 올바르지 않습니다.",
  "errors": [
    {
      "field": "latitude",
      "message": "위도는 -90 이상 90 이하이어야 합니다."
    }
  ]
}
```

### 공통 에러 코드

| HTTP Status | Code | 설명 |
| --- | --- | --- |
| 400 | INVALID_REQUEST | 요청 값이 올바르지 않음 |
| 401 | UNAUTHORIZED | 인증이 필요함 |
| 403 | FORBIDDEN | 접근 권한이 없음 |
| 404 | NOT_FOUND | 리소스를 찾을 수 없음 |
| 409 | CONFLICT | 리소스 상태 충돌 |
| 500 | INTERNAL_SERVER_ERROR | 서버 내부 오류 |

## 5. Enum 정의

### Region

| 값 | 설명 |
| --- | --- |
| `SEONGSU` | 성수 |
| `HONGDAE` | 홍대 |
| `GANGNAM` | 강남 |
| `HANNAM` | 한남 |
| `JAMSIL` | 잠실 |
| `YEOUIDO` | 여의도 |

### Category

| 값 | 설명 |
| --- | --- |
| `FASHION` | 패션 |
| `BEAUTY` | 뷰티 |
| `CHARACTER` | 캐릭터 |
| `FOOD` | 푸드 |
| `BAKERY` | 베이커리 |
| `ART` | 아트 |
| `LIFESTYLE` | 라이프스타일 |
| `TECH` | 테크 |

### PopupStatus

| 값 | 설명 |
| --- | --- |
| `ONGOING` | 운영 중 |
| `UPCOMING` | 운영 전 |
| `CLOSING_SOON` | 종료 임박 |

### AdminRole

| 값 | 설명 |
| --- | --- |
| `ADMIN` | 관리자 |

## 6. 공개 API

## 6.1 팝업 목록 조회

사용자가 조건에 맞는 팝업 목록을 조회한다. 종료된 팝업과 비공개 팝업은 기본적으로 응답하지 않는다.

```http
GET /api/v1/popups
```

### Query Parameters

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `region` | `Region` | 아니오 | 없음 | 지역 필터 |
| `category` | `Category` | 아니오 | 없음 | 카테고리 필터 |
| `status` | `PopupStatus` | 아니오 | 없음 | 운영 상태 필터 |
| `reservationRequired` | `boolean` | 아니오 | 없음 | 예약 필요 여부 |
| `freeOnly` | `boolean` | 아니오 | `false` | 무료 입장 팝업만 조회 |
| `startDate` | `date` | 아니오 | 없음 | 조회 시작일 |
| `endDate` | `date` | 아니오 | 없음 | 조회 종료일 |
| `page` | `integer` | 아니오 | `0` | 페이지 번호 |
| `size` | `integer` | 아니오 | `20` | 페이지 크기 |

### 정렬 규칙

기본 정렬은 다음 순서를 따른다.

1. 현재 운영 중인 팝업 우선
2. 종료일이 빠른 팝업 우선
3. 생성일이 최신인 팝업 우선

### Request Example

```http
GET /api/v1/popups?region=SEONGSU&category=BEAUTY&freeOnly=true&page=0&size=20
```

### Response 200

```json
{
  "content": [
    {
      "id": 1,
      "title": "성수 뷰티 팝업",
      "brandName": "Brand A",
      "category": "BEAUTY",
      "region": "SEONGSU",
      "address": "서울특별시 성동구 성수동1가 123-45",
      "detailAddress": "1층 팝업존",
      "latitude": 37.5446,
      "longitude": 127.0557,
      "startDate": "2026-04-20",
      "endDate": "2026-05-05",
      "openingHours": "11:00-20:00",
      "reservationRequired": false,
      "freeAdmission": true,
      "entryFee": null,
      "thumbnailUrl": "https://example.com/images/popup-1.jpg"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

## 6.2 팝업 상세 조회

팝업 상세 정보를 조회한다. 비공개 팝업은 공개 API에서 조회할 수 없다.

```http
GET /api/v1/popups/{popupId}
```

### Path Parameters

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `popupId` | `long` | 예 | 팝업 ID |

### Response 200

```json
{
  "id": 1,
  "title": "성수 뷰티 팝업",
  "brandName": "Brand A",
  "description": "Brand A의 신제품을 체험할 수 있는 성수 팝업스토어입니다.",
  "category": "BEAUTY",
  "region": "SEONGSU",
  "address": "서울특별시 성동구 성수동1가 123-45",
  "detailAddress": "1층 팝업존",
  "latitude": 37.5446,
  "longitude": 127.0557,
  "startDate": "2026-04-20",
  "endDate": "2026-05-05",
  "openingHours": "11:00-20:00",
  "reservationRequired": false,
  "freeAdmission": true,
  "entryFee": null,
  "officialUrl": "https://example.com",
  "reservationUrl": null,
  "thumbnailUrl": "https://example.com/images/popup-1.jpg"
}
```

### Error

| HTTP Status | Code | 설명 |
| --- | --- | --- |
| 404 | NOT_FOUND | 팝업을 찾을 수 없음 |

## 6.3 지도 경계 내 팝업 조회

현재 지도 화면 경계 안에 있는 팝업을 조회한다. 지도 마커 표시에 필요한 최소 정보를 반환한다.

```http
GET /api/v1/popups/map
```

### Query Parameters

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `southWestLat` | `number` | 예 | 남서쪽 위도 |
| `southWestLng` | `number` | 예 | 남서쪽 경도 |
| `northEastLat` | `number` | 예 | 북동쪽 위도 |
| `northEastLng` | `number` | 예 | 북동쪽 경도 |

### Request Example

```http
GET /api/v1/popups/map?southWestLat=37.5300&southWestLng=127.0300&northEastLat=37.5700&northEastLng=127.0800
```

### Response 200

```json
[
  {
    "id": 1,
    "title": "성수 뷰티 팝업",
    "brandName": "Brand A",
    "category": "BEAUTY",
    "region": "SEONGSU",
    "latitude": 37.5446,
    "longitude": 127.0557,
    "startDate": "2026-04-20",
    "endDate": "2026-05-05",
    "reservationRequired": false,
    "freeAdmission": true,
    "thumbnailUrl": "https://example.com/images/popup-1.jpg"
  }
]
```

## 6.4 근처 팝업 조회

클라이언트가 전달한 좌표와 반경을 기준으로 가까운 팝업을 거리순으로 조회한다.

```http
GET /api/v1/popups/nearby
```

### Query Parameters

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `lat` | `number` | 예 | 없음 | 기준 위도 |
| `lng` | `number` | 예 | 없음 | 기준 경도 |
| `radiusMeter` | `integer` | 아니오 | `3000` | 조회 반경, 미터 단위 |

### 제약

- `radiusMeter`는 `100` 이상 `10000` 이하를 권장한다.
- 응답은 거리 오름차순으로 정렬한다.

### Request Example

```http
GET /api/v1/popups/nearby?lat=37.5446&lng=127.0557&radiusMeter=3000
```

### Response 200

```json
[
  {
    "id": 1,
    "title": "성수 뷰티 팝업",
    "brandName": "Brand A",
    "category": "BEAUTY",
    "region": "SEONGSU",
    "address": "서울특별시 성동구 성수동1가 123-45",
    "detailAddress": "1층 팝업존",
    "latitude": 37.5446,
    "longitude": 127.0557,
    "startDate": "2026-04-20",
    "endDate": "2026-05-05",
    "reservationRequired": false,
    "freeAdmission": true,
    "thumbnailUrl": "https://example.com/images/popup-1.jpg",
    "distanceMeter": 120
  }
]
```

## 7. 관리자 API

## 7.1 팝업 등록

관리자가 새 팝업을 등록한다.

```http
POST /api/v1/admin/popups
```

### Headers

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### Request Body

```json
{
  "title": "성수 뷰티 팝업",
  "brandName": "Brand A",
  "description": "Brand A의 신제품을 체험할 수 있는 성수 팝업스토어입니다.",
  "category": "BEAUTY",
  "region": "SEONGSU",
  "address": "서울특별시 성동구 성수동1가 123-45",
  "detailAddress": "1층 팝업존",
  "latitude": 37.5446,
  "longitude": 127.0557,
  "startDate": "2026-04-20",
  "endDate": "2026-05-05",
  "openingHours": "11:00-20:00",
  "reservationRequired": false,
  "freeAdmission": true,
  "entryFee": null,
  "officialUrl": "https://example.com",
  "reservationUrl": null,
  "thumbnailUrl": "https://example.com/images/popup-1.jpg",
  "visible": true
}
```

### Request Fields

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `title` | `string` | 예 | 팝업명 |
| `brandName` | `string` | 예 | 브랜드명 |
| `description` | `string` | 아니오 | 소개 문구 |
| `category` | `Category` | 예 | 카테고리 |
| `region` | `Region` | 예 | 지역 |
| `address` | `string` | 예 | 주소 |
| `detailAddress` | `string` | 아니오 | 상세 주소 |
| `latitude` | `number` | 예 | 위도 |
| `longitude` | `number` | 예 | 경도 |
| `startDate` | `date` | 예 | 운영 시작일 |
| `endDate` | `date` | 예 | 운영 종료일 |
| `openingHours` | `string` | 예 | 운영 시간 |
| `reservationRequired` | `boolean` | 예 | 예약 필요 여부 |
| `freeAdmission` | `boolean` | 예 | 무료 입장 여부 |
| `entryFee` | `integer` | 아니오 | 입장료, 무료이면 `null` |
| `officialUrl` | `string` | 아니오 | 공식 링크 |
| `reservationUrl` | `string` | 아니오 | 예약 링크 |
| `thumbnailUrl` | `string` | 아니오 | 대표 이미지 URL |
| `visible` | `boolean` | 아니오 | 공개 여부, 기본값 `true` |

### Validation

- `title`, `brandName`, `address`, `openingHours`는 공백일 수 없다.
- `startDate`는 `endDate`보다 늦을 수 없다.
- `freeAdmission`이 `true`이면 `entryFee`는 `null` 또는 `0`이어야 한다.
- `freeAdmission`이 `false`이면 `entryFee`는 `0` 이상이어야 한다.
- URL 필드는 유효한 URL 형식이어야 한다.
- `reservationRequired`가 `true`이면 `reservationUrl` 입력을 권장한다.

### Response 201

```json
{
  "id": 1,
  "title": "성수 뷰티 팝업",
  "brandName": "Brand A",
  "description": "Brand A의 신제품을 체험할 수 있는 성수 팝업스토어입니다.",
  "category": "BEAUTY",
  "region": "SEONGSU",
  "address": "서울특별시 성동구 성수동1가 123-45",
  "detailAddress": "1층 팝업존",
  "latitude": 37.5446,
  "longitude": 127.0557,
  "startDate": "2026-04-20",
  "endDate": "2026-05-05",
  "openingHours": "11:00-20:00",
  "reservationRequired": false,
  "freeAdmission": true,
  "entryFee": null,
  "officialUrl": "https://example.com",
  "reservationUrl": null,
  "thumbnailUrl": "https://example.com/images/popup-1.jpg",
  "visible": true,
  "createdAt": "2026-04-24T10:30:00",
  "updatedAt": "2026-04-24T10:30:00"
}
```

## 7.2 팝업 수정

관리자가 기존 팝업 정보를 부분 수정한다.

```http
PATCH /api/v1/admin/popups/{popupId}
```

### Path Parameters

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `popupId` | `long` | 예 | 팝업 ID |

### Request Body

수정할 필드만 전달한다.

```json
{
  "title": "성수 뷰티 팝업 리뉴얼",
  "endDate": "2026-05-10",
  "openingHours": "10:00-21:00",
  "reservationRequired": true,
  "reservationUrl": "https://example.com/reservation"
}
```

### Response 200

```json
{
  "id": 1,
  "title": "성수 뷰티 팝업 리뉴얼",
  "brandName": "Brand A",
  "description": "Brand A의 신제품을 체험할 수 있는 성수 팝업스토어입니다.",
  "category": "BEAUTY",
  "region": "SEONGSU",
  "address": "서울특별시 성동구 성수동1가 123-45",
  "detailAddress": "1층 팝업존",
  "latitude": 37.5446,
  "longitude": 127.0557,
  "startDate": "2026-04-20",
  "endDate": "2026-05-10",
  "openingHours": "10:00-21:00",
  "reservationRequired": true,
  "freeAdmission": true,
  "entryFee": null,
  "officialUrl": "https://example.com",
  "reservationUrl": "https://example.com/reservation",
  "thumbnailUrl": "https://example.com/images/popup-1.jpg",
  "visible": true,
  "createdAt": "2026-04-24T10:30:00",
  "updatedAt": "2026-04-24T11:00:00"
}
```

### Error

| HTTP Status | Code | 설명 |
| --- | --- | --- |
| 400 | INVALID_REQUEST | 수정 요청 값이 올바르지 않음 |
| 404 | NOT_FOUND | 팝업을 찾을 수 없음 |

## 7.3 팝업 삭제

관리자가 팝업을 삭제한다.

```http
DELETE /api/v1/admin/popups/{popupId}
```

### Path Parameters

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `popupId` | `long` | 예 | 팝업 ID |

### Response 204

응답 body 없음.

### Error

| HTTP Status | Code | 설명 |
| --- | --- | --- |
| 404 | NOT_FOUND | 팝업을 찾을 수 없음 |

## 7.4 팝업 공개 상태 변경

관리자가 팝업 공개 여부를 변경한다.

```http
PATCH /api/v1/admin/popups/{popupId}/visibility
```

### Path Parameters

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `popupId` | `long` | 예 | 팝업 ID |

### Request Body

```json
{
  "visible": false
}
```

### Response 200

```json
{
  "id": 1,
  "visible": false,
  "updatedAt": "2026-04-24T11:10:00"
}
```

## 8. 관리자 인증 API

PRD에는 명시되어 있지 않지만 관리자 API 사용을 위해 MVP에서 필요한 최소 인증 API를 정의한다.

## 8.1 관리자 로그인

```http
POST /api/v1/admin/auth/login
```

### Request Body

```json
{
  "email": "admin@example.com",
  "password": "password1234"
}
```

### Response 200

```json
{
  "accessToken": "jwt-access-token",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

### Error

| HTTP Status | Code | 설명 |
| --- | --- | --- |
| 401 | UNAUTHORIZED | 이메일 또는 비밀번호가 올바르지 않음 |

## 9. DTO 요약

### PopupListItemResponse

| 필드 | 타입 |
| --- | --- |
| `id` | `long` |
| `title` | `string` |
| `brandName` | `string` |
| `category` | `Category` |
| `region` | `Region` |
| `address` | `string` |
| `detailAddress` | `string \| null` |
| `latitude` | `number` |
| `longitude` | `number` |
| `startDate` | `date` |
| `endDate` | `date` |
| `openingHours` | `string` |
| `reservationRequired` | `boolean` |
| `freeAdmission` | `boolean` |
| `entryFee` | `integer \| null` |
| `thumbnailUrl` | `string \| null` |

### PopupDetailResponse

`PopupListItemResponse` 필드에 다음 필드를 추가한다.

| 필드 | 타입 |
| --- | --- |
| `description` | `string \| null` |
| `officialUrl` | `string \| null` |
| `reservationUrl` | `string \| null` |

### PopupMapItemResponse

| 필드 | 타입 |
| --- | --- |
| `id` | `long` |
| `title` | `string` |
| `brandName` | `string` |
| `category` | `Category` |
| `region` | `Region` |
| `latitude` | `number` |
| `longitude` | `number` |
| `startDate` | `date` |
| `endDate` | `date` |
| `reservationRequired` | `boolean` |
| `freeAdmission` | `boolean` |
| `thumbnailUrl` | `string \| null` |

### NearbyPopupResponse

`PopupMapItemResponse` 필드에 다음 필드를 추가한다.

| 필드 | 타입 |
| --- | --- |
| `address` | `string` |
| `detailAddress` | `string \| null` |
| `distanceMeter` | `integer` |

### AdminPopupResponse

`PopupDetailResponse` 필드에 다음 필드를 추가한다.

| 필드 | 타입 |
| --- | --- |
| `visible` | `boolean` |
| `createdAt` | `date-time` |
| `updatedAt` | `date-time` |

## 10. 구현 메모

- 위치 검색은 PostGIS의 `location` 컬럼과 공간 인덱스를 기준으로 구현한다.
- 지도 경계 조회는 bounding box 조건을 사용한다.
- 근처 팝업 조회는 반경 조건과 거리 정렬을 함께 적용한다.
- 공개 API는 `visible = true`이고 종료되지 않은 팝업만 기본 조회한다.
- 관리자 삭제는 MVP에서는 hard delete로 정의하되, 운영 단계에서는 soft delete 전환을 검토한다.
- 이미지 업로드 API는 MVP 범위에서 제외하고 `thumbnailUrl` 직접 입력 방식으로 시작한다.
