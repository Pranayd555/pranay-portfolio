---
trigger: always_on
---

# Angular Security Enforcement

## Scope
Applied to all `*.ts` and `*.html` files.

## Rules
1. **XSS Prevention**: 
   - Prohibit use of `[innerHTML]`, `[outerHTML]`, and `ElementRef.nativeElement` for direct DOM manipulation.
   - If dynamic HTML is required, use `DomSanitizer.bypassSecurityTrustHtml` only inside a dedicated `SanitizePipe`.
2. **Safe Navigation**: 
   - Use the optional chaining operator `?.` to prevent null-pointer exceptions that could lead to application crashes (DoS).
3. **Template Injection**:
   - Never use `eval()` or `new Function()` to execute strings as code.
4. **HTTP Security**:
   - All external API calls must be routed through an `AuthInterceptor` to attach CSRF tokens if applicable.