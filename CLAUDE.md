# CLAUDE.md — Prime Flight 프로젝트 규칙

## 커밋 규칙 (중요)

- **`lab/` 이하와 `소수의규칙을찾을수있는가.md`는 어떤 경우에도 커밋·push하지 않는다.**
  소수 규칙 탐사 여정의 산출물(스크립트·데이터·노트)은 전부 `lab/` 디렉터리에 만든다.
  `.gitignore`가 막고 있지만, 새 탐사 파일을 루트에 만들지 말 것.
- push는 곧 라이브 배포다: `main`에 push하면 Cloudflare Workers Builds가
  `public/`을 https://prime.jeongjuhaeng.net 에 자동 배포한다.
  **사이트·보고서 관련 변경만 커밋한다.**

## 배포 구조 요약

- `public/` = 배포 루트 (index.html 에세이+시뮬레이터, report.html 보고서 v4.5, 한/영 이중언어)
- 저장소: github.com/boomdiboom/Primenumber_detector → Workers 서비스 `primenumberdetector`
- `_headers`에 CSP(`default-src 'none'`) — 외부 리소스(스크립트·폰트·fetch) 추가 시 CSP부터 갱신

## 탐사 도구 관례

- 큰 수(>2⁶⁴) 소수 실험은 `tools/desert-flight.mjs` 패턴 재사용:
  결정적 Miller–Rabin(밑 2~37, n < 3.3×10²⁴에서 결정적) + 소소수(<10⁶) 세그먼트 사전 체질,
  위치는 BigInt base + Number offset 좌표계.
- 실험 결과를 보고서에 기록할 때는 방법·환경을 명시하고, 미수행 실험을 수행한 것처럼 쓰지 않는다.
