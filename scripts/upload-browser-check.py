"""File/photo/link intake regression checks on desktop and an iPhone-sized viewport.
The browser chooser and persistent files are real; oEmbed responses are explicit test fixtures.
"""
import asyncio,base64,json,os
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.environ.get('BASE_URL','http://127.0.0.1:4175/other-hours/')
OUT=Path(os.environ.get('SCREENSHOT_DIR','work/upload-screenshots'));OUT.mkdir(parents=True,exist_ok=True)
PHOTO=Path('docs/screenshots/before-mobile.png').resolve()
TEXT='Make a leather journal with 20 sheets of paper and waxed linen thread. Fold the paper. Sew the pages.'
checks=[]
async def open_clean(page):
 await page.goto(BASE,wait_until='networkidle');await page.evaluate('localStorage.clear()');await page.reload(wait_until='networkidle')
async def wait_ready(page):
 await expect(page.locator('#upload-list')).to_have_attribute('aria-busy','false')
async def submit(page):
 await page.locator('#search-form button[type=submit]').click()
 await expect(page.locator('#link-result')).to_be_visible()
async def run():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=os.environ.get('CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
  for name,width,height in [('desktop',1440,1000),('iphone-width',390,844)]:
   context=await browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce',accept_downloads=True)
   page=await context.new_page();errors=[];external_requests=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('request',lambda request:external_requests.append(request.url) if request.url.startswith('https://') else None)
   await open_clean(page)
   # Native library chooser: accepts photos, allows multiple, and does not force the camera.
   async with page.expect_file_chooser() as event:await page.locator('#add-photos').click()
   chooser=await event.value;assert chooser.is_multiple()
   await chooser.set_files(str(PHOTO));await wait_ready(page)
   assert not await page.locator('#photo-upload').get_attribute('capture')
   await expect(page.locator('#upload-list .reference-file')).to_have_count(1)
   await expect(page.locator('#caption-container')).to_be_visible()
   await page.wait_for_function("document.querySelector('#upload-list img')?.naturalWidth > 0")
   await submit(page)
   await expect(page.locator('#link-result')).to_contain_text('Project unresolved')
   assert await page.evaluate('currentInspiration.evidence.length')==0
   assert await page.evaluate('currentInspiration.requirements.length')==0
   assert not external_requests,'File-only intake must not send files to a server'
   checks.append(f'{name}: native photo chooser, image preview, local-only handling and honest unresolved result passed')
   # Adding readable notes invalidates the prior result and builds from literal file text.
   await page.locator('#file-upload').set_input_files({'name':'supplies.txt','mimeType':'text/plain','buffer':TEXT.encode()});await wait_ready(page)
   await expect(page.locator('#save-plan')).to_be_disabled()
   await submit(page)
   await expect(page.locator('#link-result')).to_contain_text('Uploaded text file')
   await expect(page.locator('#link-result')).to_contain_text('20 sheets of')
   assert await page.evaluate('currentInspiration.matches[0].slug')=='leather-journal'
   await page.locator('#plan-title').fill('My photo and journal notes')
   await page.locator('#save-plan').click()
   await page.wait_for_function("JSON.parse(localStorage.getItem('oh:plans:v1')||'[]').length===1")
   ids=await page.evaluate("JSON.parse(localStorage.getItem('oh:plans:v1'))[0].source.attachments.map(f=>f.id)")
   assert len(ids)==2
   await page.screenshot(path=str(OUT/f'upload-plan-{name}.png'))
   # A second plan may share references; deleting one plan must not delete another plan's files.
   await page.locator('#plan-title').fill('Another plan with the same references')
   await page.locator('#save-plan').click()
   await page.wait_for_function("JSON.parse(localStorage.getItem('oh:plans:v1')||'[]').length===2")
   await page.locator('.saved-link').click();await page.locator('[data-plan-delete]').first.click()
   await page.wait_for_function("JSON.parse(localStorage.getItem('oh:plans:v1')||'[]').length===1")
   await page.reload(wait_until='networkidle')
   await page.locator('[data-plan-open]').first.click()
   await expect(page.locator('#saved-reference-files .reference-file')).to_have_count(2)
   await page.wait_for_function("document.querySelector('#saved-reference-files img')?.naturalWidth > 0")
   await expect(page.locator('#saved-reference-files a[download]')).to_have_count(2)
   files=await page.evaluate("async(ids)=>{const rows=await OH_UPLOADS.getFiles(ids);return Promise.all(rows.map(async r=>({name:r.name,size:r.blob.size,text:r.kind==='text'?await r.blob.text():null})));}",ids)
   assert next(r for r in files if r['name']=='supplies.txt')['text']==TEXT
   async with page.expect_download() as downloaded:await page.locator('#saved-reference-files a[download="supplies.txt"]').click()
   download=await downloaded.value;assert download.suggested_filename=='supplies.txt'
   path=await download.path();assert Path(path).read_text()==TEXT
   await page.screenshot(path=str(OUT/f'saved-files-{name}.png'))
   await page.keyboard.press('Escape')
   await page.locator('[data-plan-delete]').first.click()
   await page.wait_for_function("JSON.parse(localStorage.getItem('oh:plans:v1')||'[]').length===0")
   assert await page.evaluate('async(ids)=>(await OH_UPLOADS.getFiles(ids)).every(r=>r===null)',ids)
   checks.append(f'{name}: photo/text plan save, reload, exact-byte original download and reference-aware deletion passed')
   # File drop and URL drop use the same search area. Metadata here is a controlled fixture.
   await open_clean(page)
   await page.evaluate("""({b64,text})=>{const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));const dt=new DataTransfer();dt.items.add(new File([bytes],'dropped-photo.png',{type:'image/png'}));dt.items.add(new File([text],'dropped-notes.txt',{type:'text/plain'}));document.querySelector('#search-form').dispatchEvent(new DragEvent('drop',{dataTransfer:dt,bubbles:true,cancelable:true}));}""",{'b64':base64.b64encode(PHOTO.read_bytes()).decode(),'text':TEXT})
   await wait_ready(page);await expect(page.locator('#upload-list .reference-file')).to_have_count(2)
   await page.route('https://www.youtube.com/oembed**',lambda route:route.fulfill(status=200,content_type='application/json',body=json.dumps({'title':'Make a leather journal'})))
   await page.evaluate("""()=>{const dt=new DataTransfer();dt.setData('text/uri-list','https://youtu.be/dQw4w9WgXcQ');document.querySelector('#search-form').dispatchEvent(new DragEvent('drop',{dataTransfer:dt,bubbles:true,cancelable:true}));}""")
   await expect(page.locator('#link-result')).to_be_visible()
   await page.wait_for_function("currentInspiration?.sourceType==='link-and-files'")
   assert await page.evaluate("currentInspiration.evidence.some(e=>e.origin==='public-oembed')&&currentInspiration.evidence.some(e=>e.origin==='user-upload')")
   await expect(page.locator('#inspiration-file-gallery .reference-file')).to_have_count(2)
   await page.locator('[data-upload-remove]').first.click()
   await expect(page.locator('#save-plan')).to_be_disabled()
   await page.locator('#clear-uploads').click();await expect(page.locator('#upload-draft')).not_to_be_visible()
   assert (await page.locator('#search-query').input_value()).startswith('https://youtu.be/')
   checks.append(f'{name}: file/link dropping, mixed provenance, stale-result protection and removing files passed')
   # Safe filename rendering and usable errors; original input can be chosen again.
   await open_clean(page)
   await page.locator('#file-upload').set_input_files({'name':'bad.svg','mimeType':'image/svg+xml','buffer':b'<svg onload="alert(1)"/>'});await wait_ready(page)
   await expect(page.locator('#upload-status')).to_contain_text('SVG')
   await expect(page.locator('#upload-list .reference-file')).to_have_count(0)
   await page.locator('#photo-upload').set_input_files({'name':'<img src=x onerror=window.uploadXss=1>.png','mimeType':'image/png','buffer':PHOTO.read_bytes()});await wait_ready(page)
   assert await page.evaluate('window.uploadXss') is None
   await page.locator('#clear-uploads').click()
   await page.locator('#photo-upload').set_input_files(str(PHOTO));await wait_ready(page)
   await expect(page.locator('#upload-list .reference-file')).to_have_count(1)
   # Storage failures cannot falsely report a saved plan.
   await page.locator('#caption-input').fill('Make a leather journal');await submit(page)
   await page.evaluate("() => {window.realOpen=indexedDB.open.bind(indexedDB);indexedDB.open=()=>{throw new Error('File storage is unavailable');};}")
   await page.locator('#save-plan').click()
   await expect(page.locator('#toast')).to_contain_text('File storage is unavailable')
   assert await page.evaluate("JSON.parse(localStorage.getItem('oh:plans:v1')||'[]').length")==0
   await page.evaluate('() => {indexedDB.open=window.realOpen;}')
   checks.append(f'{name}: rejected types, escaped filenames, reselection and storage-failure behavior passed')
   for viewport in [320,390,768,1440]:
    await page.set_viewport_size({'width':viewport,'height':height})
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'{name}: overflow {viewport}'
   assert not errors,errors
   await context.close()
  await browser.close()
 OUT.joinpath('upload-browser-results.json').write_text(json.dumps({'baseUrl':BASE,'checks':checks},indent=2))
 print(json.dumps({'passed':len(checks),'checks':checks},indent=2))
asyncio.run(run())
