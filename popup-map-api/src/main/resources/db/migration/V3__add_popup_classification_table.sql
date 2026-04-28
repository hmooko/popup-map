CREATE TABLE popup_classification (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    code VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uk_popup_classification_type_code ON popup_classification (type, code);
CREATE INDEX idx_popup_classification_type_sort_order ON popup_classification (type, sort_order, code);

ALTER TABLE popup
    ALTER COLUMN category TYPE VARCHAR(50),
    ALTER COLUMN region TYPE VARCHAR(50);

INSERT INTO popup_classification (type, code, label, sort_order)
VALUES
    ('REGION', 'SEONGSU', '성수', 10),
    ('REGION', 'HONGDAE', '홍대', 20),
    ('REGION', 'GANGNAM', '강남', 30),
    ('REGION', 'HANNAM', '한남', 40),
    ('REGION', 'JAMSIL', '잠실', 50),
    ('REGION', 'YEOUIDO', '여의도', 60),
    ('CATEGORY', 'FASHION', '패션', 10),
    ('CATEGORY', 'BEAUTY', '뷰티', 20),
    ('CATEGORY', 'CHARACTER', '캐릭터', 30),
    ('CATEGORY', 'FOOD', '푸드', 40),
    ('CATEGORY', 'BAKERY', '베이커리', 50),
    ('CATEGORY', 'ART', '아트', 60),
    ('CATEGORY', 'LIFESTYLE', '라이프스타일', 70),
    ('CATEGORY', 'TECH', '테크', 80);
