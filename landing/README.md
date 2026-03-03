# TripMeet 랜딩페이지

TripMeet 앱의 공개 마케팅 페이지입니다.
순수 HTML/CSS 단일 파일로 구성되어 있으며, 빌드 과정 없이 바로 배포 가능합니다.

## 파일 구조

```
landing/
└── index.html   # 단일 파일 랜딩페이지 (외부 폰트 CDN 사용)
```

## 로컬 미리보기

별도 서버 없이 브라우저에서 직접 열기:

```bash
open landing/index.html
# 또는
xdg-open landing/index.html   # Linux
```

라이브 리로드가 필요할 경우:

```bash
npx serve landing
# 브라우저에서 http://localhost:3000 접속
```

## 배포 방법

### Render.com (권장 — 현재 설정)

프로젝트 루트의 `render.yaml`에 `tripmeet-landing` 서비스가 등록되어 있습니다.
`main` 브랜치에 푸시하면 Render가 자동으로 `landing/` 폴더를 정적 사이트로 배포합니다.

**최초 연결 시 Render 대시보드에서:**
1. New → Blueprint 선택
2. GitHub 저장소 연결
3. `render.yaml`이 자동 감지되어 두 서비스(API + 랜딩) 함께 생성됨

배포 완료 후 발급되는 URL 예시: `https://tripmeet-landing.onrender.com`

### 기타 무료 정적 호스팅

| 서비스 | 명령어 |
|--------|--------|
| Vercel | `npx vercel landing/` |
| Netlify | `netlify deploy --dir=landing` |
| GitHub Pages | Actions로 `landing/` 폴더 직접 게시 |

## 커스터마이징

`index.html` 내 수정이 필요한 항목:

| 항목 | 위치 | 설명 |
|------|------|------|
| App Store URL | `.btn-store` (href) | 앱 출시 후 실제 링크로 교체 |
| Google Play URL | `.btn-store` (href) | 앱 출시 후 실제 링크로 교체 |
| 통계 수치 | `.stat-num` | 실제 사용자 수로 업데이트 |
| 인기 여행지 수치 | `.dest-count` | 실제 데이터 연동 시 동적으로 변경 가능 |
| 색상 테마 | `:root` CSS 변수 | `--primary`, `--accent` 변경으로 전체 색상 일괄 수정 |

## 주요 색상 (CSS 변수)

```css
--primary: #FF4757   /* 메인 레드-코랄 */
--accent:  #FFA502   /* 강조 오렌지 */
--teal:    #1E90FF   /* 보조 블루 */
--dark:    #0F0F0F   /* 배경 다크 */
```
