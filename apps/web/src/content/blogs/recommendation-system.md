---
title: Recommendation System
summary: A TypeScript checkout recommendation service that ranks explainable "you might also want" products from order history and catalog data.
publishedAt: "2026-05-06"
tags:
  - TypeScript
  - Bun
projectUrl: "https://github.com/zulfaza/recomendation-system"
---

This project started as a practical checkout problem: suggest products a customer may want before payment, while keeping the first version simple enough to inspect and measure. The service uses historical order lines, product catalog data, branch availability, customer history, and current cart contents to return ranked product cards for a checkout flow.

![Recommendation System demo showing menu products, basket state, paired suggestions, and developer request output](/images/recommendation-system/demo.png "The demo shows recommendations beside a checkout basket, including the cart context that drives the ranking request.")

The implementation is deliberately artifact-based. Mongo exports are normalized into typed order lines and sellable catalog products, then offline scripts build baseline, product-similarity, and customer-profile artifacts. At runtime, the API loads those artifacts once, validates each checkout request, filters out ineligible products, scores candidates, hydrates product cards, and logs impression events for later evaluation.

```mermaid title="Code flow" caption="Offline artifacts keep serving fast while leaving the ranking logic measurable."
flowchart TD
  Orders[Mongo order exports] --> Lines[parseRawOrderLines]
  Products[Mongo product exports] --> Catalog[parseRawProducts]

  Lines --> Baseline[buildBaselineArtifacts]
  Catalog --> Baseline
  Lines --> Similarity[buildProductSimilarities]
  Lines --> Profiles[buildCustomerProfiles]
  Catalog --> Profiles

  Baseline --> A[data/baseline-artifact.json]
  Similarity --> B[data/product-similarities.json]
  Profiles --> C[data/customer-profiles.json]

  A --> API[Checkout recommendation API]
  B --> API
  C --> API
  Request[Current cart, store, branch, customer] --> API
  API --> Response[Ranked product suggestions]
  API --> Events[recommendation-events.jsonl]
```

### Sample data.

Raw exports are JSON arrays from MongoDB. Each entry is validated and normalized before it is used to build artifacts.

A catalog product (data/raw/products.json):

```json
{
  "_id": { "$oid": "a00000000000000000000028" },
  "name": "Dummy Product 001",
  "slug": "dummy-product-001",
  "base_price": 0,
  "store": { "$oid": "a00000000000000000000001" },
  "branches": [{ "$oid": "a0000000000000000000000a" }],
  "categories": [{ "category": { "$oid": "a00000000000000000000002" } }],
  "order_methods": ["pickup", "delivery"],
  "available": true,
  "status": "active"
}
```

An order line (data/raw/order_lines.json):

```json
{
  "orderId": { "$oid": "a000000000000000000a4cc0" },
  "storeId": { "$oid": "a00000000000000000000001" },
  "branchId": { "$oid": "a00000000000000000000003" },
  "customerId": { "$oid": "a00000000000000000005377" },
  "productId": { "$oid": "a0000000000000000000a81d" },
  "quantity": 1,
  "datePaid": { "$date": "2025-12-30T22:44:23.761Z" }
}
```

### Artifacts.

Offline scripts turn the raw exports into three typed artifacts that the API loads once at startup.

Baseline artifact (data/baseline-artifact.json) stores the catalog, recency-weighted counts, and normalized popularity maps:

```json
{
  "modelVersion": "baseline-v1",
  "products": [...],
  "productOrderCounts": [["productId", 42.5], ...],
  "storePopularity": [["storeId", [["productId", 0.8], ...]], ...],
  "branchPopularity": [...],
  "customerHistory": [...],
  "coOccurrence": [["productId", [["relatedId", 0.35], ...]], ...],
  "categoryPopularity": [...]
}
```

Product similarity artifact (data/product-similarities.json) stores top-N similar products per item, scored by normalized co-occurrence:

```json
{
  "modelVersion": "product-similarity-v1",
  "topN": 20,
  "halfLifeDays": 90,
  "referenceDate": "2025-12-30T22:57:07.755Z",
  "similarities": [
    [
      "productId",
      [{ "productId": "relatedId", "score": 0.49876, "pairCount": 12501.53 }]
    ]
  ]
}
```

Customer profile artifact (data/customer-profiles.json) stores per-customer top products and categories with quantity and recency:

```json
{
  "modelVersion": "customer-profile-v1",
  "topProducts": 50,
  "topCategories": 20,
  "halfLifeDays": 180,
  "profiles": [
    {
      "customerId": "customerId",
      "products": [
        { "productId": "productId", "score": 1, "quantity": 104, "lastBoughtAt": "2025-12-01T17:30:49.419Z" }
      ],
      "categories": [...]
    }
  ]
}
```

### How weights are calculated.

Every count is weighted by recency using exponential decay with a configurable half-life (default 180 days for baseline and customer profiles, 90 days for similarities):

weight = 0.5 ^ (ageDays / halfLifeDays)

For each order line the contribution is quantity \* recencyWeight. For order-level co-occurrence the weight uses the latest datePaid in that order.

Normalization: store, branch, customer history, and category popularity are normalized per-key to the range [0, 1] by dividing by the maximum count in that key. Co-occurrence is normalized with cosine similarity: `count / sqrt(productCount * relatedCount)`. Customer profile scores use `log1p(quantity) * recencyWeight`, then are normalized per customer.

### Final score:

`score = 0.45 * co_occurrence + 0.25 * customer_history + 0.15 * branch_popularity + 0.10 * store_popularity + 0.05 * category_affinity`

Product similarity is folded into the co-occurrence signal by taking the maximum of the legacy co-occurrence score and the similarity score for each cart item. The strongest individual signal is reported as reason in the API response.

The first ranking model is intentionally explainable. It combines co-occurrence, customer history, branch popularity, store popularity, category affinity, product similarity, and customer profile signals with deterministic tie-breaking. Serving rules remove products already in the cart, unavailable catalog items, products from the wrong store, and products blocked by branch or order method.

I also added an offline evaluation loop so changes can be judged before they reach the demo API. The current evaluator uses a temporal holdout split, replays historical carts, and reports hit rate, recall, precision, MRR, product coverage, and top missed products. That makes the project more than a UI experiment: it has a path for improving ranking quality while keeping the API contract stable.
