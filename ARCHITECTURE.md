# Angular Portfolio Architecture

## Folder Structure

```
src/app/
├── core/                      # Singleton services, guards, interceptors
│   ├── services/              # App-wide services (theme, SEO, platform)
│   ├── guards/                # Route guards
│   ├── interceptors/          # HTTP interceptors
│   ├── config/                # App configuration files
│   ├── data/                  # Static data and constants
│   └── index.ts              # Barrel export
│
├── shared/                    # Reusable components, directives, pipes
│   ├── components/            # Shared UI components
│   ├── directives/            # Shared directives (reveal, etc.)
│   ├── pipes/                 # Shared pipes
│   ├── utils/                 # Utility functions
│   └── index.ts              # Barrel export
│
├── layouts/                   # Layout components
│   ├── header/                # Header component
│   └── footer/                # Footer component
│
├── features/                  # Feature modules (lazy loaded)
│   └── home/                  # Home feature
│       ├── sections/          # Home page sections
│       │   ├── hero/
│       │   ├── about/
│       │   ├── skills/
│       │   ├── experience/
│       │   ├── projects/
│       │   └── contact/
│       ├── home.component.ts
│       ├── home.component.html
│       └── home.component.css
│
├── app.routes.ts             # Route configuration
├── app.config.ts             # App configuration (providers, etc.)
├── app.config.server.ts      # SSR-specific configuration
├── app.ts                    # Root component
└── app.html                  # Root template
```

## Architecture Principles

### 1. **Core Module**
- **Purpose**: Singleton services and app-wide functionality
- **Usage**: Imported once in app configuration
- **Contains**: 
  - Services (theme, SEO, platform detection)
  - Guards (auth, etc.)
  - Interceptors (HTTP error handling)
  - App configuration
  - Static data

### 2. **Shared Module**
- **Purpose**: Reusable components, directives, and pipes
- **Usage**: Imported wherever needed
- **Contains**:
  - UI components (buttons, cards, tags)
  - Directives (scroll reveal, etc.)
  - Pipes (date formatting, etc.)
  - Utility functions

### 3. **Layouts**
- **Purpose**: Application layout components
- **Usage**: Used in app shell (header, footer)
- **Contains**:
  - Header with navigation
  - Footer
  - Future: sidebar, etc.

### 4. **Features**
- **Purpose**: Feature-specific functionality
- **Usage**: Lazy loaded for performance
- **Contains**:
  - Feature components
  - Feature-specific services
  - Sub-sections/components

## SSR Considerations

All services and components are SSR-safe:
- Platform checks before accessing `window`, `document`, `localStorage`
- Use `isPlatformBrowser()` guard
- Avoid direct DOM manipulation in OnInit
- Use `afterNextRender()` for client-only code

## Routing Strategy

- **Lazy Loading**: All features are lazy loaded
- **Prerendering**: Static routes are prerendered at build time
- **Route Configuration**: Centralized in `app.routes.ts`

## State Management

- **Signals**: Modern Angular approach for reactivity
- **Services**: Stateful services for shared state
- **No heavy state library**: Unnecessary for portfolio scope

## Styling Strategy

- **Tailwind CSS**: Utility-first approach
- **Component Styles**: Scoped where needed
- **Global Styles**: Design tokens in `styles.css`
- **Dark Mode**: CSS variables + Tailwind dark mode

## Code Organization Rules

1. **No circular dependencies**
2. **Barrel exports** for clean imports
3. **Single responsibility** for each file
4. **Standalone components** throughout
5. **Type safety** - strict TypeScript
6. **Consistent naming** - kebab-case for files
