# Dashboard Axnos Manasa - Dependency Reference

Generated from:
- `package.json`
- `angular.json`

Date: 2026-04-05

## Core Versions You Asked For

| Package | Version |
|---|---|
| Angular (all `@angular/*` runtime packages) | `21.2.4` |
| Angular CLI (`@angular/cli`) | `21.2.4` |
| PrimeNG (`primeng`) | `^21.0.4` |
| PrimeIcons (`primeicons`) | `^7.0.0` |
| PrimeFlex (`primeflex`) | `^4.0.0` |
| ngx-intl-tel-input (`ngx-intl-tel-input`) | `^17.0.0` |
| intl-tel-input (`intl-tel-input`) | `^19.5.7` |

## package.json

### Package Manager
- `npm@10.9.3`

### Dependencies

| Package | Version |
|---|---|
| `@angular/animations` | `21.2.4` |
| `@angular/cdk` | `21.2.4` |
| `@angular/common` | `21.2.4` |
| `@angular/compiler` | `21.2.4` |
| `@angular/core` | `21.2.4` |
| `@angular/forms` | `21.2.4` |
| `@angular/platform-browser` | `21.2.4` |
| `@angular/router` | `21.2.4` |
| `@deeby/dottmoon-media-dropzone` | `^0.10.1` |
| `@microsoft/signalr` | `^10.0.0` |
| `@ngneat/until-destroy` | `^10.0.0` |
| `@ngx-translate/core` | `^17.0.0` |
| `@ngx-translate/http-loader` | `^17.0.0` |
| `@primeuix/styles` | `^2.0.3` |
| `@primeuix/themes` | `^2.0.3` |
| `apexcharts` | `^5.3.6` |
| `exceljs` | `^4.4.0` |
| `intl-tel-input` | `^19.5.7` |
| `jspdf` | `^4.1.0` |
| `jspdf-autotable` | `^5.0.7` |
| `luxon` | `^3.7.2` |
| `moment` | `^2.30.1` |
| `moment-timezone` | `^0.6.0` |
| `ng-apexcharts` | `^2.0.4` |
| `ngx-intl-tel-input` | `^17.0.0` |
| `primeflex` | `^4.0.0` |
| `primeicons` | `^7.0.0` |
| `primeng` | `^21.0.4` |
| `quill` | `^2.0.3` |
| `rxjs` | `~7.8.0` |
| `tslib` | `^2.3.0` |

### Dev Dependencies

| Package | Version |
|---|---|
| `@angular/build` | `21.2.4` |
| `@angular/cli` | `21.2.4` |
| `@angular/compiler-cli` | `21.2.4` |
| `typescript` | `~5.9.2` |

## angular.json Package/Library References

### Builders
- `@angular/build:application`
- `@angular/build:dev-server`

### Styles imported from node_modules
- `intl-tel-input/build/css/intlTelInput.css`
- `primeflex/primeflex.css`
- `primeicons/primeicons.css`

### allowedCommonJsDependencies
- `exceljs`
- `moment`
- `moment-timezone`
- `html2canvas`
- `canvg`
- `rgbcolor`
- `raf`
- `quill-delta`

## Notes for Reuse in Another Project
- Keep Angular packages aligned on the same version (`21.2.4`) to avoid peer-dependency conflicts.
- Install both `ngx-intl-tel-input` and `intl-tel-input`, and include the intl-tel CSS in styles.
- Add PrimeNG ecosystem packages together (`primeng`, `primeicons`, `primeflex`).
