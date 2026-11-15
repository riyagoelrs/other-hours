"""Browser journeys A–E. Run against the static site under its repository subpath.
Requires Python Playwright + Chromium only for development, not the shipped site.
BASE_URL=http://127.0.0.1:4175/other-hours/ python scripts/browser-check.py
Metadata success/restriction responses in B are explicit fixtures; see verification.md for live checks.
"""
import asyncio, json, os
from pathlib import Path
from playwright.async_api import async_playwright, expect
BASE=os.environ.get('BASE_URL','http://127.0.0.1:4175/other-hours/')
OUT=Path(os.environ.get('SCREENSHOT_DIR','work/browser-screenshots'))
OUT.mkdir(parents=True,exist_ok=True)
checks=[]
async def reset(page):
 await page.goto(BASE,wait_until='networkidle')
 await page.evaluate('localStorage.clear()')
 await page.reload(wait_until='networkidle')
async def search(page,text):
 await page.locator('#search-query').fill(text)
 await page.locator('#search-query').press('Enter')
 await page.wait_for_timeout(150)
async def run():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=os.environ.get('CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
  for name,width,height in [('desktop',1440,1000),('mobile',390,844)]:
   context=await browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
   await context.grant_permissions(['clipboard-read','clipboard-write'])
   page=await context.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await reset(page)
   assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'),f'{name}: horizontal overflow'
   assert await page.locator('.project-card').count()==8
   await page.screenshot(path=str(OUT/f'after-{name}.png'),full_page=True)
   await page.screenshot(path=str(OUT/f'after-{name}-viewport.png'))
   # A: persistence from the previous data model, actionable sourcing and saving.
   await page.evaluate("localStorage.setItem('oh:saved',JSON.stringify(['visible-mending']));localStorage.setItem('oh:checked:leather-journal',JSON.stringify([1]));")
   await page.reload(wait_until='networkidle')
   await search(page,'Make a leather journal')
   await page.locator('#borough-select').select_option('brooklyn')
   await expect(page.locator('#project-grid .project-card').first).to_contain_text('leather journal')
   await page.locator('#project-grid a[href="#project/leather-journal"]').first.click()
   await expect(page.locator('#detail-dialog')).to_be_visible()
   await expect(page.locator('#material-1')).to_be_checked()
   await expect(page.locator('#detail-root')).to_contain_text('$8–22')
   await expect(page.locator('#detail-root')).to_contain_text('Reusable equipment, up front')
   await expect(page.locator('#detail-root')).to_contain_text('Brooklyn Creative Reuse')
   await page.locator('#material-0').check()
   await page.locator('#copy-supplies').click()
   assert '20 sheets' in await page.evaluate('navigator.clipboard.readText()')
   await page.locator('#detail-save').click()
   assert 'leather-journal' in await page.evaluate("JSON.parse(localStorage.getItem('oh:saved'))")
   await page.locator('#detail-dialog').evaluate('(el)=>el.scrollTop=0')
   await page.screenshot(path=str(OUT/f'project-{name}.png'))
   # Native dialog traps keyboard focus, and Escape closes it.
   await page.locator('#close-detail').focus();await page.keyboard.press('Shift+Tab')
   assert await page.evaluate("document.activeElement.closest('#detail-dialog') !== null")
   await page.keyboard.press('Escape');await expect(page.locator('#detail-dialog')).not_to_be_visible()
   await page.locator('.saved-link').click()
   await expect(page.locator('#project-grid')).to_contain_text('leather journal')
   await expect(page.locator('#project-grid')).to_contain_text('old jeans')
   await page.reload(wait_until='networkidle')
   assert await page.locator('#borough-select').input_value()=='brooklyn'
   await page.goto(BASE+'#project/leather-journal',wait_until='networkidle')
   await expect(page.locator('#material-0')).to_be_checked()
   await page.keyboard.press('Escape');checks.append(f'{name}: A + legacy saves/checklists + keyboard dialog passed')
   # B: controlled fixture for permitted title metadata, then real UI fallback with manual text.
   await reset(page)
   await page.route('https://www.youtube.com/oembed**',lambda route:route.fulfill(status=200,content_type='application/json',body=json.dumps({'title':'Make a leather journal with a pamphlet stitch'})))
   await search(page,'https://youtu.be/dQw4w9WgXcQ')
   await expect(page.locator('#link-result')).to_be_visible()
   await expect(page.locator('#link-result')).to_contain_text('Title match only')
   await expect(page.locator('#link-result')).to_contain_text('No exact supply requirements could be extracted')
   await page.unroute('https://www.youtube.com/oembed**')
   await page.route('https://www.tiktok.com/oembed**',lambda route:route.abort('failed'))
   await search(page,'https://www.tiktok.com/@scout2015/video/6718335390845095173')
   await expect(page.locator('#link-result')).to_contain_text('Project unresolved')
   await page.locator('#caption-input').fill('Make a leather journal with 20 sheets of paper and thread. Fold the paper. Sew the pages.')
   await page.locator('#text-kind').select_option('description')
   await page.locator('#search-query').press('Enter')
   await expect(page.locator('#link-result')).to_contain_text('supplied by you')
   await expect(page.locator('#link-result')).to_contain_text('20 sheets of paper')
   await expect(page.locator('#link-result')).to_contain_text('No transcript was retrieved')
   await page.locator('#plan-title').fill('My edited Saturday journal')
   await page.locator('#save-plan').click()
   plan=await page.evaluate("JSON.parse(localStorage.getItem('oh:plans:v1'))[0]")
   assert plan['title']=='My edited Saturday journal' and plan['source']['transcriptStatus']=='not-retrieved'
   await page.locator('#plan-template').select_option('')
   assert await page.locator('#plan-template').input_value()==''
   await page.screenshot(path=str(OUT/f'inspiration-{name}.png'))
   await page.locator('.saved-link').click()
   await page.locator('[data-plan-open]').first.click()
   await page.locator('#saved-plan-title').fill('A revised journal plan')
   await page.locator('#update-plan').click()
   assert (await page.evaluate("JSON.parse(localStorage.getItem('oh:plans:v1'))[0].title"))=='A revised journal plan'
   await page.keyboard.press('Escape');checks.append(f'{name}: B metadata fixture + restricted fallback + editable saved plan passed')
   # C: refine from classes to suppliers and creator resources without losing intent.
   await reset(page);await search(page,'Beginner sewing classes near the Garment District')
   assert await page.locator('#borough-select').input_value()=='manhattan'
   assert await page.locator('#neighborhood-select').input_value()=='Garment District'
   await expect(page.locator('#community-grid')).to_contain_text('New York Sewing Center')
   assert await page.locator('#community-grid a[href*="thenewyorksewingcenter.com"]').count()>0
   await page.locator('[data-result-view="materials"]').click()
   await expect(page.locator('#places-grid')).to_contain_text('Mood Fabrics')
   await page.locator('#places-grid details').first.locator('summary').click()
   await expect(page.locator('#places-grid')).to_contain_text('225 W 37th')
   await page.locator('[data-result-view="people"]').click()
   await expect(page.locator('#creator-grid')).to_contain_text('Mood Sewciety')
   await page.screenshot(path=str(OUT/f'creators-{name}.png'))
   checks.append(f'{name}: C classes, suppliers, public creator links and refinement passed')
   # D: neighborhood and budget constrain the related discovery views.
   await reset(page);await search(page,'A new hobby under $50 in Queens')
   assert await page.locator('#borough-select').input_value()=='queens'
   assert await page.locator('#budget-select').input_value()=='50'
   assert await page.locator('.project-card').count()>0
   await page.locator('[data-result-view="community"]').click()
   await expect(page.locator('#community-grid')).to_contain_text('Queens')
   await page.locator('[data-result-view="materials"]').click()
   await expect(page.locator('#places-grid')).to_contain_text('Sunnyside Arts')
   await expect(page.locator('#places-grid')).to_contain_text('Materials for the Arts')
   await page.screenshot(path=str(OUT/f'materials-{name}.png'))
   assert await page.locator('#budget-select').input_value()=='50'
   checks.append(f'{name}: D Queens budget and cross-view context passed')
   # E: an unfamiliar interest is useful without typing a query.
   await reset(page);await page.locator('[data-category="movement"]').click()
   await expect(page.locator('#project-grid')).to_contain_text('first dance class')
   await page.locator('#project-grid a[href="#project/beginner-dance"]').first.click()
   await expect(page.locator('#detail-root')).to_contain_text('Mark Morris Dance Center')
   await expect(page.locator('#detail-root')).to_contain_text('footwear')
   await page.keyboard.press('Escape');checks.append(f'{name}: E browse-to-action-plan passed')
   # Map/list and nearby discovery use sourced address coordinates, without geolocation.
   await reset(page);await page.locator('[data-view="materials"]').click()
   await page.locator('[data-place-display="map"]').click()
   await expect(page.locator('#map-panel iframe')).to_be_visible()
   await page.locator('#map-reference').select_option('reuse')
   await expect(page.locator('#map-panel')).to_contain_text('FABSCRAP')
   await expect(page.locator('#map-panel')).to_contain_text('not walking routes')
   await page.locator('[data-place-display="list"]').click()
   await expect(page.locator('#map-panel')).not_to_be_visible()
   checks.append(f'{name}: sourced map/list and nearby place selection passed')
   # Responsive sweep includes narrow phones, tablets and desktop.
   for w in [320,360,390,768,1024,1440]:
    await reset(page);await page.set_viewport_size({'width':w,'height':height})
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'),f'{name} overflow at {w}'
   assert not errors,errors
   checks.append(f'{name}: no page errors or horizontal overflow at 320–1440px')
   await context.close()
  await browser.close()
 OUT.joinpath('browser-results.json').write_text(json.dumps({'baseUrl':BASE,'checks':checks},indent=2))
 print(json.dumps({'passed':len(checks),'checks':checks},indent=2))
asyncio.run(run())
