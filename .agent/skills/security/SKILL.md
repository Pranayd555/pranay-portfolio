# Security Sentinel Skill

## Goal
Enforce industry-standard security practices to protect the Angular application from XSS, Injection, and data exposure.

## Description
Use this skill when writing Angular services, handling user input, integrating with Firebase, or configuring HTTP headers.

## Security Directives

### 1. Cross-Site Scripting (XSS) Prevention
- **Inner-HTML**: Avoid `[innerHTML]` at all costs. If mandatory, the agent must use Angular's `DomSanitizer` to bypass security explicitly and document the reason.
- **Data Binding**: Always prefer `{{ value }}` (interpolation) as Angular automatically sanitizes this data.
- **External URLs**: Use `SecurityContext.URL` when binding to `src` or `href` attributes.

### 2. Angular & Firebase Specifics
- **Input Validation**: Use Angular Reactive Forms with built-in validators for all user inputs.
- **Firebase Rules**: When modifying Firestore or Storage, verify that rules are not set to `allow read, write: if true;`. Always suggest a "Least Privilege" model.
- **API Keys**: Never hardcode Firebase keys in logic. Ensure they are stored in `environment.ts` and that `.gitignore` includes sensitive environment files.

### 3. Header & Communication Security
- **Content Security Policy (CSP)**: Ensure the application includes meta tags or headers that restrict script execution to trusted domains.
- **Sanitization**: Use the `bypassSecurityTrust*` methods only after a manual "Code Review" artifact is generated for the user.

## Execution Workflow
1. **Scan**: Before finishing a task, scan the new code for keywords: `eval()`, `innerHTML`, `document.write`.
2. **Warn**: If a potential vulnerability is found, create a "Security Advisory" artifact explaining the risk.
3. **Fix**: Suggest the secure alternative (e.g., replacing `innerHTML` with `textContent`).

## Tools
- Terminal: `npm audit`
- Browser: Check console for CSP violations