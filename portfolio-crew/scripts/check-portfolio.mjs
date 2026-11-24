import { mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const usage = 'node check-portfolio.mjs --url <url> --config <file> [--baseline <url>] [--output <dir>] [--record] [--channel chrome]';
const profiles = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
  { name: 'reduced-motion', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
];

function siteUrl(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Browser targets must be HTTP(S) URLs without credentials');
  }
  return url;
}

function pageUrl(path, base) {
  if (typeof path !== 'string' || !path.trim()) throw new Error('A page path is required');
  const url = new URL(path, base);
  if (url.origin !== base.origin || url.username || url.password) {
    throw new Error(`Page paths must use the target origin: ${path}`);
  }
  return url.href;
}

async function runStep(page, step, base, hasTouch) {
  const locator = () => page.locator(step.selector);
  switch (step.action) {
    case 'click':
      if (hasTouch) await locator().tap();
      else await locator().click();
      break;
    case 'visible':
      await locator().waitFor({ state: 'visible' });
      break;
    case 'text':
      if (typeof step.text !== 'string' || !step.text.trim()) throw new Error('Expected text is required');
      await locator().filter({ hasText: step.text }).waitFor({ state: 'visible' });
      break;
    case 'url': {
      const expected = pageUrl(step.path, base);
      await page.waitForURL(actual => actual.href === expected, { waitUntil: 'commit' });
      break;
    }
    case 'press':
      if (step.selector) await locator().press(step.key);
      else await page.keyboard.press(step.key);
      break;
    case 'wheel':
      if (!Number.isFinite(step.deltaY)) throw new Error('The wheel action requires a numeric deltaY');
      if (step.selector) await locator().hover();
      await page.mouse.wheel(0, step.deltaY);
      break;
    case 'back':
      await page.goBack({ waitUntil: 'domcontentloaded' });
      break;
    default:
      throw new Error(`Unknown action: ${step.action}`);
  }
}

async function checkFlow(browser, target, profile, flow, directory, record) {
  const { name: profileName, ...settings } = profile;
  const label = `${target.name}/${profileName}/${flow.name}`;
  const artifacts = join(directory, label);
  await mkdir(artifacts, { recursive: true });
  const context = await browser.newContext({
    ...settings,
    ...(record && { recordVideo: { dir: artifacts } }),
  });
  let stage = 'opening the page';
  let page;
  try {
    page = await context.newPage();
    page.setDefaultTimeout(6_000);
    page.setDefaultNavigationTimeout(15_000);
    const response = await page.goto(pageUrl(flow.path, target.url), { waitUntil: 'domcontentloaded' });
    if (!response?.ok()) throw new Error(`Load failed: HTTP ${response?.status() ?? 'unknown'}`);

    for (const [index, step] of flow.steps.entries()) {
      stage = `step ${index + 1} (${step.action})`;
      await runStep(page, step, target.url, settings.hasTouch);
    }
    stage = 'capturing the result';
    await page.screenshot({ path: join(artifacts, 'final.png') });
    console.log(`PASS ${label}`);
    return true;
  } catch (error) {
    console.error(`FAIL ${label} — ${stage}\n${error.message}`);
    await page?.screenshot({ path: join(artifacts, 'failure.png'), timeout: 2_000 }).catch(() => {});
    return false;
  } finally {
    await context.close();
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      url: { type: 'string' },
      baseline: { type: 'string' },
      config: { type: 'string' },
      output: { type: 'string', default: '.portfolio-qa' },
      channel: { type: 'string' },
      record: { type: 'boolean' },
      help: { type: 'boolean' },
    },
  });
  if (values.help) {
    console.log(usage);
    return;
  }
  if (!values.url || !values.config) throw new Error('--url and --config are required');

  const { flows } = JSON.parse(await readFile(values.config, 'utf8'));
  if (!Array.isArray(flows) || flows.length === 0) throw new Error('The config requires at least one flow');
  const names = new Set();
  for (const flow of flows) {
    if (typeof flow?.name !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(flow.name) || names.has(flow.name)) {
      throw new Error('Flow names must be unique and use lowercase letters, digits, and hyphens');
    }
    if (typeof flow.path !== 'string' || !flow.path.trim()) throw new Error(`Flow ${flow.name} requires a page path`);
    if (flow.currentOnly !== undefined && typeof flow.currentOnly !== 'boolean') {
      throw new Error(`Flow ${flow.name}: currentOnly must be a boolean`);
    }
    if (!Array.isArray(flow.steps) || flow.steps.length === 0 || flow.steps.some(step => typeof step?.action !== 'string')) {
      throw new Error(`Flow ${flow.name} requires steps with action names`);
    }
    names.add(flow.name);
  }

  const targets = [{ name: 'current', url: siteUrl(values.url) }];
  if (values.baseline) targets.unshift({ name: 'baseline', url: siteUrl(values.baseline) });

  const { chromium } = await import('playwright');
  const directory = resolve(values.output);
  await mkdir(directory, { recursive: true });
  const runDirectory = await mkdtemp(join(directory, 'run-'));
  const browser = await chromium.launch({ channel: values.channel });
  try {
    let failures = 0;
    for (const target of targets) {
      for (const profile of profiles) {
        for (const flow of flows) {
          if (target.name === 'baseline' && flow.currentOnly) continue;
          if (!await checkFlow(browser, target, profile, flow, runDirectory, values.record)) failures++;
        }
      }
    }
    console.log(`Browser QA: ${failures} failed. Artifacts: ${runDirectory}`);
    if (failures) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error.message);
  console.error(usage);
  process.exitCode = 2;
});
