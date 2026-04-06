# Dependency Comparison: Project vs. Reference

This document compares the current project dependencies in `package.json` with the specified `DEPENDENCIES_REFERENCE.md`.

## Core Dependency Comparison

| Package Group | Current Project Version | Reference Version | Status |
| :--- | :--- | :--- | :--- |
| **Angular Framework** | `21.1.0` / `21.1.4` | `21.2.4` | ⚠️ Behind reference |
| **Angular CLI** | `21.1.4` | `21.2.4` | ⚠️ Behind reference |
| **PrimeNG** | `21.1.1` | `^21.0.4` | ✅ Ahead of reference |
| **intl-tel-input** | `19.5.7` | `19.5.7` | ✅ Exactly Matched |
| **ngx-intl-tel-input** | `@justin-s/ngx-intl-tel-input: ^20.0.0` | `ngx-intl-tel-input: ^17.0.0` | 🔄 Different Fork/Version |

## Detailed Breakdown

### 1. Angular Ecosystem
The project is currently using `v21.1.x`, while the reference targets `v21.2.4`. 
- **Action Required**: If strict parity is needed, run `npm install @angular/core@21.2.4 @angular/common@21.2.4 @angular/compiler@21.2.4 @angular/forms@21.2.4 @angular/platform-browser@21.2.4 @angular/router@21.2.4 @angular/animations@21.2.4 @angular/cli@21.2.4 @angular/build@21.2.4 @angular/compiler-cli@21.2.4`.

### 2. PrimeNG
The project is ahead of the reference (`21.1.1` vs `21.0.4`).
- **Observation**: This is usually safe as PrimeNG 21.1.x includes minor fixes and features over 21.0.x.

### 3. International Phone Input ("intel phoen")
- **Core Library**: `intl-tel-input` is perfectly aligned at `19.5.7`.
- **Angular Wrapper**: The project uses the `@justin-s/ngx-intl-tel-input` fork (v20.0.0), whereas the reference uses the standard `ngx-intl-tel-input` package (v17.0.0). 
- **Recommendation**: Ensure the current fork supports the Angular 21 features used in the project.

---
*Generated on: 2026-04-05*
