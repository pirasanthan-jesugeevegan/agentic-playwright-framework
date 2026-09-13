// spec: docs/vr-test-plans/home-vr-test-plan.md
import { expect, test } from '../../src/fixtures/pom/test-options';

test.describe('Visual regression - home', { tag: '@regression' }, () => {
  test('VR-01: Verify that the user sees the category panel rendered correctly on the home page', async ({
    homePage,
  }) => {
    await test.step('GIVEN a visitor lands on the home page', async () => {
      await homePage.open();
    });

    await test.step('THEN the category panel matches its baseline', async () => {
      await expect(homePage.categoryPanel).toBeVisible();
      await expect(homePage.categoryPanel).toHaveScreenshot(
        'home-category-panel-default.png',
      );
    });
  });
});
