import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const js = fs.readFileSync('data.js', 'utf8');
const {projects, places, communities} = vm.runInNewContext(js + '\n({projects,places,communities})');
const html = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');
assert.ok(projects.length >= 30, 'Expected a meaningful NYC project index');
assert.ok(Object.keys(places).length >= 10, 'Expected a local places directory');
assert.ok(Object.keys(communities).length >= 8, 'Expected a local community directory');
assert.equal(new Set(projects.map(p=>p.slug)).size, projects.length, 'Project slugs must be unique');
for (const p of projects) {
  for(const field of ['slug','title','category','intro','time','tip']) assert.ok(p[field], p.slug+' missing '+field);
  assert.ok(p.materials.length >= 3, p.slug+' materials too short');
  assert.ok(p.steps.length >= 3, p.slug+' needs more than 2 steps');
  assert.ok(p.placeIds.length > 0 && p.placeIds.every(id=>places[id]), p.slug+' invalid place refs');
  assert.ok(p.communityIds.length > 0 && p.communityIds.every(id=>communities[id]), p.slug+' invalid group refs');
  assert.ok(p.budgetMax >= p.budgetMin, p.slug+' invalid budget');
}
for(const [type, items] of [['place',places],['community',communities]]) {
  for(const [id,item] of Object.entries(items)) {
    assert.ok(item.name && item.url.startsWith('https://'),type+' '+id+' missing name/HTTPS URL');
  }
}
for(const id of ['project-grid','places-grid','community-grid','link-result','link-status','search-form']) assert.ok(html.includes('id="'+id+'"'), 'Missing page anchor '+id);
assert.ok(html.includes('data.js') && html.includes('app.js'), 'App scripts are not loaded');
assert.ok(app.includes('function publicVideoTitle') && app.includes('function renderLinkResult'), 'Link intake must render results');
console.log('OK:',projects.length,'projects,',Object.keys(places).length,'places,',Object.keys(communities).length,'groups. All references valid.');
