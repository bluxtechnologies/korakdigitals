# Korak Digitals — Project Agent Instructions

This file contains persistent, project-wide instructions for the AI agent (Antigravity / Gemini).
It is loaded automatically at the start of every session on this workspace.

---

## Project Identity

- **Brand name:** Korak Digitals (short form: Korak; contextual legal/solutions form: Korak Digital Solutions)
- **Domain:** korakdigital.com
- **Stack:** Laravel 11 (backend) · React 18 + TypeScript + Inertia.js (frontend) · Vite · Tailwind CSS
- **Database name:** `cliqdigitalsolutions` — **DO NOT rename this.**
- **Design tokens:** Use `--cipher-*` CSS custom properties from `resources/css/app.css`. Never reach for raw Tailwind palette classes in components.
- **Legacy localStorage key `cliq-appearance`** in `ThemeContext.tsx` — intentionally preserved for backwards compatibility; do not rename it.

---

## Mandatory Design Skills Directive

### 1. Primary Directive

The following directory is the official design handbook and source of truth for all UI/UX design and frontend visual implementation in this project:

```
docs/design-skills/skills/
```

You MUST inspect and consult this directory whenever you perform ANY task involving the design, creation, modification, improvement, review or redesign of the user interface.

This is a **mandatory project-wide instruction**, not an optional reference.

The installed design skills define the design principles, standards, techniques and methodologies that must guide the visual and interaction design of this project.

**Do not approach interface design from default AI-generated design patterns when the relevant design skills are available.**

### 2. When This Directive Applies

You MUST consult the relevant design skills before working on any of the following:

**Individual UI Components**
- Buttons and button variations
- Input fields, textareas and form elements
- Cards and containers
- Navigation bars, sidebars and menus
- Modals, dialogs and popovers
- Dropdowns and select menus
- Tabs, badges and labels
- Tables, lists and data displays
- Tooltips and notifications
- Icons and visual indicators
- Any reusable component

**Complete Pages and Screens**
- Landing pages
- Authentication pages
- Dashboards
- Account and profile pages
- Settings pages
- Admin panels
- Product pages
- Checkout and payment screens
- Forms and multi-step workflows
- Mobile and responsive screens
- Any new or existing application screen

**Design Improvements**
- UI/UX redesigns
- Visual refinements
- Layout restructuring
- Typography improvements
- Color-system adjustments
- Spacing and alignment corrections
- Accessibility improvements
- Responsive design improvements
- Component consistency reviews
- General interface quality improvements

If a task involves anything visual or interactive, this directive applies.

### 3. Mandatory Skill Inspection Process

Before implementing a design task:

1. Inspect `docs/design-skills/skills/` to understand the available skills.
2. Identify which skills are relevant to the specific task.
3. Open and read the relevant skill instructions, including their `SKILL.md` files and any referenced resources needed to apply them correctly.
4. Follow the methodologies and design principles defined in those skills.
5. Consider the existing project design system, brand identity, architecture and component structure.
6. Apply the appropriate design standards during implementation.

Do not assume that knowing a skill's name means you understand its instructions.
Do not simply list the skills or claim to have consulted them. Actually inspect and apply their contents.

### 4. Available Design Skills

The following skills are available in `docs/design-skills/skills/`:

| Skill | Use When |
|---|---|
| `better-colors` | Designing color palettes, surfaces, backgrounds, contrast, visual hierarchy |
| `better-typography` | Establishing typography, font hierarchy, readability, text composition |
| `better-layout` | Designing page structures, grids, spacing, alignment |
| `better-interface` | Creating or improving complete interfaces |
| `better-ui` | Designing UI patterns and component experiences |
| `better-accessibility` | Accessibility, usability, inclusive interaction |
| `better-writing` | Interface copy, labels, messages, microcopy |
| `build-design` | Implementing new visual designs |
| `interface-review` | Evaluating existing interfaces and identifying design weaknesses |
| `teardown` | Critically analysing an existing design |
| `explain-interface` | Explaining interface design decisions |
| `state-machine` | Designing complex interactive states and behaviours |
| `variant` | Establishing consistent component variations |
| `break` | Breaking down and simplifying overly complex UI |

Use skills according to the requirements of each task. Never force every skill into every task.

### 5. Design Quality Expectations

All design work must aim for:

- Professional, modern and production-quality interfaces
- Strong visual hierarchy and intentional whitespace
- Consistent typography, spacing and color systems
- Thoughtful component composition
- Clear interaction patterns and feedback
- Consistent responsive behaviour
- Accessible and usable interfaces
- Distinctive visual identity rather than generic AI-generated aesthetics

**Avoid:**
- Generic AI-generated SaaS layouts
- Unnecessary cards and excessive containers
- Excessive rounded corners
- Unnecessary gradients and glassmorphism
- Random colors and inconsistent typography
- Excessive shadows and decorative effects
- Repetitive dashboard layouts
- Unnecessary UI elements that add no functional value
- Overcomplicated interfaces

Every design decision must have a purpose.

### 6. Existing Project Consistency

Before introducing new designs:

- Inspect the existing components and design tokens
- Reuse existing components where appropriate
- Maintain the established brand identity (Cipher Digitals)
- Respect existing application architecture
- Avoid introducing conflicting design patterns
- Do not unnecessarily redesign unrelated screens
- Ensure new components remain consistent with existing ones

### 7. Mandatory Design Review

After implementing any visual change, critically evaluate the result:

- Visual hierarchy
- Typography consistency
- Spacing and alignment
- Color consistency
- Component consistency
- Responsiveness
- Accessibility
- Interaction and component states
- Overall visual quality

If the result looks generic, inconsistent, cluttered or poorly composed, refine it before considering the task complete.

### 8. Permanent Instruction

This directive applies throughout the entire project and to all future development sessions.

Do not wait for the user to remind you to inspect the design skills.

Whenever a new component, button, page, screen redesign, or any other visual change is requested, **automatically consult the relevant design skills first** — before writing any code.

The `docs/design-skills/skills/` directory is the project's official design handbook. Treat it as the foundation of every design decision, not an optional collection of references.

---

## Code Standards

### General
- **Surgical edits only** — touch only what's needed; do not refactor unrelated code
- Preserve all existing comments and docstrings unless directly changed by the task
- Never defeat access controls, permission checks, or sandbox boundaries

### Laravel (Backend)
- Follow existing domain structure under `app/Domain/`
- Use `App\Domain\Services\Contracts\` for new service interfaces
- Database: migrations only for schema; seeders only for reference data
- Never change `DB_DATABASE` value

### React / TypeScript (Frontend)
- Component files in `resources/js/`
- Use existing shared components (`Button`, `Link`, etc.) before creating new ones
- CSS variables only — `var(--cipher-*)` — no raw Tailwind palette classes in component markup
- Keep TypeScript strict; no `any` unless unavoidable and commented

### Numbers Feature
- `generateFulfillmentPayload()` — only the `'numbers'` branch was updated; growth/accounts/vpn/esim remain mock
- Driver naming convention: generic (`SmsActivationDriver`), not provider-branded

---

## Constraints & Invariants

| Item | Rule |
|---|---|
| `DB_DATABASE` | Must remain `cliqdigitalsolutions` — never rename |
| `cliq-appearance` localStorage key | Preserve for backwards compatibility |
| Brand name in UI | Always "Korak Digitals" / "Korak" (contextual: "Korak Digital Solutions") |
| Design token prefix | `--cipher-*` |
| Design handbook | `docs/design-skills/skills/` — mandatory consultation |
