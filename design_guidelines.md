# Dental Practice Management Design Guidelines

## Design Approach

**Selected System**: Material Design with healthcare-focused adaptations
**Rationale**: Medical software demands information clarity, efficient workflows, and established trust patterns. Material Design provides excellent data visualization frameworks and component hierarchy essential for clinical environments.

**Core Principles**:
- Clinical professionalism through structured layouts
- Information accessibility with clear visual hierarchy
- Efficient task completion for busy practitioners
- Trust through consistent, predictable patterns

## Typography System

**Primary Font**: Inter (via Google Fonts)
**Secondary Font**: JetBrains Mono (for patient IDs, appointment codes)

**Scale**:
- Page Headers: 2xl (30px), font-semibold
- Section Headers: xl (24px), font-semibold
- Card Titles: lg (18px), font-medium
- Body Text: base (16px), font-normal
- Labels/Captions: sm (14px), font-medium
- Patient Data: sm (14px), mono font for IDs/codes

## Layout & Spacing System

**Spacing Units**: Tailwind 2, 4, 6, 8, 12, 16
- Component padding: p-6
- Card gaps: gap-6
- Section margins: my-12
- Container max-width: max-w-7xl

**Grid Structure**:
- Dashboard: 3-column for stats, 2-column for main content areas
- Patient list: Single column with expandable rows
- Odontogram view: Centered with side panels (70/30 split)

## Component Library

**Navigation**:
- Persistent left sidebar (260px) with icon + label menu items
- Top bar: Search, notifications, user profile
- Sidebar sections: Dashboard, Patients, Appointments, Treatments, Billing, Reports

**Dashboard Cards**:
- Appointment Summary: Today's schedule with time slots, patient names, treatment types
- Quick Stats: Today's patients, pending treatments, revenue metrics (3-column grid)
- Urgent Actions: Overdue follow-ups, pending approvals
- Recent Activity: Timeline-style list

**Patient Management**:
- Patient List: Searchable table with filters (status, last visit, insurance)
- Patient Card: Photo placeholder, name, age, contact, insurance status, last visit
- Detail View: Tabbed interface (Overview, Medical History, Treatments, Billing, Documents)

**Odontogram Component** (Critical Custom Element):
- Interactive tooth chart: 32 teeth arranged in quadrants
- Tooth visualization: SVG-based with condition overlays
- Color-coded status: Healthy (no treatment), Cavity (red marker), Filled (blue), Crown (gold outline), Missing (grey outline)
- Click interaction: Opens treatment details panel
- Legend: Clear key showing all condition types
- Annotations: Text notes attached to specific teeth

**Forms**:
- Appointment scheduling: Date/time picker, patient selector, treatment dropdown, duration
- Treatment planning: Multi-step form with odontogram integration
- Patient intake: Structured medical history with checkbox groups
- All inputs: Clear labels above fields, helper text below, error states in red

**Data Tables**:
- Appointment calendar: Week/month view with color-coded appointment types
- Treatment history: Sortable columns (date, procedure, dentist, cost, status)
- Pagination: Show 25/50/100 entries options

**Action Buttons**:
- Primary: "Schedule Appointment", "Add Patient", "Start Treatment"
- Secondary: "View Details", "Edit", "Print"
- Danger: "Cancel Appointment", "Delete Record"
- On hero image: Background blur (backdrop-blur-md) with semi-transparent white background

## Images

**Hero Section** (Dashboard Landing - if patient not logged in):
- Large hero image showing modern dental office interior - clean, bright, professional
- Image specs: High-quality, well-lit dental practice with examination chairs
- Overlay: Semi-transparent gradient for text readability
- CTA buttons: "Schedule Appointment" and "Patient Login" with blurred backgrounds

**Additional Images**:
- Empty states: Friendly illustrations for "No appointments today", "No patients found"
- Dentist profile photos: Circular thumbnails in appointment cards
- Patient photos: Small circular avatars (48px) in lists, larger (96px) in detail views

**Image Placement**:
- Hero: Full-width, 60vh on desktop, 40vh mobile
- Dashboard: No additional images (focus on data)
- Patient profiles: Top of detail view alongside basic info
- Marketing/About page: Team photos, office tour gallery

## Accessibility Implementation

- WCAG AA compliant contrast ratios throughout
- All interactive elements keyboard navigable
- Odontogram: Keyboard navigation between teeth, clear focus states
- Form labels: Explicitly associated with inputs via for/id
- Tables: Proper semantic markup with scope attributes
- Color never sole indicator: Icons/patterns accompany color coding
- Focus indicators: 2px blue outline on all interactive elements

## Animation

Minimal, purposeful only:
- Sidebar collapse/expand: 200ms ease transition
- Modal overlays: Fade in 150ms
- Odontogram tooth selection: Scale up 100ms
- Tab switching: Content crossfade 200ms

No page load animations, scroll effects, or decorative motion.