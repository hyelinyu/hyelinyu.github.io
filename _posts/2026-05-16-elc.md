---
layout: post
title: "E-commerce Low Conversion Automation project Log - 1. Exploring raw dataset"
title_en: "E-commerce Low Conversion Automation project Log - 1. Exploring raw dataset"
date: 2026-05-16
category: log
tags: [bigquery, e-commerce, low conversion]
lang: ko
translation: |
    After defining the project’s overall goal and direction, we decided to begin by independently exploring the raw dataset.
    
    The purpose of this stage was to understand the dataset’s size, time range, missing values, event distribution, and duplicate records before starting the conversion analysis. We also wanted to establish clear rules for handling the data throughout the project.
    
    ## What We Did
    
    The dataset contains approximately 411 million e-commerce event records collected over 213 days, from October 2019 to April 2020.
    
    We first examined the dataset’s size, date coverage, event distribution, missing values, and duplicate records. We then reviewed the relationship between sessions and users and investigated sessions and users with unusually high event volumes.
    
    The main areas we reviewed were:
    
    - Overall date range and missing dates
    - Distribution of `view`, `cart`, and `purchase` events
    - Missing-value rates across key columns
    - Whether a single session was associated with multiple users
    - Possible reasons for repeated event records
    - Distribution of events per session and sessions per user
    - Sessions and users generating unusually large numbers of events
    - Monthly changes in data distribution and missing-value rates
    
    My teammate also suggested several directions for later analysis, including monthly patterns, unusual prices, price changes for the same product, and users who repeatedly viewed products without making a purchase.
    
    ## Key Findings
    
    ### 1. The overall data structure was stable
    
    The dataset covered all 213 days without any missing dates. The event distribution was:
    
    - `view`: 93.7%
    - `cart`: 4.6%
    - `purchase`: 1.7%
    
    This followed a typical e-commerce funnel pattern, with many product views and progressively fewer cart and purchase events.
    
    Key columns such as event time, event type, product ID, and user ID had almost no missing values. Overall, the raw data appeared stable enough to support further analysis.
    
    ### 2. Category information required separate handling
    
    Approximately 15.83% of `category_code` values were missing, while 13.52% of `brand` values were also unavailable.
    
    The missing `category_code` values were particularly important because category information would be required for category-level conversion analysis. Removing all affected records would result in a substantial loss of data, so we decided to investigate whether the missing values could be recovered using `category_id`.
    
    The missing rate was also not consistent across the entire period. It was approximately 32% in October and November 2019, but decreased to around 9–10% in the following months.
    
    This time-based pattern was not visible when looking only at the overall missing-value rate.
    
    ### 3. Funnel events and quantities required different aggregation methods
    
    The duplicate rate for `view` events was only 0.097%. However, repeated records were more common for `cart` and `purchase` events with the same timestamp, product, and session.
    
    These repeated records were not necessarily data errors. They could represent a customer adding multiple units of the same product to the cart or purchasing more than one unit. Removing all duplicates could therefore remove valid quantity and revenue information.
    
    On the other hand, counting every repeated event in the conversion funnel could distort CVR when the same product was viewed or added to the cart multiple times within a session.
    
    We therefore decided to use different aggregation rules depending on the metric:
    
    - Funnel and CVR: count once per `session × product`
    - Quantity and revenue: retain repeated events
    - Extreme repetitions: separate them from normal quantities for further investigation
    
    ### 4. Sessions could be used as the main funnel-analysis unit
    
    Of approximately 89.7 million sessions, 99.992% were associated with exactly one user.
    
    A small number of sessions were connected to multiple users, but their share of the total was negligible. Based on this result, we decided to use `user_session` as the primary unit for the funnel analysis.
    
    ### 5. Abnormal traffic was hidden behind the averages
    
    The median number of events per session was 2, and even the 99th percentile was only 34. However, the largest session contained 34,570 events.
    
    This created a difference of approximately 1,000 times between the normal upper range and the maximum value.
    
    We identified 374 sessions with at least 500 events. Together, they generated 759,903 events, representing only about 0.185% of the entire dataset. Removing these sessions would therefore result in minimal data loss.
    
    We also discovered that events per session alone could not detect every form of abnormal traffic.
    
    Some users avoided generating many events within a single session. Instead, they created tens of thousands of sessions and recorded only one event in each. The 99th percentile for sessions per user was 56, while the maximum was 130,669.
    
    This indicated that abnormal traffic could appear in several different forms:
    
    - Concentrating tens of thousands of events in one session
    - Splitting activity across many one-event sessions
    - Repeatedly monitoring a small number of products
    - Repeating the same actions within a very short period
    
    At this stage, we decided to separate clearly abnormal high-volume sessions first. Users focused on specific products and users generating repeated views would require additional validation because their behavior could still represent genuine customer interest.
    
    ## Outputs
    
    This exploration helped us establish the rules that would guide the rest of the analysis, rather than simply confirming whether the dataset was usable.
    
    1. Use `user_session` as the main unit for funnel analysis.
    2. Deduplicate funnel and CVR events at the `session × product` level.
    3. Retain repeated events when calculating quantities and revenue.
    4. Do not immediately remove missing `category_code` records; first investigate whether they can be recovered using `category_id`.
    5. Separate the 374 sessions with at least 500 events as clear abnormal-traffic candidates.
    6. Introduce user-level detection for users with unusually large numbers of sessions or strong concentration on a small number of products.
    7. Examine monthly distributions and extreme values instead of relying only on overall averages.
    
    The most important output from this stage was not a cleaned table itself, but a set of **data-handling principles designed to prevent distortion in the conversion analysis**.
    
    ## What I Learned
    
    While sharing our findings, I realized that different people naturally focus on different aspects of the same dataset.
    
    I focused mainly on the dataset’s overall structure and quality, while my teammate examined areas I had not initially considered, such as monthly changes, product prices, and user behavior.
    
    In particular, some issues became much clearer only after the data was divided by month. The overall missing rate for `category_code` was 15.83%, but it was approximately 32% in October and November 2019.
    
    These checks may seem basic, but examining the data from several different perspectives led to new questions that were not visible in the overall summary.

---



프로젝트의 목표와 대략적인 방향을 정한 뒤, 첫 번째 단계로 각자 raw dataset을 살펴보기로 했다.

이번 단계의 목적은 본격적인 전환율 분석에 들어가기 전에 데이터의 전체 규모와 기간, 결측치, 이벤트 분포, 중복 여부 등을 확인하고 앞으로 어떤 기준으로 데이터를 다룰지 정하는 것이었다.



## 진행한 작업

분석에 사용한 데이터는 2019년 10월부터 2020년 4월까지 총 213일간 수집된 약 4억 1천만 건의 이커머스 이벤트 로그다.

먼저 데이터의 기간과 규모, 이벤트 분포, 결측치와 중복을 확인했다. 이후 세션과 사용자 관계를 검토하고, 이벤트 수가 극단적으로 많은 세션과 사용자를 추적했다.

주요 검토 항목은 다음과 같다.

- 전체 데이터 기간과 누락 날짜 확인
- `view`, `cart`, `purchase` 이벤트 분포 확인
- 주요 컬럼의 결측률 확인
- 하나의 세션이 여러 사용자에게 연결되는지 확인
- 동일 이벤트가 반복 기록된 이유 분석
- 세션당 이벤트 수와 사용자당 세션 수 분포 확인
- 비정상적으로 많은 이벤트를 발생시킨 사용자와 세션 확인
- 월별 데이터 분포와 결측률 비교

팀원은 전체 데이터뿐 아니라 월별 차이, 가격 이상치, 동일 상품의 가격 변화, 조회는 많지만 구매가 없는 사용자 등 이후 분석으로 확장할 수 있는 항목도 함께 제안했다.





## 주요 발견

### 1. 데이터의 기본적인 구조는 안정적이었다

전체 기간은 213일이었으며 빠진 날짜는 없었다. 이벤트 비중은 다음과 같았다.

- `view`: 93.7%
- `cart`: 4.6%
- `purchase`: 1.7%

조회에서 장바구니, 구매로 갈수록 이벤트가 줄어드는 일반적인 이커머스 퍼널 형태였다.

시간, 이벤트 유형, 상품 ID, 사용자 ID와 같은 핵심 컬럼의 결측치는 거의 없었다. 따라서 원본 데이터는 전반적으로 분석 가능한 상태라고 판단했다.

### 2. 카테고리 정보는 별도의 처리가 필요했다

`category_code`의 15.83%가 비어 있었고, `brand`도 13.52%가 누락되어 있었다.

특히 `category_code`는 이후 카테고리별 전환율을 계산할 때 필요한 값이다. 이를 단순히 삭제하면 전체 데이터의 상당 부분을 잃게 되므로, `category_id`를 이용해 복구할 수 있는지 먼저 확인하기로 했다.

월별로 나누어 보니 `category_code` 결측률은 모든 기간에 동일하지 않았다. 2019년 10월과 11월에는 약 32%였지만, 이후에는 약 9~10% 수준으로 내려갔다.

전체 결측률 하나만 봤을 때는 보이지 않았던 시간적 차이를 확인할 수 있었다.

### 3. 퍼널과 수량은 서로 다른 방식으로 계산해야 했다

`view` 이벤트의 중복률은 0.097%로 매우 낮았다. 반면 `cart`와 `purchase`에는 같은 시간과 상품, 세션이 반복된 기록이 더 많이 존재했다.

이 반복 기록은 단순한 데이터 오류가 아니라 같은 상품을 여러 번 담거나 여러 개 구매한 수량 정보일 수 있었다. 따라서 모든 중복을 삭제하면 실제 구매 수량이나 매출을 잃게 된다.

반대로 전환율을 계산할 때 반복 이벤트를 그대로 세면 같은 상품을 여러 번 조회하거나 장바구니에 담은 행동 때문에 CVR이 왜곡될 수 있다.

그래서 지표에 따라 집계 방식을 분리하기로 했다.

- 퍼널과 CVR: `session × product` 기준으로 한 번만 집계
- 상품 수량과 매출: 반복 이벤트를 유지하여 계산
- 지나치게 반복된 극단값: 정상 수량과 분리하여 추가 검토

### 4. 세션을 퍼널 분석 단위로 사용할 수 있었다

약 8,970만 개 세션 중 99.992%가 하나의 사용자와 연결되어 있었다.

일부 세션이 여러 사용자에게 연결된 경우도 있었지만 전체에서 차지하는 비중이 매우 작았다. 따라서 이후 퍼널 분석에서는 `user_session`을 기본 분석 단위로 사용하기로 했다.

### 5. 평균만으로는 보이지 않는 비정상 트래픽이 있었다

일반적인 세션의 이벤트 수 중앙값은 2개였고, 상위 1%의 기준도 34개였다. 하지만 가장 큰 세션에는 34,570개의 이벤트가 기록되어 있었다.

정상적인 세션과 최대값 사이에 약 1,000배의 차이가 있었다.

세션당 이벤트가 500개 이상인 세션은 374개였고, 총 759,903개의 이벤트를 만들었다. 전체 이벤트의 약 0.185%에 불과해 해당 세션을 제외하더라도 데이터 손실은 크지 않았다.

여기서 세션당 이벤트 수만으로 모든 비정상 트래픽을 찾을 수 없다는 점도 발견했다.

일부 사용자는 한 세션에 많은 이벤트를 만들지 않고, 수만 개의 세션을 생성해 매번 이벤트 하나만 남겼다. 사용자당 세션 수의 상위 1%는 56개였지만 최대값은 130,669개였다.

즉, 비정상 트래픽에는 서로 다른 행동 방식이 있었다.

- 한 세션에 수만 개의 이벤트를 집중시키는 유형
- 세션을 잘게 쪼개 필터를 피하는 유형
- 소수의 상품만 반복적으로 확인하는 모니터링 유형
- 짧은 시간에 동일 행동을 반복하는 유형

이 단계에서는 명확하게 비정상적인 대량 세션을 우선 제외하고, 제품 집중 사용자나 반복 조회처럼 정상 사용자와 구분하기 어려운 유형은 추가 검증하기로 했다.

## 나온 결과물

이번 탐색을 통해 데이터 상태를 확인하는 것뿐 아니라 이후 분석에 사용할 기준을 정할 수 있었다.

1. 퍼널 분석의 기본 단위는 `user_session`으로 사용한다.
2. 퍼널과 CVR은 `session × product` 기준으로 중복을 정리한다.
3. 수량과 매출을 계산할 때는 반복 이벤트를 유지한다.
4. `category_code` 결측치는 바로 삭제하지 않고 `category_id`를 이용한 복구 가능성을 확인한다.
5. 세션당 이벤트가 500개 이상인 374개 세션은 명백한 비정상 트래픽 후보로 분리한다.
6. 세션 수가 비정상적으로 많은 사용자와 특정 상품에 집중된 사용자는 별도의 사용자 단위 탐지가 필요하다.
7. 전체 평균만 보지 않고 월별 분포와 극단값을 함께 확인한다.

결과적으로 이번 단계에서 만든 가장 중요한 결과물은 정제된 테이블 자체가 아니라, **전환율을 왜곡하지 않기 위한 데이터 처리 원칙**이었다.





## 배운 점

팀원들과 결과를 공유하면서 같은 데이터를 보더라도 각자 확인하는 지점이 다르다는 것을 느꼈다.

나는 전체 데이터의 구조와 품질을 중심으로 살펴봤지만, 팀원은 월별 변화나 상품 가격, 사용자 행동처럼 내가 미처 생각하지 못한 방향에서도 데이터를 확인했다. 
특히 전체 평균만 봤을 때는 보이지 않던 문제가 월별로 나누자 더 명확하게 나타났다. category_code 결측률도 전체로는 15.83%였지만, 2019년 10월과 11월에는 약 32%로 훨씬 높았다.

어떻게 보면 기본적인 확인이지만, 실제로 데이터를 여러 방향에서 나누어 보니 새로운 질문이 생겼다. 


