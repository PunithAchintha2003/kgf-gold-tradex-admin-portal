# KGF Gold TradeX - Admin Portal

Admin portal for managing users and system operations.

## Features

- 🔐 Secure authentication with role-based access (SUPER_ADMIN only)
- 📊 Dashboard with system statistics
- 👥 User management (view, edit, delete users)
- 🎨 Modern UI with Material-UI
- 📱 Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional):
```
VITE_API_URL=http://localhost:5001/api/v1
```

3. Start the development server:
```bash
npm run dev
```

The admin portal will be available at `http://localhost:4001`

## Default Admin Credentials

- Email: `admin@gmail.com`
- Password: `1234admin@`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.
