# 소수 탐사 비행체 · Prime Flight

"소수 q의 다음 소수는 어디까지 가면 반드시 있는가"라는 질문을 동역학계로 번역한
인터랙티브 에세이. 창 `[x, x+w]` 안에 소수가 없으면 추락하는 비행체가, 쌍둥이 소수를
계기로 읽고 거듭제곱으로 자기 고도를 측정하며 실제 소수 3×10⁷ 구간을 브라우저에서 비행한다.

An interactive essay that translates the prime-gap question into a dynamical system.
The page sieves real primes up to 3×10⁷ in the browser and flies the v4.1 craft over them.

## 구성

| 경로 | 내용 |
|---|---|
| `public/index.html` | 인터랙티브 항행일지 (시뮬레이터 + 에세이, 한/영 전환) |
| `public/report.html` | 설계와 실험 보고서 v4.1 전문 (한/영 전환) |
| `소수탐사비행체_설계와_실험_보고서_5.md` | 보고서 마크다운 원본 (배포 제외) |
| `wrangler.jsonc` | Cloudflare Workers 정적 에셋 설정 (`assets.directory: ./public`) |
| `tools/desert-flight.mjs` | 신규 기록 사막(1676·1854) 세그먼트 비행 재현 스크립트 (`node tools/desert-flight.mjs`) |

빌드 단계 없음 — 정적 HTML 두 장이 전부이며 외부 의존성이 없다.
언어 전환 버튼은 우측 상단에 있고, 선택은 `localStorage(pf-lang)`에 저장되어 두 페이지가 공유한다.

**안전 설계**: 이 사이트는 아무 파일도 다운로드하지 않고 어떤 데이터도 전송하지 않는다.
첫 방문 시 소개 게이트가 표시되며, [시뮬레이션 시작]을 눌러야만 소수 계산이 브라우저 안에서
실행된다(동의는 `localStorage(pf-run)`에 저장되어 재방문 시 게이트 생략). 서버는
CSP(`default-src 'none'` + connect 차단)로 페이지의 외부 요청 자체를 차단한다.

## 로컬 미리보기

```bash
npx wrangler dev
# 또는 아무 정적 서버: python -m http.server -d public 8000
```

## 배포 (Cloudflare Workers · GitHub 연동)

사이트: **<https://prime.jeongjuhaeng.net>** (커스텀 도메인, wrangler.jsonc의 `routes`로 선언)

저장소: `github.com/boomdiboom/Primenumber_detector` —
Cloudflare 대시보드의 Git 연동(Workers Builds, 서비스명 `primenumberdetector`)이
`main`에 push할 때마다 `wrangler deploy`를 실행해 `public/`을 정적 에셋으로 자동 배포한다.
기본 URL(`https://primenumberdetector.<계정 서브도메인>.workers.dev`)은
대시보드 → Workers & Pages → `primenumberdetector`에서 확인.

수동 배포가 필요하면 (Git 연동 없이):

```bash
npx wrangler deploy
```
