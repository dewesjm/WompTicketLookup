import { PAGES, THEMES, expect, test, useTheme } from './pages';

/** Tab through each page; every stop must show a focus ring (outline or ring shadow). */
for (const path of PAGES) {
  for (const theme of THEMES) {
    test(`${path} in ${theme} shows where keyboard focus is`, async ({ page }) => {
      await useTheme(page, theme);
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const unmarked: string[] = [];
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const stop = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          // A text box inside daisyUI's .input wrapper (the picker) shows its ring on the wrapper.
          const shown = (e: Element) => {
            const cs = getComputedStyle(e);
            return (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none';
          };
          const wrapper = el.closest('.input');
          const ring = shown(el) || (wrapper !== null && wrapper !== el && shown(wrapper));
          const label = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim();
          return { ring, name: `${el.tagName.toLowerCase()} "${label.replace(/\s+/g, ' ').slice(0, 30)}"` };
        });
        if (stop && !stop.ring) unmarked.push(stop.name);
      }
      expect([...new Set(unmarked)]).toEqual([]);
    });
  }
}
