import { test, expect, type Page } from '@playwright/test';

const USER = 'demo';
const PASS = '123456';

// 全部按「用户会怎么操作」定位：role + 可见文字 + label。
// 不出现任何 id / class / data-testid / XPath —— 这正是这套用例
// 在 v1 与 v2 两套完全不同的 DOM 上一个字都不用改就能通过的原因。
async function login(page: Page, user = USER, pass = PASS) {
  await page.goto('/');
  await page.getByLabel('用户名').fill(user);
  await page.getByLabel('密码').fill(pass);
  await page.getByRole('button', { name: '登录', exact: true }).click();
}

test('用正确账号能登录并看到商品列表', async ({ page }) => {
  await login(page);
  await expect(page.getByText('商品列表')).toBeVisible();
});

test('密码错误时必须被拦住', async ({ page }) => {
  await login(page, USER, 'wrong_password');
  await expect(page.getByText('账号或密码不对')).toBeVisible();
  await expect(page.getByText('商品列表')).not.toBeVisible();
});

test('加购物车后角标数量正确', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: '加入购物车', exact: true }).first().click();
  await expect(page.getByRole('button', { name: /^购物车/ })).toContainText('1');
});

test('完整下单流程能走到完成页', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: '加入购物车', exact: true }).first().click();
  await page.getByRole('button', { name: /^购物车/ }).click();
  await page.getByRole('button', { name: '去结算', exact: true }).click();
  await page.getByLabel('收件人').fill('张三');
  await page.getByLabel('电话').fill('13800000000');
  await page.getByLabel('地址').fill('测试地址 1 号');
  await page.getByRole('button', { name: '提交订单', exact: true }).click();
  await expect(page.getByText('下单成功')).toBeVisible();
});

test('退出后回到登录页', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: '菜单', exact: true }).click();
  await page.getByRole('button', { name: '退出登录', exact: true }).click();
  await expect(page.getByRole('button', { name: '登录', exact: true })).toBeVisible();
  await expect(page.getByText('商品列表')).not.toBeVisible();
});
