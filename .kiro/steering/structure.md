# Project Structure

## Current Layout

```
learn-dicoding/
└── .kiro/
    ├── steering/       # AI assistant context files
    └── specs/          # Feature specs
```

## Expected Organization

As courses and submissions are added, follow this structure:

```
learn-dicoding/
├── .kiro/
├── <course-slug>/          # One directory per Dicoding course
│   ├── README.md           # Course name, learning objectives, submission notes
│   ├── src/                # Source files
│   ├── public/ or dist/    # Build output (do not commit dist if gitignored)
│   └── package.json        # Per-project dependencies
└── README.md               # Workspace overview
```

## Conventions

- Use `kebab-case` for directory and file names
- Each course subdirectory is self-contained with its own dependencies and config
- Keep a `README.md` in each course directory describing the project and how to run it
- Do not share `node_modules` or build artifacts across course directories
- Commit only source files; add `dist/`, `build/`, and `node_modules/` to `.gitignore`
