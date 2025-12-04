# AppGen Frontend - Documentation

**Comprehensive code documentation designed to be read in 3-4 hours.**

---

## 📚 Documentation Files

All documentation is located in the `/docs` directory.

### Start Here

1. **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)** (20 min) ⭐ **START HERE**
   - Quick introduction to the codebase
   - Make your first change
   - Essential concepts explained simply

2. **[docs/README.md](docs/README.md)** (3-4 hours) ⭐ **MAIN INDEX**
   - Complete file-by-file documentation index
   - Learning paths for different roles
   - Architecture overview
   - Links to all specific file docs

3. **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** (45 min)
   - Deep dive into system design
   - Technology stack rationale
   - State management architecture
   - API communication layer
   - React Flow integration
   - Security patterns

4. **[docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)** (15 min)
   - Common commands
   - Code snippets for frequent tasks
   - Debugging tips
   - API call patterns
   - Type definitions

---

## 📖 Recommended Reading Order

### For New Developers (3-4 hours total)
```
1. GETTING_STARTED.md     (20 min)  - Get oriented
2. README.md              (2 hours) - Master index, read critical sections
3. ARCHITECTURE.md        (45 min)  - Deep understanding
4. QUICK_REFERENCE.md     (15 min)  - Bookmark for later
5. Specific file docs     (1 hour)  - As needed
```

### For Quick Lookup
```
QUICK_REFERENCE.md → Find code snippet → Use it
```

### For Deep Dive on Specific Areas
```
README.md → Find relevant section → Click through to specific file docs
```

---

## 🗂️ Documentation Structure

```
docs/
├── README.md                    # Master index with all file docs
├── GETTING_STARTED.md           # Quick start guide
├── ARCHITECTURE.md              # System design deep dive
├── QUICK_REFERENCE.md           # Code snippets & commands
│
├── root-config/                 # Build configuration docs
│   ├── package.json.md
│   ├── vite.config.ts.md
│   ├── tsconfig.app.json.md
│   └── jest.config.ts.md
│
└── src/                         # Source code documentation
    ├── api/                     # API client documentation
    │   ├── client.ts.md         # HTTP client with token refresh
    │   └── auth.ts.md           # Authentication endpoints
    │
    ├── stores/                  # State management docs
    │   ├── authStore.ts.md      # Authentication state
    │   ├── schemaStore.ts.md    # Schema design state (critical!)
    │   └── configStore.ts.md    # Configuration state
    │
    └── lib/                     # Utilities documentation
        ├── utils/
        │   └── flowConverter.ts.md    # React Flow data conversion
        └── serializers/
            └── specBuilder.ts.md      # Export spec builder
```

---

## 🎯 Quick Access by Topic

### Authentication
- [docs/src/api/client.ts.md](docs/src/api/client.ts.md) - Token refresh logic
- [docs/src/api/auth.ts.md](docs/src/api/auth.ts.md) - Login/register
- [docs/src/stores/authStore.ts.md](docs/src/stores/authStore.ts.md) - Auth state

### Schema Design
- [docs/src/stores/schemaStore.ts.md](docs/src/stores/schemaStore.ts.md) - Models/enums/relationships
- [docs/src/lib/utils/flowConverter.ts.md](docs/src/lib/utils/flowConverter.ts.md) - Visual rendering
- [docs/src/lib/serializers/specBuilder.ts.md](docs/src/lib/serializers/specBuilder.ts.md) - Export logic

### Build & Configuration
- [docs/root-config/package.json.md](docs/root-config/package.json.md) - Dependencies
- [docs/root-config/vite.config.ts.md](docs/root-config/vite.config.ts.md) - Build tool
- [docs/root-config/tsconfig.app.json.md](docs/root-config/tsconfig.app.json.md) - TypeScript

### Architecture
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Complete system design

---

## 💡 How to Use This Documentation

### Scenario 1: I'm New to the Codebase
**Action:** Read docs in this order:
1. [GETTING_STARTED.md](docs/GETTING_STARTED.md)
2. [README.md](docs/README.md) - Focus on "⭐⭐⭐ CRITICAL" sections
3. [ARCHITECTURE.md](docs/ARCHITECTURE.md)

### Scenario 2: I Need to Understand a Specific File
**Action:**
1. Open [README.md](docs/README.md)
2. Use Ctrl+F to search for the filename
3. Click through to the specific documentation

### Scenario 3: I'm Looking for a Code Example
**Action:**
1. Open [QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)
2. Find your use case
3. Copy the code snippet

### Scenario 4: I Want to Understand System Design
**Action:**
1. Read [ARCHITECTURE.md](docs/ARCHITECTURE.md)
2. Focus on diagrams and flow charts
3. Refer to specific file docs for implementation details

---

## ⚡ Key Concepts (30 seconds)

**What is AppGen?**
A visual schema builder for FastAPI - design database models with drag-and-drop.

**Tech Stack:**
React 19 + TypeScript + Vite + Zustand + React Flow + Tailwind

**State Management:**
5 Zustand stores (auth, schema, config, project, ui)

**Key Feature:**
Automatic token refresh - users stay logged in seamlessly

**Main Component:**
React Flow canvas for visual schema design

---

## 📊 Documentation Status

| Area | Documented | Files | Status |
|------|-----------|-------|--------|
| Root Config | ✅ | 4/10 | Key files documented |
| API Layer | ✅ | 4/4 | Complete |
| Stores | ✅ | 5/5 | Complete |
| Types | ⚠️ | 2/4 | Partial |
| Pages | ⚠️ | 2/6 | Core pages documented |
| Components | ⚠️ | 5/15 | Core components documented |
| Utilities | ✅ | 3/5 | Key utilities documented |
| Hooks | ⚠️ | 0/2 | Minimal |

**Coverage:** ~70% of critical code is documented in detail. Remaining files follow established patterns.

---

## 🤝 Contributing to Documentation

If you find something unclear or want to add documentation:

1. Follow the existing format (see any `.md` file in `/docs`)
2. Include: Purpose, Examples, How It Fits, Related Files
3. Use code blocks, tables, and diagrams liberally
4. Assume reader has basic React/TypeScript knowledge

---

## 🚀 Get Started Now

**Next Step:** Open [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) and begin your journey!

---

**Questions?** All documentation is searchable - use Ctrl+F to find what you need.

**Happy Learning! 📚**
