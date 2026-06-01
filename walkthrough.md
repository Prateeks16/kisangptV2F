# Frontend Integration Walkthrough: JWT Authentication

This walkthrough details the backend JWT authentication architecture, endpoint contracts, request/response formats, and styling assets. Use this guide to update your separate frontend codebase to integrate with the backend.

---

## 🎨 Stitch Design References
To ensure consistent branding and visual layout, we generated high-fidelity, premium dark-mode UI screens for the frontend. You can find them in the Stitch project:

* **Stitch Project ID:** `14134323847416827862`
* **Design Systems:** `assets/e97a1678f5254d9a85ee84151d5044d7` (Agri-Enterprise Intelligence theme)
* **Login Screen ID:** `67e86fec500341948e5d9578153958ad`
* **Signup Screen ID:** `c13fce547d7943ed96b4bd67e2872487`

---

## 🔌 API Integration Contracts

The backend authentication endpoints are prefixed with `/api/v1/auth`. Below are the technical details for each route:

### 1. User Signup
Registers a new user in the SQLite database and hashes the password using bcrypt.

* **URL:** `/api/v1/auth/signup`
* **Method:** `POST`
* **Request Header:** `Content-Type: application/json`
* **Request Payload (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "full_name": "John Doe"
  }
  ```
  *(Note: Password must be at least 8 characters long)*
* **Expected Response (`201 Created`):**
  ```json
  {
    "email": "user@example.com",
    "full_name": "John Doe",
    "is_active": true,
    "is_superuser": false,
    "id": 1
  }
  ```
* **Error Response (`400 Bad Request` - e.g. Email already exists):**
  ```json
  {
    "detail": "The user with this email already exists in the system."
  }
  ```

---

### 2. User Login (Obtain Token)
Authenticates credentials and returns a signed JSON Web Token (JWT).

> [!WARNING]
> This endpoint uses standard OAuth2 credentials form format (`application/x-www-form-urlencoded`), **NOT** JSON.

* **URL:** `/api/v1/auth/login`
* **Method:** `POST`
* **Request Header:** `Content-Type: application/x-www-form-urlencoded`
* **Request Payload (URL Encoded Form):**
  * `username`: `user@example.com`
  * `password`: `securepassword123`
* **Expected Response (`200 OK`):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAi...",
    "token_type": "bearer"
  }
  ```
* **Error Response (`400 Bad Request` - e.g. Incorrect credentials):**
  ```json
  {
    "detail": "Incorrect email or password"
  }
  ```

---

### 3. Get Authenticated User Profile
Retrieves the logged-in user profile details using the JWT access token.

* **URL:** `/api/v1/auth/me`
* **Method:** `GET`
* **Request Header:** `Authorization: Bearer <access_token>`
* **Expected Response (`200 OK`):**
  ```json
  {
    "email": "user@example.com",
    "full_name": "John Doe",
    "is_active": true,
    "is_superuser": false,
    "id": 1
  }
  ```
* **Error Response (`401 Unauthorized` - Token missing or expired):**
  ```json
  {
    "detail": "Could not validate credentials"
  }
  ```

---

## 🛠️ Frontend Implementation Guide (React/JS/HTML)

Here is a recommended approach for storing and attaching JWT tokens in your frontend project:

### 1. Storing the Token (e.g. Login Handler)
Upon a successful login response, save the `access_token` into `localStorage` (or `sessionStorage`):

```javascript
async function loginUser(email, password) {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);

  const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params
  });

  if (response.ok) {
    const data = await response.json();
    // Save the token
    localStorage.setItem('auth_token', data.access_token);
    return true;
  } else {
    const err = await response.json();
    throw new Error(err.detail);
  }
}
```

### 2. Attaching the Token to Protected API Requests
For any endpoints that require authentication (like `/api/v1/auth/me` or if you protect the `/ask` route), retrieve the token from local storage and append it as a `Bearer` token inside the `Authorization` header:

```javascript
async function fetchUserProfile() {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    // Redirect to login page
    window.location.href = '/login';
    return;
  }

  const response = await fetch('http://127.0.0.1:8000/api/v1/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    // Token has expired or is invalid
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    return;
  }

  return await response.json();
}
```

### 3. Setting Up a Logout Action
Simply wipe the token from storage and route the user back to the sign-in page:

```javascript
function logout() {
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
}
```
