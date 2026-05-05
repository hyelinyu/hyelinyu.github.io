---
layout: post
title: "_risk_score가 churn risk가 아니라 credit risk였다"
title_en: "The _risk_score column was credit risk, not churn risk"
date: 2026-04-30
category: da
tags: [bigquery, data-quality, churn]
lang: ko
translation: |
  When calculating churn priority from BigQuery event logs,
  I used the `_risk_score` column directly. The result was off —
  dormant customers, supposedly low-risk, were ranking at the top.

  Guessing by column name alone was the mistake. The score actually
  measured *credit risk*, and the two move in opposite directions.
  High credit score = active customer = unlikely to churn. So a high
  score should mean *lower* churn risk, not higher.

  Lesson: never guess from column names. Always check distribution
  and domain definition during EDA. From now on, I build a column
  dictionary the moment I receive a dataset.
---

BigQuery 이벤트 로그에서 churn 우선순위 계산할 때 `_risk_score` 컬럼을 그대로 썼다. 결과가 이상했다. 이탈 가능성 낮아 보이는 휴면 고객이 상위로 올라옴.

컬럼명만 보고 추측한 게 잘못이었다. 실제로는 신용 리스크 점수였고, 둘은 상관관계가 약한 정도가 아니라 방향이 반대였다. 신용 좋은 고객 = 거래 활발 = 이탈 안 할 가능성. 그러니까 score 높을수록 이탈 위험 **낮음**이 맞는 해석이었다.

교훈은 단순함. 컬럼명 추측 금지. EDA 단계에서 분포 + 도메인 정의 둘 다 확인. 다음부터는 데이터셋 받자마자 컬럼 dictionary부터 만든다.
