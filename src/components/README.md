Atomic UI structure (low to high):
- atoms: smallest UI primitives; no data fetching or app state.
- molecules: simple combinations of atoms.
- organisms: feature sections composed of molecules/atoms.
- templates: page layouts that arrange organisms.

Rules of thumb:
- Lower layers must not import higher layers.
- Keep atoms/molecules highly reusable and presentation-focused.
