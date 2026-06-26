import { chromium } from 'playwright';

const BASE = 'http://localhost:5199';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  console.log('=== Step 1: Load app ===');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'step1-loaded.png' });
  console.log('App loaded');

  // Step 2: Pick a specific officer (samaf - סמ"פ)
  console.log('=== Step 2: Select an officer ===');
  // Find officer selector buttons
  const officerBtns = await page.locator('button').all();
  console.log(`Found ${officerBtns.length} buttons total`);

  // Look for samaf button
  const samafBtn = page.locator('button', { hasText: 'סמ"פ' });
  const samafCount = await samafBtn.count();
  console.log(`Samaf buttons found: ${samafCount}`);

  if (samafCount > 0) {
    await samafBtn.first().click();
    await sleep(1000);
    await page.screenshot({ path: 'step2-officer-selected.png' });
    console.log('Selected סמ"פ');
  }

  // Step 3: Check for shared tasks (tasks with multiple officers)
  console.log('=== Step 3: Look for shared tasks ===');
  await sleep(500);

  // Find "ביצעתי" buttons
  const bitzaatiButtons = page.locator('button', { hasText: 'ביצעתי' });
  const count = await bitzaatiButtons.count();
  console.log(`Found ${count} "ביצעתי" buttons`);

  await page.screenshot({ path: 'step3-tasks-visible.png' });

  if (count === 0) {
    console.log('No "ביצעתי" buttons visible under this officer. Checking if any tasks exist...');

    // Check for progress bars (these only appear on shared tasks)
    const progressBars = page.locator('.h-1.bg-slate-200');
    const pbCount = await progressBars.count();
    console.log(`Shared task progress bars: ${pbCount}`);

    // Check all tasks visible
    const taskCards = page.locator('[class*="rounded-xl border"]');
    const cardCount = await taskCards.count();
    console.log(`Task cards visible: ${cardCount}`);

    if (cardCount === 0) {
      console.log('No tasks found. Creating a shared task via the UI...');

      // Click "הוסף משימה חדשה"
      const addBtn = page.locator('button', { hasText: 'הוסף משימה חדשה' });
      await addBtn.click();
      await sleep(500);
      await page.screenshot({ path: 'step3a-modal-open.png' });

      // Fill title
      await page.locator('input[placeholder*="כותרת"], input[id="title"]').first().fill('משימה לכולם - בדיקה');

      // Select "כולם" or multiple officers - look for officer checkboxes/buttons
      await page.screenshot({ path: 'step3b-modal-filled.png' });

      // Look for "כולם" option
      const kulamBtn = page.locator('button, label, input', { hasText: 'כולם' });
      const kulamCount = await kulamBtn.count();
      console.log(`"כולם" options in modal: ${kulamCount}`);

      if (kulamCount > 0) {
        await kulamBtn.first().click();
        await sleep(300);
        await page.screenshot({ path: 'step3c-kulam-selected.png' });
      }

      // Save
      const saveBtn = page.locator('button', { hasText: 'שמור' });
      if (await saveBtn.count() > 0) {
        await saveBtn.click();
        await sleep(1500);
        await page.screenshot({ path: 'step3d-saved.png' });
      }
    }
  }

  // Step 4: Now try clicking "ביצעתי" on a shared task
  console.log('=== Step 4: Click ביצעתי on shared task ===');
  await sleep(500);

  const buttons2 = page.locator('button', { hasText: 'ביצעתי' });
  const count2 = await buttons2.count();
  console.log(`"ביצעתי" buttons after check: ${count2}`);

  if (count2 > 0) {
    // Take before screenshot
    await page.screenshot({ path: 'step4-before-click.png' });

    // Click it
    await buttons2.first().click();
    await sleep(1500);

    // Take after screenshot
    await page.screenshot({ path: 'step4-after-click.png' });

    // Check if button changed to "בוצע"
    const bozaaBtn = page.locator('button', { hasText: 'בוצע' });
    const doneCount = await bozaaBtn.count();
    console.log(`"בוצע" buttons after click: ${doneCount}`);

    if (doneCount > 0) {
      console.log('✅ PASS: Button changed from "ביצעתי" to "בוצע" - confirmation recorded!');
    } else {
      const stillBitzaati = await page.locator('button', { hasText: 'ביצעתי' }).count();
      console.log(`Still "ביצעתי": ${stillBitzaati}`);
      console.log('❌ Button did not change - may still be broken');
    }

    // Check if progress bar updated
    const progressText = await page.locator('text=/\\d+\\/\\d+ אישרו/').first().textContent().catch(() => null);
    console.log(`Progress text: ${progressText}`);

    // Step 5: Try unconfirm (click "בוצע" to toggle back)
    console.log('=== Step 5: Probe - click בוצע to unconfirm ===');
    if (doneCount > 0) {
      await bozaaBtn.first().click();
      await sleep(1000);
      await page.screenshot({ path: 'step5-after-unconfirm.png' });
      const backToBitzaati = await page.locator('button', { hasText: 'ביצעתי' }).count();
      console.log(`Back to "ביצעתי" after unconfirm: ${backToBitzaati}`);
      if (backToBitzaati > 0) {
        console.log('✅ Unconfirm also works correctly');
      }
    }
  } else {
    console.log('⚠️ Could not find a shared task with ביצעתי button to test');
    // Log what IS on screen
    const allText = await page.locator('body').innerText();
    console.log('Page text:', allText.substring(0, 500));
  }

  await page.screenshot({ path: 'step-final.png' });
  await sleep(2000);
  await browser.close();
})();
