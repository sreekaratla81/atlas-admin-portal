# Admin UI layout

- The global navigation (logo + top navigation) is rendered once in `src/components/layout/AppLayout.tsx` via `NavBar`. Pages **must not** render their own navigation or duplicate headers.
- Page-level headers (title + optional actions) should live inside the page content. Use `AdminShellLayout` when you need a consistent header row and spacing inside a page.
- Keep page padding consistent with the layout defaults (24px desktop, 16px mobile) and avoid nesting additional framed headers inside page content.
