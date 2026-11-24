# Portfolio Crew

Portfolio Crew는 여섯 에이전트가 한 팀으로 개발자 포트폴리오를 만드는 Codex 스킬입니다. PM이 사용자와 목표를 정하면, 웹 기획자는 읽는 순서를 설계하고 콘텐츠 에디터는 프로젝트 기록에서 사례와 근거를 찾습니다. UI 디자이너와 프런트엔드 개발자가 그 내용을 실제 화면으로 옮기고, QA/배포 담당이 브라우저에서 검수해 **GitHub 블로그 또는 HTML 링크**로 제공합니다.

기존 포트폴리오를 손볼 때는 바꿀 부분에 맞는 크루가 모여 작업합니다.

## 실행 흐름

1. 기존 포트폴리오 여부를 아직 모르면 **“이미 만들어 둔 포트폴리오가 있나요?”**부터 묻습니다. 요청에 답이 있으면 그 답을 사용하고, 한 응답에 현재 질문 하나만 보냅니다.
2. **신규 제작**은 형식을 고른 다음 프로젝트 기록 위치를 묻습니다. 사용자가 지정한 위치에서 프로젝트 목록을 확인받고, 그 다음 레퍼런스를 요청합니다. 여섯 역할이 협업하며 사용자는 콘텐츠, 시안, 모션과 단계별 결과를 차례로 확인합니다.
3. **기존 사이트 수정**은 현재 사이트와 편집 가능한 소스, 원하는 변경 범위를 확인합니다. 내용은 PM과 콘텐츠 에디터가 원고와 근거를 검토하고, 디자인은 바꿀 화면의 레퍼런스부터 확인합니다. 프로젝트 추가, 기능, 모션 등도 필요한 단계와 담당자만 연결합니다.
4. **제작 중 변경**은 영향을 받는 단계부터 이어갑니다. 예를 들어 디자인 방향이 그대로라면 시안에 들어갈 문장만 고치고, 다른 레이아웃을 원하면 관련 레퍼런스와 화면부터 다시 확인합니다.
5. **결과를 확인**할 때는 실제 브라우저에서 바뀐 화면과 연결된 동선을 검수합니다. 게시가 필요하면 사용자가 승인한 주소와 공개 범위에서 진행합니다.

작업별 시작 단계와 담당자는 [신규와 수정 경로 선택](./portfolio-crew/references/routing.md)에 있습니다.

## 기본 제작 기준

**구성과 원고.** 첫 화면·소개, 기술 요약, 프로젝트 목록과 상세, 마무리를 기본 구조로 설계합니다. 대표 상세에서 직접 구현한 기능, 기술을 선택한 이유, 문제 해결과 검증 근거를 읽을 수 있게 구성합니다. [포트폴리오 작성 기준](./portfolio-crew/references/portfolio-writing.md)

**디자인과 웹 모션.** 컨셉, 글꼴, 색상, 구도, 이미지와 모션을 `docs/art-direction.md`에서 합의한 뒤 구현을 시작합니다. 크루가 실제 콘텐츠와 에셋으로 한 섹션씩 만들고, 1440px·375px 브라우저 캡처를 레퍼런스와 비교해 최소 두 차례 수정합니다. [디자인 품질 규칙](./portfolio-crew/references/visual-production.md#디자인-품질-규칙)

## 설치

### Codex에 설치 맡기기

Codex에 아래 문장을 붙여 넣습니다.

> `https://github.com/j-moo/Portfolio-Crew`를 클론하고, 그 안의 `portfolio-crew`를 내 Codex 개인 스킬로 설치해줘. 이미 이 저장소를 열었다면 그 폴더를 사용해줘.

### 직접 설치하기

1. 저장소를 클론합니다.

   ```sh
   git clone https://github.com/j-moo/Portfolio-Crew.git
   ```

2. 복제한 저장소 안의 [portfolio-crew](./portfolio-crew) 폴더 전체를 `~/.agents/skills/`에 복사합니다. 최종 위치는 `~/.agents/skills/portfolio-crew/SKILL.md`입니다. [Codex 공식 스킬 설치 위치](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills)

## 사용 예시

Codex에서 이 스킬을 직접 지정하려면 요청 앞에 `$portfolio-crew`를 붙입니다. Codex CLI에서는 `/skills`로 스킬 목록을 열 수 있습니다. 일반 요청 문장도 스킬 설명과 일치하면 자동으로 선택될 수 있습니다. [Codex 스킬 호출 방법](https://learn.chatgpt.com/docs/build-skills#how-chatgpt-and-codex-use-skills)

> `$portfolio-crew` 백엔드 개발자 지원용 포트폴리오를 만들고 싶다. 팀 프로젝트에서 내가 맡은 API 설계와 장애를 해결한 과정, 테스트로 검증한 결과가 잘 보였으면 좋겠어.

> `$portfolio-crew` 프런트엔드 개발자 지원용 포트폴리오를 만들고 싶다. 실제 서비스 화면과 내가 구현한 인터랙션을 중심으로 보여주고, 디자인 레퍼런스의 편집물 같은 구성을 살리고 싶어.

> `$portfolio-crew` 지금 운영 중인 포트폴리오의 프로젝트 상세에서 내가 맡은 API 설계 설명을 더 명확하게 다듬고 싶어. 기존 화면과 갤러리는 그대로 두고 여기에 설명만 바꿔줘.

스킬은 기존 포트폴리오 여부와 요청 범위를 확인한 뒤 해당 작업부터 시작합니다.

[팀 제작 절차](./portfolio-crew/references/production.md)에 여섯 역할의 실무 지침이 연결되어 있습니다. UI 디자이너와 프런트엔드 개발자는 [비주얼·모션 제작 가이드](./portfolio-crew/references/visual-production.md)에 따라 이미지 에셋을 준비하고 모션 방식을 시험합니다. QA는 같은 화면과 조건에서 검수합니다.

### 중간에 멈췄다가 이어가기

스킬은 작업 폴더의 `.portfolio-crew/progress.md`에 현재 단계, 확정한 선택과 승인, 다음에 할 일을 저장합니다. 중간 질문이나 다른 작업을 마친 뒤 포트폴리오로 돌아오면 그 기록에서 이어갑니다. 같은 채팅에서는 이렇게 말할 수 있습니다.

> 아까 하던 포트폴리오를 이어서 해줘.

새 채팅에서는 같은 프로젝트 폴더를 열고 진행 메모를 지정해 이어갑니다.

> `$portfolio-crew` 이 프로젝트의 `.portfolio-crew/progress.md`를 읽고 기다리던 단계부터 이어서 해줘.

시안 확인처럼 사용자 응답을 기다리던 항목은 이어서 검토할 수 있고, 이미 확정한 선택은 그대로 사용합니다. [진행 저장과 재개](./portfolio-crew/references/continuity.md)

## 검수 도구

스킬은 지침 파일을 복사해 설치합니다. **Node.js 20 이상은 아래 자동 검수 도구 두 개를 실행할 때 필요합니다.** 브라우저에서 직접 검수하거나 게시된 정적 HTML을 열 때는 브라우저를 사용합니다. CDN으로 불러온 모션 라이브러리도 방문자의 브라우저에서 실행됩니다. 제작에 npm 기반 번들러를 선택한 경우에는 빌드 환경에서도 Node.js를 사용합니다.

| 도구 | 용도 | 요구 사항 |
| --- | --- | --- |
| [check-scope.mjs](./portfolio-crew/scripts/check-scope.mjs) | 기준 커밋 대비 허용 범위를 벗어난 파일 검사 | Node.js 20 이상, Git |
| [check-portfolio.mjs](./portfolio-crew/scripts/check-portfolio.mjs) | 브라우저에서 프로젝트 상세와 이동 동선 검사, 스크린샷·영상 수집 | Node.js 20 이상, Playwright |

실행 명령과 브라우저 설정은 [검수 가이드](./portfolio-crew/references/review.md)에 있습니다. [설정 예제](./portfolio-crew/examples/browser-check.json)는 가상의 도서 예약 프로젝트를 사용합니다.
