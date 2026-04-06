# Property Controller — Frontend Integration Guide

> **Base URL**: `{API_BASE}/api/Property`
> **Content-Type**: `application/json` (except `UpdateProperty` which uses `multipart/form-data`)

---

## 1. Get Property By ID

Get full details for a single property.

```
GET /api/Property/GetPropertyById/{id}
```

### Parameters

| Param | In | Type | Required | Description |
|-------|------|------|----------|-------------|
| `id` | path | `int` | ✅ | Property ID |

### ✅ Success Response — `200 OK`

```json
{
  "propertyId": 5,
  "propertyType": "Apartment",
  "propertyStatus": "Available",
  "finishingType": "Super Lux",
  "price": 1500000.00,
  "area": 120.50,
  "rooms": 3,
  "bathrooms": 2,
  "country": "مصر",
  "governorate": "Cairo",
  "city": "Nasr City",
  "district": "8th District",
  "street": "Abbas El-Akkad",
  "buildingNumber": 12,
  "floorNumber": 5,
  "apartmentNumber": 3,
  "imageURLs": ["image1.jpg", "image2.jpg"]
}
```

### ❌ Error Response — `404 Not Found`

```
"Property with ID {id} not found."
```

### Frontend Usage (JavaScript)

```javascript
const res = await fetch(`${API_BASE}/api/Property/GetPropertyById/${id}`);
const property = await res.json();

// Build image URLs:
// Each image is served from the static files folder
const imageUrl = `${API_BASE}/Images/${property.imageURLs[0]}`;
```

---

## 2. Get All Properties

Get a summary list of all properties (for listings/cards).

```
GET /api/Property/GetAllProperties
```

### Parameters

None.

### ✅ Success Response — `200 OK`

Returns an **array** of `PropertyResponse`:

```json
[
  {
    "propertyId": 1,
    "price": 1500000.00,
    "area": 120.50,
    "propertyType": "Apartment",
    "status": "Available",
    "city": "مصر",
    "district": "Nasr City",
    "imageURLs": ["img1.jpg", "img2.jpg"]
  }
]
```

> ⚠️ **Note**: `city` field actually returns `Country` and `district` returns `City` due to backend mapping. Keep this in mind when displaying location data.

### Empty State — `200 OK`

```json
[]
```

### Frontend Usage

```javascript
const res = await fetch(`${API_BASE}/api/Property/GetAllProperties`);
const properties = await res.json();

// Render property cards
properties.forEach(p => {
  const thumbnail = p.imageURLs?.[0]
    ? `${API_BASE}/Images/${p.imageURLs[0]}`
    : '/placeholder.png';
});
```

---

## 3. Global Search

Search properties by keyword across type, finishing, city, governorate, and district.

```
GET /api/Property/GlobalSearch?term={searchTerm}
```

### Parameters

| Param | In | Type | Required | Description |
|-------|------|------|----------|-------------|
| `term` | query | `string` | ✅ | Search keyword (case-insensitive) |

### Searchable Fields

- Property Type name (e.g., "Apartment", "Villa")
- Finishing Type name (e.g., "Super Lux")
- Location: City, Governorate, District

### ✅ Success Response — `200 OK`

Same shape as **Get All Properties** (`PropertyResponse[]`):

```json
[
  {
    "propertyId": 1,
    "price": 1500000.00,
    "area": 120.50,
    "propertyType": "Apartment",
    "status": "Available",
    "city": "Nasr City",
    "district": "8th District"
  }
]
```

> ⚠️ **Note**: This endpoint does NOT return `imageURLs`.

### ❌ Error Response — `400 Bad Request`

```
"Search term cannot be empty."
```

### Frontend Usage

```javascript
const res = await fetch(
  `${API_BASE}/api/Property/GlobalSearch?term=${encodeURIComponent(searchTerm)}`
);
const results = await res.json();
```

---

## 4. Update Property (with Images)

Update property details and replace all images.

```
PUT /api/Property/UpdateProperty/{id}
```

> ⚠️ **Content-Type**: `multipart/form-data` (NOT JSON — because of image file uploads)

### Parameters

| Param | In | Type | Required | Description |
|-------|------|------|----------|-------------|
| `id` | path | `int` | ✅ | Property ID |

### Request Body (`multipart/form-data`)

| Field | Type | Description |
|-------|------|-------------|
| `PropertyType` | `int` | Property type ID (FK) |
| `FinishingType` | `int` | Finishing type ID (FK) |
| `Negotiable` | `bool` | Is price negotiable |
| `Price` | `decimal` | Property price |
| `Area` | `decimal` | Area in m² |
| `Rooms` | `int` | Number of rooms |
| `Bathrooms` | `int` | Number of bathrooms |
| `Country` | `string?` | Country name |
| `Governorate` | `string` | Governorate name |
| `City` | `string` | City name |
| `District` | `string` | District name |
| `Street` | `string` | Street name |
| `BuildingNumber` | `int` | Building number |
| `FloorNumber` | `int` | Floor number |
| `ApartmentNumber` | `int` | Apartment number |
| `ImageURLs` | `File[]` | Image files (replaces ALL existing images) |

> ⚠️ **Important**: Uploading images **deletes all previous images** and replaces them with the new ones.

### ✅ Success Response — `200 OK`

```json
{
  "status": "success",
  "data": {
    "message": "Property 5 updated successfully."
  }
}
```

### ❌ Error Responses

| Status | Body |
|--------|------|
| `400` | Validation errors (ModelState) |
| `404` | `"Property {id} not found."` |

### Frontend Usage

```javascript
const formData = new FormData();
formData.append('PropertyType', 1);        // ID, not name
formData.append('FinishingType', 4);       // ID, not name
formData.append('Negotiable', true);
formData.append('Price', 1500000);
formData.append('Area', 120.5);
formData.append('Rooms', 3);
formData.append('Bathrooms', 2);
formData.append('Country', 'مصر');
formData.append('Governorate', 'Cairo');
formData.append('City', 'Nasr City');
formData.append('District', '8th District');
formData.append('Street', 'Abbas El-Akkad');
formData.append('BuildingNumber', 12);
formData.append('FloorNumber', 5);
formData.append('ApartmentNumber', 3);

// Append multiple image files
for (const file of selectedFiles) {
  formData.append('ImageURLs', file);
}

const res = await fetch(`${API_BASE}/api/Property/UpdateProperty/${id}`, {
  method: 'PUT',
  body: formData
  // Do NOT set Content-Type header — browser sets it automatically with boundary
});

const result = await res.json();
```

---

## 5. Handle Call Outcome From Seller (AI-Internal)

> ⚠️ **This endpoint is called by the AI calling service, NOT by the frontend UI.**
> Included here for reference only.

```
POST /api/Property/HandleCallOutcomeFromSeller
```

### Request Body (JSON)

```json
{
  "leadID": "42",
  "contactName": "Ahmed Hassan",
  "callId": "call_abc123",
  "summary": "Seller agreed to list the property...",
  "duration": 145.5,
  "callOutcome": "interested",
  "propertyDTO": {
    "propertyInfo": {
      "propertyType": "Apartment",
      "price": 1500000,
      "area": 120,
      "rooms": 3,
      "bathrooms": 2,
      "finishingType": "Super Lux",
      "negotiable": false,
      "additionalInfo": "Near the metro station"
    },
    "propertyPayment": {
      "downPayment": 300000,
      "paymentMethod": "Installments",
      "listingType": "For Sale"
    },
    "propertyLocation": {
      "country": "مصر",
      "governorate": "Cairo",
      "city": "Nasr City",
      "district": "8th District",
      "street": "Abbas El-Akkad",
      "buildingNumber": 12,
      "floorNumber": 5,
      "apartmentNumber": 3
    }
  }
}
```

### Call Outcome Values

| Value | Result |
|-------|--------|
| `"interested"` | Property is created, seller marked qualified, confirmation email is sent |
| `"notinterested"` | Seller marked as not interested |
| `"noanswer"` / `"busy"` | Retry (up to 3 times), then marked as failed |
| `"failed"` | Call marked as failed |

### ✅ Success Response — `200 OK`

```json
{
  "status": "success",
  "data": {
    "message": "Outcome processed successfully"
  }
}
```

---

## Quick Reference — Response Type Map

| Endpoint | HTTP | Response Type | Auth |
|----------|------|---------------|------|
| `GetPropertyById/{id}` | GET | `PropertyListDto` | ❌ |
| `GetAllProperties` | GET | `PropertyResponse[]` | ❌ |
| `GlobalSearch?term=` | GET | `PropertyResponse[]` | ❌ |
| `UpdateProperty/{id}` | PUT | `{ status, data }` | ❌ |
| `HandleCallOutcomeFromSeller` | POST | `{ status, data }` | ❌ |

---

## Image Handling

- Images are stored in `wwwroot/Images/` on the server.
- Image file names are auto-generated GUIDs (e.g., `3a1b2c3d-4e5f-...jpg`).
- **To display an image**, build the URL as:
  ```
  {API_BASE}/Images/{imageFileName}
  ```
- **When updating**, all old images are deleted — send the full set of images every time.

---

## TypeScript Interfaces

```typescript
/** GET /GetPropertyById/{id} */
interface PropertyListDto {
  propertyId: number;
  propertyType: string;
  propertyStatus: string;
  finishingType: string;
  price: number;
  area: number;
  rooms: number;
  bathrooms: number;
  country: string;
  governorate: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: number;
  floorNumber: number;
  apartmentNumber: number;
  imageURLs: string[];
}

/** GET /GetAllProperties and /GlobalSearch */
interface PropertyResponse {
  propertyId: number;
  price: number;
  area: number;
  propertyType: string;
  status: string;
  city: string;
  district: string;
  imageURLs?: string[];  // null in GlobalSearch
}

/** PUT /UpdateProperty/{id} — FormData fields */
interface UpdatePropertyPayload {
  PropertyType: number;      // FK ID
  FinishingType: number;     // FK ID
  Negotiable: boolean;
  Price: number;
  Area: number;
  Rooms: number;
  Bathrooms: number;
  Country?: string;
  Governorate: string;
  City: string;
  District: string;
  Street: string;
  BuildingNumber: number;
  FloorNumber: number;
  ApartmentNumber: number;
  ImageURLs: File[];
}
```
