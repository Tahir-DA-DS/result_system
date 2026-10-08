// Renders every screen against fake server data and checks the page contains real elements,
// never stray text such as "[object HTMLDivElement]" or "false" (a past bug from passing arrays to the DOM).
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { session } from '../src/state/session.js';
import { findFlags } from '../src/lib/flags.js';
import { missingFields, incompleteReports } from '../src/lib/reportCheck.js';

const classes = [
  { _id: 'c1', name: 'JSS 1', level: 'secondary', formTeacher: 'u1', subjects: [{ _id: 's1', name: 'Mathematics', teacher: 'u1' }, { _id: 's2', name: 'English Language', teacher: '' }] },
  { _id: 'c2', name: 'Nursery 1', level: 'nursery', formTeacher: '', subjects: [{ _id: 's3', name: 'Phonics', teacher: '' }] },
];
const users = [{ _id: 'u1', name: 'Ada Admin', email: 'a@x.com', role: 'admin', active: true }, { _id: 'u2', name: 'Tom Teacher', email: 't@x.com', role: 'teacher', active: false }];
const notReady = { ready: false, pendingSubjects: ['Mathematics'], classReport: 'draft', missingPrincipalRemarks: ['David Steven'], pupilCount: 2 };
const api = {
  '/users': users, '/classes': classes, '/term': { term: 'Second', session: '2025/2026' },
  '/classes/c1/students': [{ _id: 'p1', name: 'David Steven', adm: '0014' }, { _id: 'p2', name: 'Mary John', adm: '' }],
  '/classes/c1/sheets': [{ subject: 's1', name: 'Mathematics', teacher: 'u1', status: 'draft', note: '', rows: { p1: { a: 10, b: 12, e: 40 } } },
    { subject: 's2', name: 'English Language', teacher: '', status: 'submitted', note: '', rows: {} }],
  '/classes/c1/reports': { status: 'draft', note: '', reports: [{ student: 'p1', b: [3, 3, 3, 3, 3], att: 90, rem: 'Good', prin: '', st: '' }] },
  '/classes/c1/broadsheet': { class: { id: 'c1', name: 'JSS 1', level: 'secondary' },
    pupils: [{ _id: 'p1', name: 'David Steven', adm: '0014' }, { _id: 'p2', name: 'Mary John', adm: '' }],
    subjects: [{ id: 's1', name: 'Mathematics', teacher: 'u1', teacherName: 'Ada Admin', status: 'draft', note: '', mine: true, visible: true, rows: { p1: { a: 10, b: 12, e: 40 } } },
      { id: 's2', name: 'English Language', teacher: '', teacherName: '', status: 'submitted', note: '', mine: false, visible: false, rows: null }] },
  '/term/close-check': { term: 'Second', session: '2025/2026', valid: true, alreadyArchived: false,
    classes: [{ id: 'c1', name: 'JSS 1', pupilCount: 2, ready: false, pendingSubjects: 1, classReport: 'draft', missingRemarks: 2 }] },
  '/promotion/preview': { classes: [], termClosed: false, session: '2025/2026' },
  '/archive': [{ session: '2025/2026', term: 'First', termIndex: 1, closedAt: '2026-04-01', classes: [{ id: 'c1', name: 'JSS 1', complete: true }] }],
  '/archive/results': { term: { term: 'First', session: '2025/2026', open: '90' }, class: { id: 'c1', name: 'JSS 1', level: 'secondary' }, complete: true,
    pupils: [{ id: 'p1', name: 'David Steven', adm: '0014', rows: [{ subject: 'Mathematics', a: 10, b: 12, e: 40, total: 62, hi: 80, lo: 20, grade: 'B', remark: 'Very Good' }],
      obtainable: 100, obtained: 62, average: 62, position: 1, classSize: 1, report: { b: [3, 3, 3, 3, 3], att: 90, rem: 'Good', prin: 'Well done', st: 'Promoted' }, terms: [62, null, null] }] },
  '/classes/c1/preview': { term: { term: 'Second', session: '2025/2026' }, class: { id: 'c1', name: 'JSS 1', level: 'secondary' }, draft: true, pupils: [{ id: 'p1', name: 'David Steven', adm: '0014', rows: [{ subject: 'Mathematics', a: 10, b: 12, e: 40, total: 62, hi: 80, lo: 20, grade: 'B', remark: 'Very Good' }], obtainable: 100, obtained: 62, average: 62, position: 1, classSize: 1, report: { b: [3, 3, 3, 3, 3], att: 90, rem: 'Good', prin: '', st: 'Promoted' }, terms: [62, null, null] }] },
  '/classes/c1/mastersheet': { term: { term: 'Second', session: '2025/2026' }, class: { id: 'c1', name: 'JSS 1', level: 'secondary' },
    subjects: [{ name: 'Mathematics', highest: 80, lowest: 20, average: 50 }, { name: 'English', highest: null, lowest: null, average: null }],
    pupils: [{ id: 'p1', name: 'David Steven', scores: [62, null], obtained: 62, average: 62, position: 1 }] },
  '/history': [{ at: '2026-04-01T10:00:00Z', action: 'approve', by: 'u1', byName: 'Ada Admin', class: 'JSS 1', subject: 'Mathematics', note: '', term: '' },
    { at: '2026-03-30T09:00:00Z', action: 'return', by: 'u1', byName: 'Ada Admin', class: 'JSS 1', subject: 'Class report', note: 'Add remarks', term: 'First Term 2025/2026' }],
  '/classes/c1/status': notReady,
  '/classes/c1/averages': [{ id: 'p1', average: 62 }, { id: 'p2', average: null }],
  '/classes/c1/results': { status: notReady, term: {}, class: { id: 'c1', name: 'JSS 1', level: 'secondary' }, pupils: null },
};

beforeEach(() => {
  document.body.innerHTML = '<div id="toast"></div>';
  session.set('token', { id: 'u1', name: 'Ada Admin', email: 'a@x.com', role: 'admin' });
  globalThis.fetch = vi.fn(async url => {
    const path = new URL(url).pathname.replace(/^\/api/, '');
    return path in api ? { ok: true, status: 200, json: async () => api[path] } : { ok: false, status: 404, json: async () => ({ error: 'no mock for ' + path }) };
  });
});

const screens = {
  staff: () => import('../src/views/staff.js'),
  classes: () => import('../src/views/classes.js'),
  pupils: () => import('../src/views/pupils.js'),
  scores: () => import('../src/views/scores.js'),
  report: () => import('../src/views/report.js'),
  approve: () => import('../src/views/approve/index.js'),
  review: () => import('../src/views/review.js'),
  print: () => import('../src/views/print.js'),
  term: () => import('../src/views/term/index.js'),
  preview: () => import('../src/views/draftPreview.js'),
  mastersheet: () => import('../src/views/mastersheet.js'),
  history: () => import('../src/views/history.js'),
  archive: () => import('../src/views/archive.js'),
  account: () => import('../src/views/account.js'),
};

describe('screens render real elements', () => {
  for (const [name, load] of Object.entries(screens)) {
    it(name, async () => {
      const root = document.createElement('div');
      document.body.append(root);
      await (await load()).render(root);
      expect(root.children.length).toBeGreaterThan(0);
      expect(root.textContent).not.toMatch(/\[object|undefined|null|\bfalse\b|\btrue\b/);
    });
  }
  it('classes screen lists every class and subject row as elements', async () => {
    const root = document.createElement('div');
    await (await screens.classes()).render(root);
    expect(root.querySelectorAll('details').length).toBe(2);
    expect(root.querySelectorAll('details input').length).toBeGreaterThanOrEqual(3);   // subject name boxes (+ new subject boxes)
  });
});

describe('previews', () => {
  const mount = async (path, root = document.createElement('div')) => { await (await screens[path]()).render(root); return root; };
  it('approve: every subject has an expandable table of all pupils with flags', async () => {
    const root = await mount('approve');
    expect(root.querySelectorAll('.subject details table.tbl').length).toBe(2);
    expect(root.textContent).toContain('Look at: Mary John (incomplete)');   // p2 has no scores
  });
  it('report: preview table lists every pupil and flags the incomplete ones', async () => {
    const root = await mount('report');
    expect(root.querySelectorAll('details table.tbl tbody tr').length).toBe(2);
    expect(root.textContent).toContain('2 of 2 pupil(s) incomplete: David Steven, Mary John');   // David has no status yet (secondary), Mary has nothing
  });
  it('review: grid has a column per subject and hides drafts that are not visible', async () => {
    const root = await mount('review');
    expect(root.querySelectorAll('table.board thead th').length).toBe(3);   // Pupil + 2 subjects
    expect(root.querySelectorAll('table.board td.hid').length).toBe(2);     // English column hidden for both pupils
    expect(root.textContent).toContain('Submit all my subjects (1)');
  });
  it('flags: incomplete, zero exam, and far from average', () => {
    const pupils = [1, 2, 3, 4, 5, 6].map(n => ({ _id: 'p' + n }));
    const rows = { p1: { a: 15, b: 15, e: 50 }, p2: { a: 15, b: 15, e: 50 }, p3: { a: 15, b: 15, e: 50 }, p4: { a: 15, b: 15, e: 50 }, p5: { a: 1, b: 1, e: 0 }, p6: { a: 5 } };
    const f = findFlags(pupils, rows);
    expect(f.p5).toEqual(['exam is 0', 'far from class average']);
    expect(f.p6).toEqual(['incomplete']);
    expect(f.p1).toBeUndefined();
  });
  it('report check: lists exactly what is missing', () => {
    expect(missingFields({ b: [3, 3, 3, 3, 3], att: 90, rem: 'Good', st: 'Promoted' }, 'secondary')).toEqual([]);
    expect(missingFields({ b: [3, 0, 3, 3, 3], att: '', rem: ' ', st: '' }, 'secondary')).toEqual(['behaviour ratings', 'days attended', 'remark', 'status']);
    expect(missingFields({ b: [1, 1, 1, 1, 1], att: 5, rem: 'x', st: '' }, 'primary')).toEqual([]);
    expect(incompleteReports([{ _id: 'a', name: 'A' }], {}, 'primary')[0].name).toBe('A');
  });
});

describe('term close, archive and promotion', () => {
  const mountScreen = async name => { const root = document.createElement('div'); await (await screens[name]()).render(root); return root; };
  it('term: shows each class readiness and the close button; promotion waits until the term is closed', async () => {
    const root = await mountScreen('term');
    expect(root.textContent).toContain('Close Second Term 2025/2026');
    expect(root.textContent).toContain('Close anyway (archive as incomplete)');
    expect(root.textContent).toContain('Available after the Third Term has been closed.');
    expect(root.textContent).toContain('Download backup');
  });
  it('term: promotion lists classes and starts "Repeated" pupils on repeat', async () => {
    const saved = api['/promotion/preview'];
    api['/promotion/preview'] = { termClosed: true, session: '2025/2026', classes: [{ id: 'c1', name: 'JSS 1', next: { id: 'c2', name: 'JSS 2' },
      pupils: [{ id: 'p1', name: 'David Steven', defaultAction: 'repeat' }, { id: 'p2', name: 'Mary John', defaultAction: 'promote' }] }] };
    const root = await mountScreen('term');
    api['/promotion/preview'] = saved;
    expect(root.textContent).toContain('JSS 1 → JSS 2');
    expect([...root.querySelectorAll('details select')].map(s => s.value)).toEqual(['repeat', 'promote']);
  });
  it('archive: shows a past term and builds the real result sheet from the snapshot', async () => {
    const root = await mountScreen('archive');
    expect(root.textContent).toContain('First Term 2025/2026');
    expect(root.querySelectorAll('.sheet').length).toBe(1);
    expect(root.querySelector('.sheet').textContent).toContain('DAVID STEVEN');
  });
});

describe('extras', () => {
  const mountScreen = async name => { const root = document.createElement('div'); await (await screens[name]()).render(root); return root; };
  it('draft preview: real result sheet with a DRAFT mark and no print button', async () => {
    const root = await mountScreen('preview');
    expect(root.querySelectorAll('.sheet .draftmark').length).toBe(1);
    expect(root.querySelector('.sheet').textContent).toContain('DAVID STEVEN');
    expect([...root.querySelectorAll('button')].some(b => /print/i.test(b.textContent))).toBe(false);
  });
  it('broadsheet: one column per subject plus totals, with subject statistics', async () => {
    const root = await mountScreen('mastersheet');
    expect(root.querySelectorAll('.master thead th').length).toBe(1 + 2 + 3);
    expect(root.querySelector('.master').textContent).toContain('1. David Steven');
    expect(root.querySelector('.master tfoot').textContent).toContain('Class average');
  });
  it('history: lists events in words, with reasons and archived terms', async () => {
    const root = await mountScreen('history');
    expect(root.textContent).toContain('approved'); expect(root.textContent).toContain('returned');
    expect(root.textContent).toContain('Add remarks'); expect(root.textContent).toContain('First Term 2025/2026');
  });
});
