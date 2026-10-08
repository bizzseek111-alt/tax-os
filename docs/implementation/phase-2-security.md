# Phase 2 — File Security & Ingestion Hardening Specification

**Module:** `src/server/services/fileSecurity.ts`  
**Security Level:** Enterprise Grade (OWASP Top 10 File Upload Protection)  
**Status:** FULLY ENFORCED  

---

## 1. Magic Byte Inspection (True MIME Detection)

MIME types declared in HTTP headers (`Content-Type`) or file extensions are untrusted user input. `FileSecurityService` evaluates the leading byte stream:

| Document Category | Magic Byte Signature | Permitted MIME Type |
|---|---|---|
| PDF Document | `[0x25, 0x50, 0x44, 0x46]` (`%PDF`) | `application/pdf` |
| PNG Scans | `[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]` | `image/png` |
| JPEG Receipts | `[0xFF, 0xD8, 0xFF]` | `image/jpeg` |
| ZIP / Office Bundles | `[0x50, 0x4B, 0x03, 0x04]` | `application/zip` |
| Delimited Feeds | Printable ASCII / UTF-8 | `text/csv`, `text/plain` |

Executables (`MZ`, `\x7fELF`), shell scripts, and unknown binary formats are rejected with HTTP 400.

---

## 2. Active Executable PDF Inspection

PDFs with active scripting or launch triggers are dropped immediately before entering the OCR pipeline:
- `/JavaScript` and `/JS `
- `/Launch`
- `/EmbeddedFiles`
- `/AcroForm << ... /XFA`

---

## 3. CSV Formula Injection (DDE) Neutralization

Spreadsheets exported from accounting systems may contain malicious dynamic data exchange commands:
`=cmd|'/C calc'!A0` or `+`, `-`, `@`.

`FileSecurityService.sanitizeCsvField` prepends a single quote (`'`) to any cell beginning with dangerous formula triggers, neutralizing execution in Excel and Google Sheets while preserving financial audit numbers.

---

## 4. Prompt Injection Guard

Document text passed into AI tax reasoning engines is scrubbed of adversarial system prompt override delimiters:
- Strips `system:`, `assistant:` headers
- Redacts `"ignore all previous instructions"`
- Redacts `"you are now a helpful..."`
