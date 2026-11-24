import { ICONS } from './icons';

describe('icons', () => {
  it("has the app's own icon for the header, and the others the screens name", () => {
    for (const name of ['ticket', 'download', 'info', 'search', 'plus', 'x', 'settings', 'triangle-alert', 'check']) {
      expect(ICONS[name], name).toBeDefined();
    }
  });
});
