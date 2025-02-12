# Express Boilerplate

Express.js 기반의 타입스크립트 보일러플레이트 프로젝트입니다.

## 기술 스택

### Runtime & Package Manager
- Node.js: 20.12.1
- Yarn: 1.22.22

### Core Dependencies
- Express.js: ^4.18.3
- TypeScript: ^5.4.2
- TypeORM: ^0.3.20
- Inversify: ^6.0.2
- Winston: ^3.12.0

## 프로젝트 구조
```
src/
├── configs/           # 앱 설정 (cors, database 등)
├── containers/        # Inversify DI 컨테이너
│   └── symbols/      # DI 심볼 정의
├── data/
│   ├── entities/     # TypeORM 엔티티
│   └── repositories/ # 리포지토리 클래스
├── docs/             # Swagger API 문서
├── loaders/          # 앱 초기화 로더
├── types/            # 타입 정의
└── utils/            # 유틸리티 (로거 등)
```

## 주요 기능
- 📝 TypeScript 기반 타입 안정성
- 🎯 Inversify를 통한 의존성 주입
- 🗃️ TypeORM을 이용한 데이터베이스 관리
- 🔒 CORS 설정 및 보안
- 📊 Winston 기반 로깅 시스템
- 📚 Swagger를 통한 API 문서화

## 데이터베이스 스키마(Example)

### Post 테이블
```sql
CREATE TABLE post_mysql_entity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Comment 테이블
```sql
CREATE TABLE comment_mysql_entity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    post_id INT NOT NULL,
    CONSTRAINT fk_comment_post 
        FOREIGN KEY (post_id) 
        REFERENCES post_mysql_entity(id)
        ON DELETE CASCADE
);
```

## 시작하기

### 설치
```bash
yarn install
```

### 환경 설정
1. `.env.sample`을 `.env`로 복사
2. 환경 변수 설정

### 개발 서버 실행
```bash
yarn dev
```

### 빌드
```bash
yarn build
```

### 프로덕션 실행
```bash
yarn start
```

## API 문서
프로젝트의 API 문서는 Swagger를 통해 관리됩니다.

### Swagger UI 접속
개발 서버 실행 후 아래 URL에서 API 문서를 확인할 수 있습니다:
```
http://localhost:3000/api-docs
```

### API 문서 업데이트
- API 문서는 `/src/docs` 디렉토리에서 관리됩니다.
- 새로운 API 엔드포인트 추가 시 해당 문서도 함께 업데이트해주세요.

## 라이선스
MIT License

