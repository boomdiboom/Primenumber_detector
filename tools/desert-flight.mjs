// 신규 기록 사막 2곳 세그먼트 비행 — v4.5 인증 기체 (증명 바닥 + 최초교차 경보)
// 소수판정: 결정적 Miller–Rabin (밑 2..37, n < 3.317×10²⁴에서 결정적) — 원 실험의 C 구간 체와 독립된 구현
// 실행: node tools/desert-flight.mjs

const RECORDS = [
  { name: '1676 @ 2.07x10^19 (83rd)', p: 20733746510561442863n, gap: 1676 },
  { name: '1854 @ 1.01x10^20 (85th)', p: 101412319996363309069n, gap: 1854 },
];
const APPROACH = 120000; // 접근 활주로 (~57·ln²p)
const TAIL = 20000;

// ── 결정적 Miller–Rabin ──────────────────────────────
const MR_BASES = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
function modpow(b, e, m) { let r = 1n; b %= m; while (e > 0n) { if (e & 1n) r = r * b % m; b = b * b % m; e >>= 1n; } return r; }
function isPrimeBig(n) {
  if (n < 2n) return false;
  for (const p of MR_BASES) { if (n === p) return true; if (n % p === 0n) return false; }
  let d = n - 1n, s = 0n; while (!(d & 1n)) { d >>= 1n; s++; }
  outer: for (const a of MR_BASES) {
    let x = modpow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    for (let i = 1n; i < s; i++) { x = x * x % n; if (x === n - 1n) continue outer; }
    return false;
  }
  return true;
}

// ── 세그먼트 소수 비트맵 [base, base+len) ─────────────
function smallPrimes(limit) {
  const s = new Uint8Array(limit + 1); const out = [];
  for (let i = 2; i <= limit; i++) if (!s[i]) { out.push(i); for (let j = i * i; j <= limit; j += i) s[j] = 1; }
  return out;
}
function sieveSegment(base, len) {
  const isP = new Uint8Array(len);
  const baseOdd = (base & 1n) === 1n;
  for (let i = 0; i < len; i++) isP[i] = (baseOdd ? i % 2 === 0 : i % 2 === 1) ? 1 : 0;
  for (const q of smallPrimes(1_000_000)) {
    if (q === 2) continue;
    const qB = BigInt(q);
    let st = Number((qB - base % qB) % qB);
    for (let j = st; j < len; j += q) isP[j] = 0;
  }
  let mrCount = 0, primes = 0;
  for (let i = 0; i < len; i++) if (isP[i]) {
    mrCount++;
    if (isPrimeBig(base + BigInt(i))) primes++; else isP[i] = 0;
  }
  return { isP, mrCount, primes };
}

// 거듭제곱(m^k, k>=2)이 세그먼트에 없는지 확인 → 눈 발화 불가 검증
function isqrt(n) { if (n < 2n) return n; let x = n, y = (x + 1n) >> 1n; while (y < x) { x = y; y = (x + n / x) >> 1n; } return x; }
function powerInSegment(base, len) {
  const end = base + BigInt(len);
  for (let k = 2n; k <= 70n; k++) {
    // m = floor(end^(1/k)) 근방 탐색 (작은 k만 의미 있음)
    let m = 2n, hi = isqrt(end) + 2n;
    if (k > 2n) { // 대략적 k제곱근: 이분 탐색
      let lo = 1n; hi = 1n << (BigInt(70) / k + 2n);
      while (lo < hi) { const mid = (lo + hi + 1n) >> 1n; let v = 1n, ok = true; for (let i = 0n; i < k; i++) { v *= mid; if (v > end) { ok = false; break; } } if (ok) lo = mid; else hi = mid - 1n; }
      m = lo;
    } else m = isqrt(end);
    for (let c = m - 1n; c <= m + 1n; c++) {
      if (c < 2n) continue;
      let v = 1n; for (let i = 0n; i < k; i++) v *= c;
      if (v >= base && v < end) return { m: c, k };
    }
    if (k > 2n && m <= 2n) break;
  }
  return null;
}

// ── v4.5 인증 기체 세그먼트 비행 (offset 좌표계, 눈 없음 — 세그먼트에 거듭제곱 없음 확인) ──
function fly(rec, rate) {
  const base = rec.p - BigInt(APPROACH);
  const len = APPROACH + rec.gap + TAIL;
  const { isP, mrCount, primes } = sieveSegment(base, len);
  const pOff = APPROACH, gapEnd = APPROACH + rec.gap;

  // 간격 자체 재검증
  if (!isP[pOff]) throw new Error(rec.name + ': p가 소수가 아님!');
  if (!isP[gapEnd]) throw new Error(rec.name + ': p+gap이 소수가 아님!');
  for (let i = pOff + 1; i < gapEnd; i++) if (isP[i]) throw new Error(rec.name + ': 간격 내부에 소수 존재 @ +' + (i - pOff));

  const pw = powerInSegment(base, len);
  if (pw) console.log('  주의: 세그먼트 내 거듭제곱 존재', pw);

  const lnx = Math.log(Number(rec.p));
  const pf = Math.round(0.87 * lnx * lnx) & ~1; // 증명 바닥 (세그먼트에서 ln 변화 ~1e-15, 상수 취급)
  let x = 0, w = pf, floor = pf;
  let deaths = 0, geoSteps = 0, maxW = w, slackAtCross = null, latched = false, steps = 0;

  const count = (lo, hi) => { let P = 0, R = -1; for (let i = Math.max(0, lo); i <= hi && i < len; i++) if (isP[i]) { P++; R = i; } return { P, R }; };
  const countT = (lo, hi) => { // 성단 센서: 쌍(p,p+2), 창 안 (p-6,p-4) 쌍 존재 시 억제
    let T = 0;
    for (let i = Math.max(0, lo); i + 2 <= hi && i + 2 < len; i++)
      if (isP[i] && isP[i + 2]) { if (!(i - 6 >= lo && i - 6 >= 0 && isP[i - 6] && isP[i - 4])) T++; }
    return T;
  };

  while (x < gapEnd + 4000) {
    const { P, R } = count(x, x + w);
    if (P === 0) { deaths++; break; }
    const T = countT(x, x + w);
    let dw = T === 0 ? 2 : T === 1 ? 0 : -2;
    let emerg = false;
    if (P <= 0.33 * 0.87 * lnx) emerg = true;
    const geoCond = R < 0 || (R - x) <= 0.75 * w;
    if (geoCond && !latched) latched = true;          // 최초 교차 래치 (초기 참이면 즉시)
    if (!geoCond) latched = false;                     // R > x+3w/4 회복 시 해제
    if (latched) { emerg = true; geoSteps++; }
    if (emerg) { const k = Math.max(4, Math.floor(w * (rate - 1))); dw = (k + 1) & ~1; }
    x += 2; w += dw;
    if (w < floor) w = floor;                          // 증명 바닥 최종 강제 (floor = pf, 눈 없음)
    if (maxW < w) maxW = w;
    if (slackAtCross === null && x > pOff) slackAtCross = (x + w) - gapEnd;
    steps++;
    if (steps > 400000) throw new Error('step overflow');
  }
  return { pf, maxW, geoSteps, deaths, slackAtCross, steps, primes, mrCount, len };
}

for (const rec of RECORDS) {
  console.log('══ ' + rec.name + ' — 깊이 ' + (rec.gap / Math.log(Number(rec.p)) ** 2).toFixed(4));
  console.log('   간격 재검증: 끝점 2개 소수 + 내부 ' + (rec.gap - 1) + '개 합성수 확인 (결정적 MR)');
  for (const rate of [1.045, 1.07]) {
    const t0 = Date.now();
    const r = fly(rec, rate);
    console.log(`   r=${rate}: ${r.deaths === 0 ? '생존' : '사망!'} | 증명 바닥 ${r.pf} | 최대 고도 ${r.maxW} | 기하 경보 ${r.geoSteps}스텝 | 통과 여유 ${r.slackAtCross}칸 | ${r.steps}스텝, 세그먼트 ${r.len} (소수 ${r.primes}개, MR ${r.mrCount}회) | ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
}
