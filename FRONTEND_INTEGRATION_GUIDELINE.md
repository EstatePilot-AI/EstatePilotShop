# Frontend Integration Guideline (Angular)

This document explains how frontend developers should integrate with the EstatePilot chatbot backend.

- Backend repo: `chatbot`
- Primary endpoint: `POST /ai-advisor`
- Secondary endpoint: `POST /smartsearch`
- Language target: Egyptian Arabic UX (RTL-friendly)

---

## 1) Integration goals

Frontend should:
1. Send user chat messages to backend with a stable `user_id`.
2. Render assistant response and property results.
3. Handle intent-based response modes (`Search`, `Recommend`, `Compare`, `Negotiate`, etc.).
4. Gracefully handle fallback and low-confidence replies.
5. Keep UX responsive with loading, timeout, retry, and empty states.

---

## 2) Endpoints and contracts

## 2.1 `POST /ai-advisor` (main conversational flow)

### Request

```json
{
  "user_id": 123456,
  "query": "عايز شقة 3 غرف في التجمع الخامس بحد أقصى 4 مليون"
}
```

### Response

```json
{
  "module": "Search",
  "filters_extracted": {
    "propertyType": "Apartment",
    "min_price": null,
    "max_price": 4000000,
    "rooms": 3,
    "city": "القاهرة",
    "district": "التجمع الخامس"
  },
  "top_properties": [
    {
      "propertyId": 123,
      "propertyType": "Apartment",
      "price": 3850000,
      "area": 155,
      "rooms": 3,
      "bathrooms": 2,
      "district": "التجمع الخامس",
      "city": "القاهرة",
      "propertyStatus": "Available"
    }
  ],
  "recommendation": null,
  "comparison": null,
  "negotiation": null,
  "fallback_used": false,
  "explanation": "Intent=search, confidence=0.81",
  "reply_in_egyptian_arabic": "تمام، لقيت لك اختيارات مناسبة في التجمع الخامس..."
}
```

### Notes

- `module` drives frontend UI mode.
- `reply_in_egyptian_arabic` is the primary assistant message to display.
- `top_properties` can be empty (show empty state with assistant text).
- `recommendation`, `comparison`, and `negotiation` are optional and intent-dependent.

---

## 2.2 `POST /smartsearch` (fast property-id retrieval)

### Request

```json
{
  "query": "فيلا في الشيخ زايد أقل من 10 مليون",
  "top_k": 5
}
```

### Response

```json
{
  "property_ids": [101, 222, 319, 405, 510]
}
```

### When to use it

Use `/smartsearch` when:
- You only need matched IDs quickly.
- You want to prefetch property details from another service.
- You do not need chatbot narrative text.

---

## 3) Required frontend data models (TypeScript)

```ts
export type AdvisorModule =
  | 'Search'
  | 'Recommend'
  | 'Compare'
  | 'Negotiate'
  | 'Guided Conversation'
  | 'Selection'
  | string;

export interface AdvisorRequest {
  user_id: number;
  query: string;
}

export interface PropertyCard {
  propertyId: number;
  propertyType?: string;
  finishingType?: string;
  propertyStatus?: string;
  price?: number;
  area?: number;
  rooms?: number;
  bathrooms?: number;
  district?: string;
  city?: string;
  governorate?: string;
  country?: string;
  floorNumber?: number;
  street?: string;
  [key: string]: unknown;
}

export interface ExtractedFilters {
  propertyType?: string | null;
  finishingType?: string | null;
  min_price?: number | null;
  max_price?: number | null;
  min_area?: number | null;
  max_area?: number | null;
  rooms?: number | null;
  bathrooms?: number | null;
  governorate?: string | null;
  city?: string | null;
  district?: string | null;
  [key: string]: unknown;
}

export interface AdvisorResponse {
  module: AdvisorModule;
  filters_extracted: ExtractedFilters;
  top_properties: PropertyCard[];
  recommendation?: PropertyCard | null;
  comparison?: PropertyCard[] | null;
  negotiation?: PropertyCard | null;
  fallback_used: boolean;
  explanation: string;
  reply_in_egyptian_arabic: string;
}

export interface SmartSearchRequest {
  query: string;
  top_k?: number;
}

export interface SmartSearchResponse {
  property_ids: number[];
}
```

---

## 4) User ID strategy (guest mode)

Backend expects numeric `user_id` and uses it to keep session context.

### Recommendation

- Generate a deterministic numeric guest ID once per browser profile.
- Store in `localStorage`.
- Reuse the same ID for every `/ai-advisor` request.
- Regenerate only if user explicitly resets chat identity.

### Example generation idea

- If no ID exists, create: `Date.now()` + random suffix, then convert to safe integer range.
- Persist under key: `estatepilot_guest_user_id`.

> Why: session filters/history are tied to `user_id`, so changing it mid-conversation loses context.

---

## 5) Angular architecture recommendation

Use 4 layers:

1. **API layer**
   - `ChatbotApiService` for HTTP calls.
   - Strict typed request/response interfaces.
   - Central timeout + retry policy.

2. **State layer**
   - `ChatStore` (signals, RxJS store, or NgRx).
   - Keep:
     - messages
     - latest `filters_extracted`
     - latest `top_properties`
     - loading/error status

3. **Presentation layer**
   - `ChatComposerComponent`
   - `ChatMessagesComponent`
   - `PropertyResultsComponent`
   - `ComparePanelComponent`
   - `RecommendationPanelComponent`

4. **Utilities layer**
   - Arabic number/currency formatting
   - area units (`م²`)
   - status badges

---

## 6) Module-to-UI behavior mapping

When `module` =

- **`Search`**
  - Show assistant text + property cards list.

- **`Recommend`**
  - Highlight `recommendation` card first.
  - Keep remaining `top_properties` as alternatives.

- **`Compare`**
  - Show side-by-side comparison table from `comparison` (usually top 2).

- **`Negotiate`**
  - Show negotiation advice panel using `negotiation` + assistant response.

- **`Guided Conversation`**
  - Show assistant clarifying question.
  - Optionally render quick-reply chips (budget, location, rooms, type).

- **`Selection`**
  - Treat as user selecting previously shown property.
  - Route to property details page if link is available in your frontend system.

---

## 7) Fallback and error handling

## 7.1 Application-level fallback

If `fallback_used === true`:
- Show a subtle info banner: "نتيجة تقريبية بسبب قلة التطابق".
- Still render the response normally.

## 7.2 Empty results

If `top_properties.length === 0`:
- Show empty-state UI + backend assistant text.
- Offer user chips for next action: `زود الميزانية` / `غيّر المنطقة` / `قلل المساحة`.

## 7.3 Network/API failure

- Show non-blocking error toast for transient issues.
- Keep unsent message in composer for retry.
- Add “Retry” action that resubmits same payload.

## 7.4 Timeout policy

- Suggested request timeout: 15–25 seconds for `/ai-advisor`.
- Suggested request timeout: 8–12 seconds for `/smartsearch`.

---

## 8) UX requirements (Arabic-first)

- Enable RTL layout for chat screen.
- Use Arabic-friendly numerals/formatting where relevant.
- Display price as `EGP` + localized separators.
- Keep assistant tone natural and concise.
- Keep loading indicators visible while waiting for LLM response.

---

## 9) Suggested Angular service skeleton

```ts
@Injectable({ providedIn: 'root' })
export class ChatbotApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  askAdvisor(payload: AdvisorRequest): Observable<AdvisorResponse> {
    return this.http
      .post<AdvisorResponse>(`${this.baseUrl}/ai-advisor`, payload)
      .pipe(timeout(20000));
  }

  smartSearch(payload: SmartSearchRequest): Observable<SmartSearchResponse> {
    return this.http
      .post<SmartSearchResponse>(`${this.baseUrl}/smartsearch`, payload)
      .pipe(timeout(10000));
  }
}
```

---

## 10) QA acceptance checklist

A frontend implementation is accepted when:

1. Chat sends `user_id` + `query` correctly.
2. Multi-turn conversation keeps context with same `user_id`.
3. All `module` modes render correctly.
4. `fallback_used` state is visible but non-disruptive.
5. Empty results are graceful and actionable.
6. Retry path works for network errors.
7. RTL + Arabic text rendering is correct on desktop/mobile.
8. `/smartsearch` integration returns and consumes IDs properly.

---

## 11) Troubleshooting matrix

| Symptom | Likely cause | Frontend action |
|---|---|---|
| Context lost between messages | `user_id` changed | Persist guest ID and reuse it |
| Assistant asks many clarification questions | Query too vague / low confidence | Offer quick filter chips and guided prompts |
| No cards but assistant message exists | Filtered result set is empty | Show empty state and refinement options |
| Slow responses | LLM processing latency | Show loading state + tune timeout + optional cancel UX |
| Compare panel empty | `comparison` null for current intent | Fallback to top properties list |
| Recommendation missing | `recommendation` null | Render generic result cards only |

---

## 12) Security and production notes

- Do not expose private backend secrets in frontend.
- Keep API base URL in Angular environments (`environment.ts`).
- Add client-side rate guard (button debounce) to avoid duplicate sends.
- Log only non-sensitive telemetry.

---

## 13) Delivery summary for frontend team

If your team implements this document as-is, they will have:
- stable chat session behavior,
- reliable intent-based rendering,
- graceful fallback/error UX,
- production-ready Arabic chatbot integration with the current backend contracts.
