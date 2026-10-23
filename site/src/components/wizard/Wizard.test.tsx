// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Wizard from './Wizard';

// ผลประเมินคงที่: RAM 8GB + สรุปเอกสาร → Typhoon 2.5 4B, RAM 16GB → OpenThaiGPT
vi.mock('../../data/ratings.json', async () => ({ default: (await import('../../test/ratings.fixture.json')).default }));
vi.mock('canvas-confetti', () => ({ default: Object.assign(() => null, { reset: () => {} }) }));

const KEY = 'aitidbaan:wizard';
const RAM8 = { ram: 8, gpu: 'none', tasks: ['summary'] };

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | null = null;
let el: HTMLDivElement;

function mount(hash = '') {
  history.replaceState(null, '', `/wizard${hash}`);
  el = document.createElement('div');
  document.body.append(el);
  root = createRoot(el);
  act(() => root!.render(<Wizard lang="th" />));
}

function unmount() {
  act(() => root?.unmount());
  root = null;
  el?.remove();
}

// hashchange ยิงแบบ async เหมือนในเบราว์เซอร์จริง
async function settle() {
  await act(() => new Promise((r) => setTimeout(r, 0)));
}

async function goHash(n: number) {
  location.hash = `step-${n}`;
  await settle();
}

const text = () => el.textContent ?? '';
const button = (label: string) => [...el.querySelectorAll('button')].find((b) => b.textContent?.includes(label));
const click = (node: HTMLElement | undefined) => {
  if (!node) throw new Error('ไม่เจอปุ่ม');
  act(() => node.click());
};
const choose = (label: string) =>
  click([...el.querySelectorAll('label')].find((l) => l.querySelector('span')?.textContent === label)?.querySelector('input') ?? undefined);
const seed = (v: unknown) => localStorage.setItem(KEY, JSON.stringify(v));
const saved = () => JSON.parse(localStorage.getItem(KEY)!);

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = () => {};
});
afterEach(() => {
  unmount();
  vi.restoreAllMocks();
});

describe('go(n) เปลี่ยนขั้นทันที', () => {
  it('กด "ทำต่อ" จากหน้า Resume ไม่เรนเดอร์และไม่บันทึกขั้น ① ระหว่างรอ hashchange', async () => {
    seed({ answers: RAM8, step: 4 });
    mount();
    const writes: string[] = [];
    const real = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, k, v) {
      writes.push(v);
      real.call(this, k, v);
    });
    click(button('ทำต่อ'));
    // ยังไม่ถึงคิว hashchange: หน้าต้องเป็นขั้น ④ แล้ว
    expect(text()).not.toContain('คำถาม 1 จาก 3');
    expect(text()).toContain('โหลด Typhoon 2.5 4B ลงเครื่อง');
    await settle();
    expect(text()).toContain('โหลด Typhoon 2.5 4B ลงเครื่อง');
    expect(writes.map((w) => JSON.parse(w).step)).not.toContain(1);
    expect(saved().step).toBe(4);
  });
});

describe('สถานะเสร็จผูกกับโมเดล (doneModel)', () => {
  it('ทำครบด้วย RAM 8 → เปลี่ยนเป็น 16: ไม่บอกว่ามี OpenThaiGPT แล้ว และขั้น ⑥ ยังมีปุ่ม "AI ยังตอบได้" → เปลี่ยนกลับ 8 สถานะเสร็จกลับมา', async () => {
    seed({ answers: RAM8, step: 6 });
    mount('#step-6');
    click(button('AI ยังตอบได้'));
    expect(text()).toContain('เครื่องของคุณมี AI ออฟไลน์แล้ว');
    expect(saved().doneModel).toBe('typhoon-2.5-4b');

    await goHash(1);
    choose('16GB');
    unmount();
    mount();
    expect(text()).not.toContain('อยู่ใน LM Studio แล้ว');
    expect(text()).not.toContain('คุณติดตั้งเสร็จแล้ว');

    await goHash(6);
    expect(button('AI ยังตอบได้')).toBeDefined();
    expect(text()).not.toContain('เครื่องของคุณมี AI ออฟไลน์แล้ว');

    await goHash(1);
    choose('8GB');
    await goHash(6);
    expect(button('AI ยังตอบได้')).toBeUndefined();
    expect(text()).toContain('เครื่องของคุณมี AI ออฟไลน์แล้ว');
    unmount();
    mount();
    expect(text()).toContain('เครื่องนี้มี Typhoon 2.5 4B อยู่ใน LM Studio แล้ว');
  });

  it('เปลี่ยนเป็น RAM 4GB: ไม่ขึ้นว่ามีโมเดลอยู่แล้ว และปุ่มทำต่อพาไปขั้นที่บอกไว้โดยไม่เด้ง', async () => {
    seed({ answers: RAM8, step: 6 });
    mount('#step-6');
    click(button('AI ยังตอบได้'));
    await goHash(1);
    choose('4GB');
    await goHash(2);
    unmount();
    mount();
    expect(text()).not.toContain('อยู่ใน LM Studio แล้ว');
    expect(text()).toContain('คุณทำถึงขั้น ② โมเดลของคุณ');
    click(button('ทำต่อ'));
    await settle();
    expect(location.hash).toBe('#step-2');
    expect(text()).toContain('RAM 4GB ยังไม่พอ');
  });

  it('โหลดข้อมูลรูปแบบเก่า done: true ได้ เป็นเสร็จกับโมเดลที่แนะนำตอนนั้น', () => {
    seed({ answers: RAM8, step: 6, done: true });
    mount();
    expect(text()).toContain('เครื่องนี้มี Typhoon 2.5 4B อยู่ใน LM Studio แล้ว');
  });

  it('ข้อมูลเก่าเสียหาย หน้าไม่พัง และไม่ถือว่าเสร็จ', () => {
    localStorage.setItem(KEY, '{"answers": 5, "step": 6, "done": true}');
    mount();
    expect(text()).not.toBe('');
    expect(text()).not.toContain('คุณติดตั้งเสร็จแล้ว');
  });
});
