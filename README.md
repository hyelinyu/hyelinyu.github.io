# hyelinyu.github.io

LinkedIn 스타일 피드 + 카테고리 탭 구조의 개인 블로그.

## 구조

```
_config.yml          ← 사이트 설정 (Giscus, 카테고리 등)
_layouts/
  default.html       ← 헤더 + 네비 + 풋
  feed.html          ← 카테고리 피드 (DA / log / thoughts)
  post.html          ← 개별 게시글 페이지 (댓글 포함)
_includes/
  post-card.html     ← 피드의 게시물 카드
_posts/              ← 모든 게시물 (날짜-슬러그.md)
assets/
  css/style.css
  js/clamp.js        ← 6줄 클램프 + 잘 봤어요
index.html           ← 루트 → DA 피드
da.html              ← /da/
log.html             ← /log/
thoughts.html        ← /thoughts/
about.html           ← /about/
```

## 글 쓰기

`_posts/` 안에 `YYYY-MM-DD-슬러그.md` 형식으로 파일 만들고 front matter:

```yaml
---
layout: post
title: "제목 (없으면 빈 문자열)"
date: 2026-05-03
category: da          # da | log | thoughts 중 하나
tags: [bigquery, sql] # 선택
---

본문 markdown.
```

### 카테고리 가이드
- **da** — 분석 글, 발견, 인사이트
- **log** — 작업 일지, 진행 상황, TIL
- **thoughts** — 책·영화 감상문, 기사 스크랩

### 6줄 넘으면 자동 접힘
별도 작업 불필요. `assets/js/clamp.js`가 알아서 처리. 기준선 바꾸려면 `_config.yml`의 `clamp_lines` 값 수정.

## Giscus 댓글 설정 (한 번만)

1. https://giscus.app 접속
2. 본인 레포(`hyelinyu/hyelinyu.github.io`) 입력
3. 레포에 GitHub Discussions 활성화 (안내 따라가면 됨)
4. Discussions 카테고리 생성 추천: `Comments` (Announcement 형식)
5. 페이지 하단에 나오는 `data-repo-id`, `data-category-id` 값 두 개 복사
6. `_config.yml`의 다음 두 줄에 붙여넣기:
   ```yaml
   giscus:
     repo_id: "여기에 붙여넣기"
     category_id: "여기에 붙여넣기"
   ```

## 잘 봤어요 카운터

현재는 localStorage 기반이라 **방문자 본인 브라우저에서만** 카운트가 유지됨. 글로벌 카운터(누구나 누른 합계)가 필요하면 Firebase Realtime DB나 Supabase 연동을 추가하면 됨.

## 로컬 미리보기

```bash
bundle install
bundle exec jekyll serve
# http://localhost:4000
```

`Gemfile`이 없다면:
```ruby
source "https://rubygems.org"
gem "github-pages", group: :jekyll_plugins
```

## 배포

main 브랜치에 push하면 GitHub Pages가 자동 빌드.

## 디자인 참고

- 본문 폰트: Inter
- 제목 폰트: Fraunces (serif)
- 컬러: 따뜻한 오프화이트 배경(#fafaf7) + 강조색은 차분한 블루
- 게시물 메타: 날짜만, 이름·아바타 없음 (어차피 단독 운영)
