# Twellium Executive API Endpoints

> Base URL: `https://api.twellium-api.com/api`
>
> All authenticated endpoints require: `Authorization: Bearer <access_token>`

---

## Authentication

### Login

```http
POST {{base_url}}/auth/token/
Content-Type: application/json

{
  "username": "",
  "password": ""
}
```

### Refresh Token

```http
POST {{base_url}}/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "<refresh_token>"
}
```

---

## PET Lines

```http
GET {{base_url}}/core/pets/?page_size=1000
Authorization: Bearer {{token}}
```

---

## Shifts

```http
GET {{base_url}}/production/shifts/
Authorization: Bearer {{token}}
```

---

## OEE Summary

```http
GET {{base_url}}/production/reports/oee_summary/?production_date=2026-04-18&page_size=1000
Authorization: Bearer {{token}}
```

```http
GET {{base_url}}/production/reports/oee_summary/?start_date=2026-04-17&end_date=2026-04-18&page_size=1000
Authorization: Bearer {{token}}
```

```http
GET {{base_url}}/production/reports/oee_summary/?datetime_start_time=2026-04-18T00:00:00Z&datetime_end_time=2026-04-18T23:59:59Z
Authorization: Bearer {{token}}
```

```http
GET {{base_url}}/production/reports/oee_summary/?start_date=2026-04-18&end_date=2026-04-18&shift_name=Morning&page_size=1000
Authorization: Bearer {{token}}
```

---

## Stoppages

```http
GET {{base_url}}/production/stoppages/?page_size=1000
Authorization: Bearer {{token}}
```

```http
GET {{base_url}}/production/stoppages/?log_date=2026-04-18&page_size=1000
Authorization: Bearer {{token}}
```

---

## Stoppages Summary

```http
GET {{base_url}}/production/stoppages/stoppages_summary/?start_date=2026-04-18&end_date=2026-04-18&shift_name=Morning&page_size=1000
Authorization: Bearer {{token}}
```

---

## Response Format

All responses are wrapped in:

```json
{
  "status_code": 200,
  "message": "Success",
  "data": { ... }
}
```

Paginated list endpoints return `data` as:

```json
{
  "count": 50,
  "next": "...?page=2",
  "previous": null,
  "results": [ ... ]
}
```

### Variables

| Variable       | Description                          |
|----------------|--------------------------------------|
| `{{base_url}}` | `https://api.twellium-api.com/api`   |
| `{{token}}`    | JWT access token from login response |
