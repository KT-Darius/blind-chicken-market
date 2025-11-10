# 🐔 Blind Chicken Market

익명 기반 중고 경매 거래 플랫폼 (Full-Stack Project)

> **Blind Chicken Market**은 사용자가 익명으로 중고 상품을 등록하고, 입찰(경매) 또는 구매할 수 있는 웹 플랫폼입니다.
> 실무형 풀스택 경험을 목표로, 프론트엔드부터 백엔드, 배포까지 모두 구현합니다.

---

## 🚀 프로젝트 개요

| 항목       | 내용                                                |
| ---------- | --------------------------------------------------- |
| 프로젝트명 | Blind Chicken Market                                |
| 주제       | 익명 기반 중고 거래 및 경매 웹사이트                |
| 개발 기간  | 2025.10.31 ~ 2025.12.2                              |
| 목표       | 프론트엔드 + 백엔드 통합 전자상거래 프로토타입 완성 |
| 팀명       | Darius Team                                         |
| 배포 주소  | (추후 추가)                                         |

---

## 🧩 주요 기능

### ✅ 필수 기능

- 반응형 웹 디자인 (PC / 모바일)
- RESTful API 설계 및 구현
- 상품 등록 / 수정 / 삭제 / 조회 (CRUD)
- 사용자 회원가입 및 로그인 (NextAuth)
- Prisma ORM 기반 데이터베이스 연동
- TypeScript를 활용한 타입 안정성 확보

### 💎 추가 기능 (가산점)

- 상품 경매 시스템 (입찰, 남은 시간 표시, 낙찰 처리)
- 실시간 업데이트 (Socket.io or Pusher)
- 사용자 리뷰 및 평점
- 결제 및 주문 처리 (Toss, Stripe 등 연동)
- 관리자 페이지 (상품/회원 관리)
- 다크 모드 지원 / 반응형 디자인 / SEO 최적화

---

## 🧱 기술 스택

| 구분                | 사용 기술                                                  |
| ------------------- | ---------------------------------------------------------- |
| Frontend            | Next.js, TypeScript, Tailwind CSS, shadcn/ui, Axios        |
| Backend             | Spring Boot, STOMP (WebSocket), JPA (Java Persistence API) |
| DB                  | PostgreSQL                                                 |
| Server / Deployment | GitHub Actions, Jenkins, AWS EC2, AWS EKS                  |

---

## 🪜 개발 목표

- UI/UX 설계 및 반응형 구현
- RESTful API 설계 및 Prisma 기반 DB 구축
- 인증 / 권한 / 세션 관리
- 상품 등록 → 입찰 → 낙찰 → 결제 → 리뷰까지의 흐름 완성
- TypeScript로 안정적 코드베이스 유지

---

## 🧾 문서화

| 항목         | 설명                                 |
| ------------ | ------------------------------------ |
| README       | 프로젝트 개요 및 실행 방법           |
| API 문서     | Postman / Swagger 기반 API 명세      |
| ERD          | DB 관계 구조 (Prisma ERD or Draw.io) |
| 와이어프레임 | v0.dev / Figma 디자인 시안           |
| 시연 영상    | (추후 추가)                          |

---

## ⚙️ 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/KT-Darius/blind-chicken-market.git

# 2. 패키지 설치
npm install

# 3. 환경 변수 설정 (.env)
# 지금은 미완성이라 설정 x

NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=미정

# 5. 개발 서버 실행
npm run dev
```

---

## 🧑‍💻 팀 정보

| 이름   | 역할          | 담당                                                         |
| ------ | ------------- | ------------------------------------------------------------ |
| 남경진 | PM / Frontend | 프론트엔드 구조 설계, 주요 컴포넌트 구현, 상태 관리,문서정리 |
| 이유진 | Backend       | 실시간 경매 로직(WebSocket), 결제 프로세스, 서버 로직        |
| 정성훈 | Backend       | 인프라·CI/CD·보안(JWT/OAuth), 배포 자동화                    |
| 최태웅 | Frontend      | UI 컴포넌트 구현, 반응형 UX, 코드 품질 및 테스트             |

---

## 📜 GitHub 커밋

| prefix | 의미 |
| feat: | 새로운 기능 추가 |
| fix: | 버그 수정 |
| refactor: | 코드 구조 개선 (기능 변화 없음) |
| style: | 포맷팅, CSS, 세미콜론 등 스타일 변경 |
| chore: | 빌드, 설정, 의존성 등 기타 변경 |

---

## 🧹 Code Style

- 코드 포맷: **Prettier**
- 코드 규칙 검사: **ESLint**
- 저장 시 자동 정리 기능 활성화 (VSCode 권장)

---

## 🔖 참고 자료

- Tailwind CSS 설치 및 클래스
  https://tailwindcss.com/docs/installation/using-vite

- Shadcn/ui
  https://ui.shadcn.com/docs/installation/next
