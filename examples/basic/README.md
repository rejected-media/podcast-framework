# Example Podcast - Basic

Basic example podcast using `@podcast-framework/core`

## Purpose

Tests core framework functionality:
- Component resolver (getComponent with import.meta.glob)
- BaseLayout with SEO meta tags
- Header and Footer components
- Theme system
- Mobile responsiveness

## Running Locally

```bash
# From monorepo root
npm install

# Run example podcast
cd examples/basic
npm run dev
```

Open http://localhost:4321

## What This Tests

- ✅ Framework components load from node_modules
- ✅ Component resolver works
- ✅ Theme CSS variables applied
- ✅ SEO meta tags render
- ✅ Responsive design works
- ✅ TypeScript compiles without errors

## Testing Component Overrides

To test the override system:

1. Create `src/components/Header.astro` in this example
2. Add custom content
3. Run `npm run dev`
4. Framework should use your custom Header instead of framework version

## Next Steps

- Add more pages (episodes, guests)
- Test with real Sanity data
- Verify production build works
