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
| `wrangler.jsonc` | Cloudflare Pages 설정 (`pages_build_output_dir: ./public`) |

빌드 단계 없음 — 정적 HTML 두 장이 전부이며 외부 의존성이 없다.
언어 전환 버튼은 우측 상단에 있고, 선택은 `localStorage(pf-lang)`에 저장되어 두 페이지가 공유한다.

## 로컬 미리보기

```bash
npx wrangler pages dev ./public
# 또는 아무 정적 서버: python -m http.server -d public 8000
```

## 배포 (Cloudflare Pages · GitHub 연동)

저장소: `github.com/boomdiboom/Primenumber_detector` — `main`에 push하면 자동 배포된다.

최초 1회 대시보드 연결 (이미 완료했다면 불필요):

1. Cloudflare 대시보드 → **Workers & Pages → Create → Pages → Connect to Git**
2. `Primenumber_detector` 저장소 선택
3. 빌드 설정: Framework preset **None**, Build command **(비움)**,
   Build output directory **`public`**, Production branch **`main`**
4. Save and Deploy → `https://<프로젝트명>.pages.dev` 발급

수동 배포가 필요하면 (Git 연동 없이):

```bash
npx wrangler pages deploy ./public --project-name=prime-flight
```
