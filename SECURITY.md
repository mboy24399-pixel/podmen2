# Security Policy

## Reporting a vulnerability

Please report security vulnerabilities privately to the repository owner rather than opening a public issue. Do not include secrets, payment credentials, or personal data in public tickets.

## Production security requirements

- Server-side authentication and authorization for privileged operations.
- Deny-by-default Firestore/Storage rules.
- Server-side Razorpay signature and webhook verification.
- Idempotent payment processing.
- Secrets supplied through environment variables/deployment secret storage.
- No production credentials committed to Git.
- SSRF-safe handling of administrator-supplied remote media URLs.
- Rate limiting and abuse controls on sensitive endpoints.
