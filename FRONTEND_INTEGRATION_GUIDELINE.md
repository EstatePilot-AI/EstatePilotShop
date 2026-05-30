# Frontend Integration Guideline

This document helps a frontend developer integrate the **EstatePilot AI chatbot** into a web app. The backend is a FastAPI service that understands real-estate queries, keeps light conversation state per user, and returns both conversational replies and structured property data.

## What the backend does

The service can:

- Search properties from the indexed catalog
- Recommend the best match
- Compare multiple properties
- Give negotiation advice
- Handle clarification questions when the query is vague
- Let a user select one of the last shown properties

The response is optimized for a conversational UI in **Egyptian Arabic**, but the structured fields are ideal for rendering cards, compare views, and result lists in a frontend.

## Base URL

Use the deployed backend URL for your environment.

Examples:

- Local development: `http://localhost:8000`
- Deployed Render service: the app is started as `gunicorn main:app` and listens on `$PORT`

> The backend has CORS enabled for all origins, so a frontend app can call it directly from the browser.

## Required request model

### `POST /ai-advisor`

This is the main chatbot endpoint.

#### Request body

```json
{
  "user_id": 12345,
  "query": "عايز شقة في التجمع بميزانية 3 مليون"
}
```

#### Fields

- `user_id` must be an **integer**
- `query` is the user message in any supported language, but Arabic works best for the chatbot's tone

#### Important integration note

The backend stores conversation history **in memory**, keyed by `user_id`.

That means the frontend should:

- Keep the same `user_id` for the same user/session
- Reuse it for every chat turn
- Not generate a fresh ID for every request

If your app does not have authenticated users, generate a numeric session ID once and persist it in `localStorage` or your own session layer.

## Response shape

`/ai-advisor` returns a structured payload similar to this:

```json
{
  "module": "Search",
  "filters_extracted": {
    "propertyType": "Apartment",
    "finishingType": null,
    "min_price": null,
    "max_price": 3000000,
    "min_area": null,
    "max_area": null,
    "rooms": null,
    "bathrooms": null,
    "governorate": null,
    "city": "التجمع",
    "district": null
  },
  "top_properties": [],
  "recommendation": null,
  "comparison": null,
  "negotiation": null,
  "fallback_used": false,
  "explanation": "",
  "reply_in_egyptian_arabic": "..."
}
```

### Response fields

- `module`: detected intent, such as `Search`, `Recommend`, `Compare`, `Negotiate`, `Chat`, or `Selection`
- `filters_extracted`: merged filters currently active for that user
- `top_properties`: list of matched property objects
- `recommendation`: best property object when the user asks for a recommendation
- `comparison`: array of up to 2 properties when comparing
- `negotiation`: property object used for negotiation advice
- `fallback_used`: `true` when the backend had to relax filtering and show near matches
- `explanation`: short machine-readable explanation of the chosen path
- `reply_in_egyptian_arabic`: the user-facing chat reply

### Clarification cases

When the query is too vague or confidence is low, the backend may return:

- `module: "Guided Conversation"`
- `top_properties: []`
- a clarifying `reply_in_egyptian_arabic`

Your UI should render this as a normal assistant message and wait for the next user turn.

### Selection cases

If the user refers to one of the last shown properties, the backend may return:

- `module: "Selection"`
- a direct property link in the reply
- a single matched property in `top_properties` when available

## Lightweight search endpoint

### `POST /smartsearch`

Use this when you only need ordered property IDs, without the full conversational reply.

#### Request body

```json
{
  "query": "شقة في المعادي",
  "top_k": 5
}
```

#### Response

```json
{
  "property_ids": [101, 87, 56]
}
```

This is useful for:

- autocomplete-like search experiences
- quick result ranking
- loading property cards from another service after the backend ranks them

## Suggested frontend flow

### 1. Send user message

When the user submits a message:

1. Append the message to the local chat UI immediately
2. Call `POST /ai-advisor`
3. Render `reply_in_egyptian_arabic`
4. If `top_properties` is present, render property cards or a results panel

### 2. Keep chat session stable

Persist `user_id` per user/session so the backend can remember:

- conversation history
- previously shown properties
- accumulated filters

### 3. Render by intent

Use the backend fields to choose the right UI:

- **Search** → show a chat reply plus result cards
- **Recommend** → highlight the single best property
- **Compare** → show a side-by-side comparison layout
- **Negotiate** → show negotiation tips and the referenced property
- **Selection** → deep-link the selected property detail page
- **Guided Conversation** → show a follow-up question prompt

## Property data to expect

The properties returned by the backend come from the upstream catalog API and are passed through the ranking pipeline. Common fields include:

- `propertyId`
- `propertyType`
- `finishingType`
- `propertyStatus`
- `district`
- `city`
- `governorate`
- `price`
- `area`
- `rooms`
- `bathrooms`
- `floorNumber`
- `street`

Treat the object as the source of truth for the detail card and keep your UI tolerant of missing or null fields.

## UX recommendations

- Show the assistant reply and the property cards together when results exist
- Use a compact card for search results and a richer layout for recommendations
- If `fallback_used` is `true`, show a small note like “showing near matches”
- If the backend returns no matches, keep the chat tone friendly and prompt the user to broaden the search
- Preserve the most recent result list so the user can tap “this one” / “التانية” in the next message

## Angular integration example

### Service

```ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AiAdvisorRequest {
  user_id: number;
  query: string;
}

export interface AiAdvisorResponse {
  module: string;
  filters_extracted: Record<string, unknown>;
  top_properties: any[];
  recommendation: any | null;
  comparison: any[] | null;
  negotiation: any | null;
  fallback_used: boolean;
  explanation: string;
  reply_in_egyptian_arabic: string;
  confidence_score?: number;
}

@Injectable({ providedIn: 'root' })
export class ChatbotApiService {
  private readonly baseUrl = 'https://YOUR-BACKEND-URL';

  constructor(private readonly http: HttpClient) {}

  sendMessage(payload: AiAdvisorRequest): Observable<AiAdvisorResponse> {
    return this.http.post<AiAdvisorResponse>(`${this.baseUrl}/ai-advisor`, payload);
  }

  smartSearch(query: string, top_k = 5): Observable<{ property_ids: number[] }> {
    return this.http.post<{ property_ids: number[] }>(`${this.baseUrl}/smartsearch`, {
      query,
      top_k,
    });
  }
}
```

### Component usage

```ts
this.chatbotApi.sendMessage({
  user_id: this.userId,
  query: this.message,
}).subscribe((response) => {
  this.messages.push({ role: 'assistant', text: response.reply_in_egyptian_arabic });
  this.properties = response.top_properties ?? [];
});
```

## Error handling

Handle these cases gracefully in the frontend:

- Network failure: show a retry message
- Empty `top_properties`: show the chatbot text without cards
- Non-200 response: show a generic support message
- Missing `reply_in_egyptian_arabic`: fallback to a safe default message

## Security and configuration notes

- Do **not** expose `GOOGLE_API_KEY` in the frontend
- Keep secrets server-side only
- The backend currently allows all CORS origins, but you can still lock down your frontend deployment separately
- Sessions are in-memory, so restarting or scaling the backend may reset chat memory

## Quick integration checklist

- [ ] Set the backend base URL
- [ ] Persist a stable numeric `user_id`
- [ ] Call `POST /ai-advisor` on each chat turn
- [ ] Render `reply_in_egyptian_arabic`
- [ ] Render `top_properties` when present
- [ ] Support compare/recommend/negotiation states
- [ ] Handle empty results and clarification replies
- [ ] Never ship backend secrets to the browser

## Files to know

- `main.py` — FastAPI app and endpoints
- `session_manager.py` — in-memory per-user session storage
- `query_analyzer.py` — intent and filter extraction
- `search_chain.py` — conversational search reply generation
- `compare_chain.py` — comparison reply generation
- `negotiation_chain.py` — negotiation advice generation
