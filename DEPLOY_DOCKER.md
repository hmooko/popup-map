# Docker 배포 가이드

## 1. 서버 준비

Oracle Cloud 인스턴스에 Docker와 Compose 플러그인을 설치한다.

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

설치 후 SSH를 다시 접속한다.

## 2. 환경변수 설정

```bash
cp .env.example .env
vi .env
```

반드시 변경할 값:

```text
POSTGRES_PASSWORD
ADMIN_JWT_SECRET
```

## 3. GitHub Actions 자동 배포

현재 GitHub Actions는 서버에 소스코드를 clone하지 않는다.

흐름:

```text
GitHub Actions에서 API Docker 이미지 빌드
GitHub Actions에서 DB Docker 이미지 빌드
Docker Hub에 push
서버 SSH 접속
서버에서 docker pull
DB 컨테이너가 없으면 생성
API 컨테이너 재실행
```

서버에는 최초 1회만 앱 디렉터리와 `.env`를 준비한다.

```bash
mkdir -p /home/ubuntu/popup-map
cd /home/ubuntu/popup-map
nano .env
```

`.env` 내용은 `.env.example`을 참고해서 직접 넣는다. 서버에 프로젝트를 clone하지 않는 방식이므로 `.env.example` 파일도 서버에 자동으로 생기지 않는다.

GitHub 저장소의 `Settings > Secrets and variables > Actions`에 다음 Secret을 등록한다.

```text
DOCKER_USERNAME: Docker Hub 사용자명
DOCKER_PASSWORD: Docker Hub access token 또는 비밀번호

OCI_HOST: 배포 서버 IP 또는 도메인
OCI_USERNAME: 배포 서버 SSH 사용자명
OCI_KEY: 배포 서버 private key
APP_DIR: 서버 .env가 있는 경로, 예: /home/ubuntu/popup-map
```

`main` 브랜치에 push하면 `popup-map-api:main`, `popup-map-db:main` 태그로 배포된다.

서버에서 로그 확인:

```bash
sudo docker logs -f popup-map-api
sudo docker logs -f popup-map-db
```

서버의 `.env`는 Git에 올리지 않고 서버에만 둔다.

## 4. Docker Compose 수동 실행

서버에 소스코드를 clone해서 직접 실행하고 싶을 때만 사용한다.

```bash
docker compose up -d --build
```

## 5. 관리자 계정 생성

로그인은 `admin_user` 테이블을 사용한다. `password_hash`에는 BCrypt 해시를 넣어야 한다.

임시로 API 컨테이너에서 BCrypt 해시를 만들 수 있다.

```bash
sudo docker exec -it popup-map-api jshell
```

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
new BCryptPasswordEncoder().encode("원하는_비밀번호");
```

생성된 해시를 DB에 넣는다.

```bash
sudo docker exec -it popup-map-db psql -U popup_map -d popup_map
```

```sql
INSERT INTO admin_user (email, password_hash, role)
VALUES ('admin@example.com', 'BCrypt_해시값', 'ADMIN');
```

## 6. 방화벽

Oracle Cloud 보안 목록과 서버 방화벽에서 외부 공개 포트는 필요한 것만 연다.

```text
22: SSH
80/443: Nginx를 둘 경우
8080: API 직접 공개 시
```

PostgreSQL `5432`는 외부에 열지 않는다.

## 7. 백업

```bash
sudo docker exec popup-map-db pg_dump -U popup_map popup_map > backup.sql
```
