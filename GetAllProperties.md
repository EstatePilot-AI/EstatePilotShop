# GET /api/Property/GetAllProperties

Frontend reference for the properties list endpoint.

## Endpoint

- **Method:** `GET`
- **URL:** `/api/Property/GetAllProperties`
- **Auth:** None required in the controller as currently implemented
- **Content-Type:** `application/json`

## Query parameters

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `pageNumber` | number | `1` | No | Page index, starting at 1 |
| `pageSize` | number | `10` | No | Number of items per page |
| `term` | string | `null` | No | Search term matched against property type, finishing type, and location fields |

### Example request

```http
GET /api/Property/GetAllProperties?pageNumber=1&pageSize=10&term=cairo
```

## Response shape

The endpoint returns a paginated envelope:

```ts
{
  data: PropertySummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
```

### `PropertySummary`

```ts
{
  propertyId: number;
  price: number;
  area: number;
  propertyType: string | null;
  status: string | null;
  city: string | null;
  district: string | null;
  createdAt: string;
  imageURLs: string[] | null;
}
```

## Example response

```json
{
  "data": [
    {
      "propertyId": 15,
      "price": 2500000,
      "area": 145,
      "propertyType": "Apartment",
      "status": "Active",
      "city": "Egypt",
      "district": "Cairo",
      "createdAt": "2d ago",
      "imageURLs": [
        "https://cdn.example.com/properties/15/1.jpg"
      ]
    }
  ],
  "totalCount": 48,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 5,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

## Frontend usage example

### Fetch

```ts
export async function getAllProperties(pageNumber = 1, pageSize = 10, term?: string) {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  });

  if (term?.trim()) {
    params.set("term", term.trim());
  }

  const response = await fetch(`/api/Property/GetAllProperties?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to load properties: ${response.status}`);
  }

  return response.json();
}
```

### Axios

```ts
import axios from "axios";

export const getAllProperties = (pageNumber = 1, pageSize = 10, term?: string) => {
  return axios.get("/api/Property/GetAllProperties", {
    params: {
      pageNumber,
      pageSize,
      term: term?.trim() || undefined,
    },
  });
};
```

## Notes for frontend

- The backend only returns properties where `PropertyStatusId == 1`.
- `createdAt` is already formatted as a relative string like `Just now`, `2m ago`, `3h ago`, or a date like `Apr 17`.
- `imageURLs` can be empty or `null`; handle both cases in the UI.
- The response currently maps the `city` and `district` fields from backend location data as returned by the API, so treat the values as source-of-truth from the response.

## Suggested UI handling

- Show a loading state while the request is in flight.
- Render an empty state when `data.length === 0`.
- Use `totalCount`, `pageNumber`, `pageSize`, and `totalPages` to build pagination controls.
- Use `term` for search input debounce if the user is filtering properties.
