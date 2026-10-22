# noslopdesign

[English](README.md) | **한국어**

코딩 에이전트가 "AI가 만든 티 나는 페이지"를 내놓지 않게 하는 Agent Skill 두 개입니다. 가운데 정렬
헤드라인, 보라에서 파랑으로 가는 그라데이션, 아이콘 카드 세 개, 근거 없는 "10,000+ 팀이 사용 중" 같은
것들이요. 평소처럼 요청하면 에이전트가 방향을 정하고, 실제 콘텐츠와 에셋으로 만들고, 실제 브라우저에서
결과를 확인한 뒤에야 끝났다고 말합니다.

```text
$noslop-frontend SaaS 홈페이지 멋있게 만들어줘
$noslop-frontend 이 대시보드 너무 AI 같아, 고쳐줘
$noslop-frontend 랜딩페이지 모바일에서 깨지는 거 잡아줘
$noslop-uiux 가계부 앱 만들기 전에 브랜드 방향부터 잡아줘
```

이름을 부르지 않아도 됩니다. "SaaS 홈페이지 만들어줘", "리디자인", "멋있게" 같은 요청이면 스킬 설명이
알아서 걸립니다. 이름으로 부를 때는 설치 방식에 따라 이렇게 씁니다.

| 설치 방식 | Codex | Claude Code |
|---|---|---|
| `npx skills` 또는 `install.sh` | `$noslop-frontend …` | `/noslop-frontend …` |
| 플러그인 마켓플레이스 | `$noslopdesign:noslop-frontend …` | `/noslopdesign:noslop-frontend …` |

| 스킬 | 언제 쓰나 | 하는 일 |
|---|---|---|
| `noslop-frontend` | 페이지나 앱 화면을 만들거나, 리디자인하거나, 고칠 때 | 화면 종류, 밀도, 언어권, 필요한 에셋을 분류하고 쓰는 스택으로 구현한 뒤 세 가지 폭에서 렌더링해 slop 항목에 걸리면 다시 고칩니다. 요청이 모호하면 `noslop-uiux`를 알아서 불러옵니다. |
| `noslop-uiux` | 코드 전에 방향을 정할 때 | "깔끔하게" 같은 요청에서 의도 찾기, Design Read, 콘셉트 시안, 디자인 시스템, 타이포그래피, 내비게이션, 온보딩·빈 화면·에러 상태, 로고와 파비콘. |

보통은 `noslop-frontend`로 시작하면 됩니다. 페이지를 만들기 전에 방향, 크리틱, 디자인 시스템만
필요할 때 `noslop-uiux`를 쓰세요.

## 설치

```bash
npx skills add https://github.com/lidge-jun/noslopdesign
```

[`npx skills`](https://github.com/vercel-labs/skills) CLI로 두 스킬이 함께 설치됩니다. 둘 다 두세요.
`noslop-uiux`는 작업 크기와 규칙 등급을 `noslop-frontend`에서 가져오고, 서로를 링크로 참조합니다.

<details>
<summary>Claude Code 플러그인</summary>

```
/plugin marketplace add lidge-jun/noslopdesign
/plugin install noslopdesign@noslopdesign
```

스킬은 `noslopdesign:noslop-frontend`, `noslopdesign:noslop-uiux`로 불러옵니다. `/plugin update`로 업데이트합니다.

</details>

<details>
<summary>Codex 플러그인</summary>

```bash
codex plugin marketplace add lidge-jun/noslopdesign
codex plugin add noslopdesign@noslopdesign
```

설치 후 새 Codex 세션을 열어야 스킬이 로드됩니다.

</details>

<details>
<summary>클론해서 링크로 설치</summary>

```bash
git clone https://github.com/lidge-jun/noslopdesign && cd noslopdesign
./install.sh               # Claude Code
./install.sh --codex       # Codex
./install.sh --all-agents  # 둘 다
```

심볼릭 링크라서 `git pull`만 하면 바로 업데이트됩니다. `./install.sh --uninstall`로 링크를 지웁니다.

</details>

에이전트가 이미 가진 도구로 동작합니다. 렌더링 확인은 Playwright, Chrome DevTools, 내장 브라우저 중
아무거나 쓰면 되고, 이미지와 모션 생성은 [ima2-gen](https://github.com/lidge-ai/ima2-gen)이 있으면 쓰고
없으면 에이전트의 이미지 도구로 대신합니다.

## 작업 순서

같은 프롬프트 네 개를 스킬 없음, taste-skill, noslopdesign으로 같은 모델과 머신에서 돌린 결과:
[lidge-jun.github.io/noslopdesign/compare](https://lidge-jun.github.io/noslopdesign/compare/).


1. 문구 수정부터 새 브랜드 화면까지 작업 크기를 정하고 그만큼만 공을 들입니다.
2. 화면 종류(랜딩, 앱, 대시보드, AI 도구), 언어권, 밀도, 에셋과 모션 필요도를 분류합니다.
3. 요청이 모호하거나 브랜드가 드러나는 화면이면 코드 전에 Design Read로 방향 하나를 확정합니다.
4. 실제 콘텐츠와 실제 에셋으로 만듭니다. 자리만 채우는 그라데이션이나 아이콘 카드는 없습니다.
5. 모바일, 태블릿, 데스크톱 폭에서 렌더링하고 slop 목록과 대조합니다.
6. 스크린샷에서 보이는 문제를 고치고 무엇을 확인했는지 보고합니다.

## 무엇을 slop으로 보나

스킬 없이도 린터만 따로 돌릴 수 있습니다.

```bash
node skills/noslop-frontend/scripts/sloplint.mjs ./index.html
```

결과는 세 단계로 나뉩니다. **Floor**는 절대 내보내지 않는 것(줌 차단, 포커스 링 제거, 자리표시 문구,
이모지 아이콘), **Reflex**는 모델이 습관처럼 넣는 것(보라 그라데이션, 그라데이션 글자, Inter만 쓰기,
유행어, 근거 없는 수치)으로 `noslop-allow NS-RULE-ID: 이유`를 적어야만 남길 수 있고, **Finish**는
다듬기 항목이라 막지 않습니다. 리디자인 때는 `--inventory before.json`으로 링크·입력·핸들러·제목을
기록하고 `--kept before.json`으로 빠진 게 있으면 실패시킵니다.

모드로 작업 범위를 좁힐 수 있습니다: `$noslop-frontend audit ./index.html`, `redesign`, `polish`,
`critique`, `bolder`, `quieter`, `harden`. 방향이 정해지면 `noslop-uiux`가 `DESIGN.md`에 적어 두어 다음
실행도 같은 디자인으로 만듭니다.

[`anti-slop.md`](skills/noslop-frontend/references/core/anti-slop.md)에 백 개가 넘는 항목이 있습니다. 몇 가지만 들면:

- 어디에나 Inter, 또는 "Inter 말고"의 자동 선택인 Space Grotesk.
- 이유 없는 그라데이션 히어로, 페이지 전체를 한 색으로 물들이는 테마.
- 가운데 히어로, 기능 카드 세 개, 로고 띠, 후기 캐러셀로 이어지는 기본 뼈대.
- 아이콘 대신 이모지, 지어낸 수치, "홍길동" 후기, 제품 대신 페이지를 설명하는 문구.
- 라틴 폰트 기준 설정을 한글에 그대로 적용해 행간과 리듬이 무너진 경우.

## 한국어 UI까지

대부분의 anti-slop 가이드는 영어에서 멈춥니다. noslopdesign은 한글 타이포그래피와 줄바꿈, 한국어 UX
라이팅, "깔끔하게", "감성적으로", "토스 느낌" 같은 실제 디자인 요청 어휘, 2026년 한국 서비스 패턴까지 다룹니다.

## 업스트림 동기화

레퍼런스는 [CodexClaw](https://github.com/lidge-jun/codexclaw)에서 `cxc-dev-frontend`,
`cxc-dev-uiux-design`으로 관리됩니다. 매주 워크플로가 정해진 치환 규칙([`scripts/lib/rules.mjs`](scripts/lib/rules.mjs))으로
복사해 오고, 바뀐 게 있으면 PR을 엽니다. [`upstream.json`](upstream.json)에 기준 CodexClaw 커밋이 남고,
두 진입점 `SKILL.md`는 이 레포가 직접 관리하므로 동기화로 덮어쓰지 않습니다.

## 관리

`skills/` 아래 동기화 파일은 손으로 고치지 않습니다. CodexClaw를 고치거나
[`scripts/lib/rules.mjs`](scripts/lib/rules.mjs)에 규칙을 추가한 뒤, CodexClaw `main`의 깨끗한 클론에서 동기화합니다.

```bash
git clone --depth 1 https://github.com/lidge-jun/codexclaw /tmp/codexclaw-main
node scripts/sync-from-codexclaw.mjs --source /tmp/codexclaw-main
npm install && npm run check
```

주간 동기화 워크플로가 PR을 열려면 저장소 Actions 설정에서 "Allow GitHub Actions to create and approve
pull requests"가 켜져 있어야 합니다. 새 내부 참조나 깨진 링크 때문에 동기화가 막히면 "Sync from CodexClaw
is blocked" 이슈가 열리고, 다음에 깨끗하게 돌면 닫힙니다. 릴리스할 때는 `package.json`,
`.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json`의 버전을 함께 올립니다. 셋이 다르면 검사가 실패합니다.

## 출처와 라이선스

MIT 라이선스입니다([LICENSE](LICENSE)). 레퍼런스 일부는 [taste-skill](https://github.com/Leonxlnx/taste-skill),
[impeccable](https://github.com/pbakaus/impeccable) 등 다른 스킬 프로젝트의 아이디어를 각색하거나 종합했습니다.
출처별 라이선스는 [NOTICE.md](NOTICE.md)에 있습니다.
