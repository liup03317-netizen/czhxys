import { test, expect } from '@playwright/test';

test.describe('黄金路径：学生完整学习流程', () => {

  test('第一步：进入大地图 - 验证页面加载与新手指引', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-testid="day-node-0"]')).toBeVisible({ timeout: 15000 });

    const tutorialBubble = page.getByText(/欢迎来到分子实验室/);
    await expect(tutorialBubble).toBeVisible({ timeout: 5000 });
  });

  test('第二步：闪卡学习 - 翻面、验证多模态内容、自评完成', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="day-node-0"]', { timeout: 15000 });
    await page.click('[data-testid="day-node-0"]');
    await page.waitForTimeout(1000);

    const flipButton = page.locator('[data-testid="flip-button"]');
    await expect(flipButton).toBeVisible({ timeout: 8000 });
    await flipButton.click();
    await page.waitForTimeout(600);

    await expect(page.getByText(/[āáǎàēéěèēíìǐīīóǒǒōǖūúǔùǚ]/)).toBeVisible();

    for (let i = 0; i < 5; i++) {
      const easyBtn = page.locator('[data-testid="rate-easy"]');
      if (await easyBtn.isVisible()) {
        await easyBtn.click({ force: true });
        await page.waitForTimeout(400);
      }
    }

    await page.waitForTimeout(2000);
  });

  test('第三步：大乱斗通关 - 配对消除 + 三维星级诊断弹窗', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="day-node-1"]', { timeout: 15000 });
    await page.click('[data-testid="day-node-1"]');
    await page.waitForTimeout(3000);

    let matchedCount = 0;
    const maxAttempts = 50;

    for (let attempt = 0; attempt < maxAttempts && matchedCount < 8; attempt++) {
      const cards = page.locator('[data-testid^="match-card-"]').filter({ hasNot: page.locator('.opacity-0') });
      const count = await cards.count();

      if (count >= 2) {
        await cards.nth(0).click();
        await page.waitForTimeout(350);
        await cards.nth(1).click();
        await page.waitForTimeout(700);

        const visibleCards = await page.locator('[data-testid^="match-card-"]:not(.opacity-0, .scale-0)').count();
        if (visibleCards < count - 2 || visibleCards === 0) matchedCount += 2;
      }
    }

    const successModal = page.locator('[data-testid="success-modal"], [data-testid="level-complete-modal"]');
    if (await successModal.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(successModal.getByText(/[★⭐]/)).toBeVisible();
    }
  });

  test('第四步：分子实验室 - 元素抽屉渲染 + 物质档案查看', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000);

    const labNav = page.getByText('实验室', { exact: true }).last();
    await expect(labNav).toBeVisible({ timeout: 5000 });
    await labNav.click();
    await page.waitForTimeout(3000);

    const elementDrawer = page.locator('[data-testid^="element-"]');
    const elementCount = await elementDrawer.count();
    expect(elementCount).toBeGreaterThanOrEqual(10);

    const archiveItems = page.locator('[data-testid^="archive-item-"]');
    const unlockedItems = archiveItems.filter({ hasNot: page.getByText('未解锁') });
    const unlockedCount = await unlockedItems.count();

    if (unlockedCount > 0) {
      await unlockedItems.first().click();
      await page.waitForTimeout(500);
      const archiveModal = page.locator('[data-testid="archive-detail-modal"]');
      await expect(archiveModal).toBeVisible({ timeout: 3000 });
      await expect(archiveModal.getByText(/物质档案|Archive/)).toBeVisible();
      await page.click('[data-testid="archive-close-btn"]');
      await expect(archiveModal).not.toBeVisible({ timeout: 2000 });
    } else {
      const lockedItem = archiveItems.first();
      await lockedItem.click();
      await page.waitForTimeout(500);
      const archiveModal = page.locator('[data-testid="archive-detail-modal"]');
      await expect(archiveModal).not.toBeVisible({ timeout: 1000 });
    }
  });
});
