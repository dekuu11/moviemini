# Demo Mode Setup

The app runs in demo mode - no login required. It uses a demo user (id: 1, username: demo).

**For favorites to work**, create the demo user. Run this on your server (replace URL with your app URL):

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'
```

If "demo" is already taken, favorites may show empty. Browsing and viewing movies work without this.
