---
name: JWT Debugger
summary: A browser-based JWT playground for decoding, editing, regenerating, and verifying tokens with immediate feedback.
year: 2025
stack:
  - React
  - TypeScript
  - Vite
  - Tailwind CSS
  - jose
  - jsonwebtoken
status: active
accessHref: https://jwt.makarima.dev/
accessLabel: Open project
---

JWT Debugger is a small utility for the repetitive work around JSON Web Tokens: inspect the header and payload, change claims, re-sign the token, and confirm whether the signature still matches. Instead of jumping between snippets, docs, and ad hoc scripts, the workflow stays in one browser tab.

![JWT Debugger landing page showing token input, decoded claims, and verification tools](/images/jwt-debugger/landing-page.png "The landing page centers the full JWT workflow in one place: paste a token, inspect claims, edit payload data, and verify signatures immediately.")

The app decodes tokens client-side, keeps the payload editable, and regenerates HS256 tokens when the payload or secret changes. Verification runs alongside editing, so the interface can show immediately when a token is malformed, a payload is invalid JSON, or a signature no longer matches the supplied secret.

I treated it as a practical developer tool rather than a security product. The interesting part is the fast feedback loop: decode, edit, verify, copy, repeat. That makes it useful for debugging local auth flows, reproducing test cases, and checking assumptions while working on systems that rely on signed tokens.

The implementation uses React, TypeScript, Vite, and a compact UI layer, with JWT generation and verification logic wired directly into the app. It is intentionally narrow in scope, but it removes enough friction to make everyday token debugging much less tedious.
