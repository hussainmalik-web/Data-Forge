
## v0.24 — Apply reliability

Cleaning Apply workflow hardened; see `docs/V0.24_APPLY_RELIABILITY.md`.
# Data Forge — Final Integrated Build

## Status

**Final local integration build** — functional backend + Studio AI React/Vite frontend.

### Source of truth

The deterministic FastAPI/pandas backend remains the source of truth for all data processing. The Studio AI frontend is the presentation and interaction layer.

### Preserved workflow

Upload → Preview → Profile → Quality → Quality Score → Clean → Before/After → Cleaning Log → Explore → Visualize → Dashboard → Export

### Cleaning operations

- Remove duplicate rows
- Remove completely empty rows
- Remove completely empty columns
- Remove rows containing missing values
- Fill numeric values: median, mean, zero
- Fill categorical values: Unknown, mode, forward fill, custom
- Trim whitespace
- Lowercase / Title Case / UPPERCASE
- Parse selected date columns
- Convert selected columns to numeric/string/date
- Rename selected columns
- Remove selected columns
- Preview changes
- Apply changes
- Before/after metrics and audit log
- CSV/XLSX export

### Reliability fixes in this build

- Fixed frontend state declaration syntax error in WorkspacePage.
- Cleaning operation selection is tracked independently from operation configuration.
- Rename and remove-column operations can be selected before their configuration is complete.
- Parse-date operation can be selected first and then configured explicitly.
- Apply Changes does not require a previous preview.
- Cleaning errors are visible in the workspace instead of failing silently.
- Workspace responds to navigation changes from the mobile navigation.
- Cleaned dataset profile lookup ignores metadata `.json` files and reads only CSV/XLSX files.
- Original source datasets remain unchanged; Apply creates a new cleaned dataset.
- Backend regression suite: **16 tests passed**.

### Validation limitation

The final ZIP was syntax-reviewed and the Python backend was compiled/tested. A complete frontend `npm install` / production build could not be completed in the build environment because npm registry dependency downloads timed out. Run `npm install` and `npm run build` locally to perform the final browser-side build validation.
