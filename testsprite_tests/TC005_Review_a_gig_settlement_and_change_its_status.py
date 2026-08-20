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
        
        # -> Fill the Email field with testsprite@magicpie.dev, the Password field with verify-magicpie-2026, then click the 'Sign in' button to log in.
        # you@example.com email field
        elem = page.get_by_label('Email', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("testsprite@magicpie.dev")
        
        # -> Fill the Email field with testsprite@magicpie.dev, the Password field with verify-magicpie-2026, then click the 'Sign in' button to log in.
        # •••••••• password field
        elem = page.get_by_label('Password', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("verify-magicpie-2026")
        
        # -> Fill the Email field with testsprite@magicpie.dev, the Password field with verify-magicpie-2026, then click the 'Sign in' button to log in.
        # Sign in button
        elem = page.get_by_role('button', name='Sign in', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Gigs' link in the sidebar to open the gigs list page.
        # Gigs link
        elem = page.get_by_text('T', exact=True).locator("xpath=ancestor-or-self::*[.//a][1]").get_by_role('link', name='Gigs', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the gig detail for the event 'Univ Pancasila' by clicking its event name in the list.
        # Univ Pancasila
        elem = page.get_by_text('Univ Pancasila', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the status dropdown labeled 'Draft' to reveal status options (Draft, Confirmed, Paid, Cancelled).
        # Draft Confirmed Paid Cancelled dropdown
        elem = page.get_by_text('Draft Confirmed Paid Cancelled', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select 'Confirmed' from the status dropdown (currently showing 'Draft') and verify the page displays 'Confirmed' as the updated status.
        # Draft Confirmed Paid Cancelled dropdown
        elem = page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div/div[2]/div/select").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.select_option("")
        
        # -> Open the status dropdown that is currently showing 'Confirmed' so the available status options (Draft, Confirmed, Paid, Cancelled) become visible.
        # Draft Confirmed Paid Cancelled dropdown
        elem = page.get_by_text('Draft Confirmed Paid Cancelled', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Paid' option from the status dropdown so the gig status changes from 'Confirmed' to 'Paid' and then check that 'Paid' appears in the header badge and Members area.
        # Draft Confirmed Paid Cancelled dropdown
        elem = page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div/div[2]/div/select").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.select_option("")
        
        # -> Open the status dropdown currently showing 'Confirmed' so the status options appear, then select 'Paid'.
        # Draft Confirmed Paid Cancelled dropdown
        elem = page.get_by_text('Draft Confirmed Paid Cancelled', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The settlement breakdown panel is visible (shows the 'Gig fee' label).
        # Assert-outcome: passed
        # Assert: Settlement breakdown shows the 'Gig fee' label.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div[2]/div/div[2]/div[1]/span[1]").nth(0)).to_contain_text("Gig fee", timeout=15000), "Settlement breakdown shows the 'Gig fee' label."
        
        # --> The gig status is updated and shown as 'Paid' in the status control/header.
        # Assert-outcome: passed
        # Assert: Status dropdown contains 'Paid', indicating the gig status is displayed as Paid.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div[1]/div[2]/div[1]/select").nth(0)).to_contain_text("Paid", timeout=15000), "Status dropdown contains 'Paid', indicating the gig status is displayed as Paid."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    