# predictions/ — 블라인드 추정 기록·암호화 아카이브

소수 규칙 탐사 여정의 블라인드 추정치(사전 규칙·확정 시각 포함)를 해시와 함께 공개
기록하고, 실험 노트·코드 전체는 암호화 아카이브로 보존하는 디렉터리. 커밋 시각이
곧 타임스탬프 증거가 된다.

## 파일

- `expNN-predictions.json` — 실험별 블라인드 추정치·사전 등록 규칙·채점 요약.
- `*.sha256` — 각 파일의 SHA-256.
- `lab-vault.enc` — 실험 노트·코드(md·mjs) 40개 파일의 암호화 아카이브.
  AES-256-GCM, 포맷 `[12B iv][16B tag][ciphertext]`, 평문은 `{created, files:{이름:내용}}` JSON.
  **키는 저장소에 없다**(로컬 lab/VAULT-KEY.txt — 분실 시 복구 불가).

## 복호 방법 (키 보유 시)

```js
import { readFileSync, writeFileSync } from 'node:fs';
import { createDecipheriv } from 'node:crypto';
const raw = readFileSync('lab-vault.enc');
const key = Buffer.from(readFileSync('VAULT-KEY.txt', 'utf8').trim(), 'hex');
const d = createDecipheriv('aes-256-gcm', key, raw.subarray(0, 12));
d.setAuthTag(raw.subarray(12, 28));
const bundle = JSON.parse(Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString('utf8'));
for (const [name, content] of Object.entries(bundle.files)) writeFileSync(name, content);
```

기록일: 2026-07-27
