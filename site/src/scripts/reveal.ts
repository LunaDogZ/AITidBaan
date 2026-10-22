import { inView } from 'motion';

// ใส่ .is-in ให้ [data-reveal] ครั้งแรกที่เลื่อนมาเห็น (CSS ใน global.css ทำแอนิเมชัน)
inView(
  '[data-reveal]',
  (el) => {
    el.classList.add('is-in');
  },
  { amount: 0.15 },
);
