import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:3000")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Fill the Email field with testsprite@magicpie.dev, fill the Password field with verify-magicpie-2026, then click the 'Sign in' button to authenticate.
        # you@example.com email field
        elem = page.get_by_label('Email', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("testsprite@magicpie.dev")
        
        # -> Fill the Email field with testsprite@magicpie.dev, fill the Password field with verify-magicpie-2026, then click the 'Sign in' button to authenticate.
        # •••••••• password field
        elem = page.get_by_label('Password', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("verify-magicpie-2026")
        
        # -> Fill the Email field with testsprite@magicpie.dev, fill the Password field with verify-magicpie-2026, then click the 'Sign in' button to authenticate.
        # Sign in button
        elem = page.get_by_role('button', name='Sign in', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Gigs' link in the left navigation to open the gigs list page.
        # Gigs link
        elem = page.get_by_text('T', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Gigs', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'New Gig' button to open the gig creation form.
        # New Gig button
        elem = page.get_by_text('magicpie', exact=True).locator("xpath=ancestor-or-self::*[.//button][1]").get_by_role('button', name='New Gig', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Event name' with 'TestSprite Verify Gig 2026-08-20 TS1', fill 'Client', 'Venue', 'City', set 'Total fee' to 5000000, then click the 'Save gig' button.
        # e.g. Djakarta Warehouse Project text field
        elem = page.get_by_label('Event name', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("TestSprite Verify Gig 2026-08-20 TS1")
        
        # -> Fill the 'Event name' with 'TestSprite Verify Gig 2026-08-20 TS1', fill 'Client', 'Venue', 'City', set 'Total fee' to 5000000, then click the 'Save gig' button.
        # e.g. Ismaya Live text field
        elem = page.get_by_label('Client', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("TestSprite Client")
        
        # -> Fill the 'Event name' with 'TestSprite Verify Gig 2026-08-20 TS1', fill 'Client', 'Venue', 'City', set 'Total fee' to 5000000, then click the 'Save gig' button.
        # e.g. JIExpo Kemayoran text field
        elem = page.get_by_label('Venue', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("TestSprite Venue")
        
        # -> Fill the 'Event name' with 'TestSprite Verify Gig 2026-08-20 TS1', fill 'Client', 'Venue', 'City', set 'Total fee' to 5000000, then click the 'Save gig' button.
        # e.g. Bandung text field
        elem = page.get_by_label('City', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Bandung")
        
        # -> Fill the 'Event name' with 'TestSprite Verify Gig 2026-08-20 TS1', fill 'Client', 'Venue', 'City', set 'Total fee' to 5000000, then click the 'Save gig' button.
        # 0 text field
        elem = page.get_by_label('Total feeRp', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("5000000")
        
        # -> Click the 'Save gig' button to save the new gig.
        # Save gig button
        elem = page.get_by_role('button', name='Save gig', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Back to gigs' link to return to the Gigs list and verify the new gig row shows the exact event name with a status badge.
        # Back to gigs link
        elem = page.get_by_role('link', name='Back to gigs', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Created gig 'TestSprite Verify Gig 2026-08-20 TS1' appears in the Gigs list with a visible status badge.
        # Assert-outcome: passed
        # Assert: The gig row shows the exact event name that was entered.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div[2]/table/tbody/tr[2]/td[1]/div[1]").nth(0)).to_have_text("TestSprite Verify Gig 2026-08-20 TS1", timeout=15000), "The gig row shows the exact event name that was entered."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div[2]/table/tbody/tr[2]/td[6]/span").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: A status badge is visible in the same row as the event.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div[2]/table/tbody/tr[2]/td[6]/span").nth(0)).to_be_visible(timeout=15000), "A status badge is visible in the same row as the event."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    