import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { toMachine, type Answers } from './answers';
import { Progress } from './Progress';
import { CheckMachine } from './CheckMachine';
import { Recommendation } from './Recommendation';
import { InstallApp } from './InstallApp';
import { LoadModel } from './LoadModel';
import { TryIt } from './TryIt';
import { GoOffline } from './GoOffline';
import { Resume } from './Resume';
import { recommend } from '../../lib/recommend';
import { MODELS } from '../../data/models';
import {
  clearProgress,
  isDone,
  loadProgress,
  maxStep,
  reachableStep,
  resumeLink,
  saveProgress,
  type Progress as Saved,
} from '../../lib/progress';
import type { Lang } from '../../i18n';
import { LangContext } from './lang';

// ขั้นอยู่ใน URL hash (#step-1) เพื่อให้ปุ่ม back ของเบราว์เซอร์ใช้ได้
function stepFromHash(): number {
  const n = Number(location.hash.match(/^#step-(\d)$/)?.[1]);
  return n >= 1 && n <= 6 ? n : 1;
}

// รีโหลดแล้วให้กลับไปตำแหน่งเดิมในขั้นเดิม เบราว์เซอร์คืนให้เองไม่ได้ เพราะตอนหน้าโหลดวิซาร์ดยังไม่ render
const SCROLL_KEY = 'aitidbaan:wizard-scroll';
function savedScroll(): number {
  try {
    const v = JSON.parse(sessionStorage.getItem(SCROLL_KEY) ?? '');
    return v.hash === location.hash && typeof v.y === 'number' ? v.y : 0;
  } catch {
    return 0;
  }
}
function saveScroll() {
  try {
    sessionStorage.setItem(SCROLL_KEY, JSON.stringify({ hash: location.hash, y: scrollY }));
  } catch {}
}

export default function Wizard({ lang }: { lang: Lang }) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({ tasks: [] });
  const [question, setQuestion] = useState(0);
  // โมเดลที่ทำครบขั้น ⑥ (ไม่เก็บเป็น true/false เพราะเปลี่ยนคำตอบแล้วอาจได้โมเดลอื่นที่ยังไม่ได้โหลด)
  const [doneModel, setDoneModel] = useState<string>();
  // ค่าที่จำไว้ต้องโหลดก่อนเช็กขั้นด้านล่าง ไม่งั้นลิงก์ #step-4 จากปุ่ม "ทำต่อ" หน้าแรกจะโดนดึงกลับขั้นแรก
  const [loaded, setLoaded] = useState(false);
  // เข้าวิซาร์ดตรงๆ (ไม่ได้ระบุขั้น) ขณะที่มีความคืบหน้าเดิม ให้ถามก่อนว่าจะทำต่อไหม
  const [resume, setResume] = useState<Saved | null>(null);

  useEffect(() => {
    const saved = loadProgress();
    const first = stepFromHash();
    if (saved) {
      setAnswers(saved.answers);
      setDoneModel(saved.doneModel);
      if (first === 1 && resumeLink(saved, lang)) setResume({ ...saved, step: reachableStep(saved) });
    }
    setStep(first);
    setLoaded(true);
    const sync = () => setStep(stepFromHash());
    addEventListener('hashchange', sync);
    addEventListener('pagehide', saveScroll);
    return () => {
      removeEventListener('hashchange', sync);
      removeEventListener('pagehide', saveScroll);
    };
  }, []);

  const machine = toMachine(answers);
  // เข้า #step-2 ตรงๆ โดยยังไม่ได้ตอบ ให้กลับไปขั้นแรก ทั้งหน้าจอและ URL
  // (ถ้าแก้แค่หน้าจอ พอตอบครบจะกระโดดไปขั้น 2 เองโดยไม่ได้กดไปต่อ)
  // ขั้น ③-⑥ ต้องมีโมเดลที่แนะนำ ถ้าไม่มี (RAM 4GB) ให้อยู่ที่หน้าผลแนะนำ
  const model = machine ? recommend(machine, answers.tasks, MODELS) : null;
  const allowed = maxStep(answers);
  const done = model !== null && doneModel === model.id;
  useEffect(() => {
    if (loaded && step > allowed) {
      history.replaceState(null, '', `#step-${allowed}`);
      setStep(allowed);
    }
  }, [loaded, step, allowed]);
  const shown = Math.min(step, allowed);
  // hashchange มาทีหลังแบบ async ตั้งขั้นเองทันที ไม่งั้นจะเห็นขั้นเดิม (และบันทึกขั้นเดิม) อยู่หนึ่งเฟรม
  const go = (n: number) => {
    setResume(null);
    setStep(n);
    location.hash = `step-${n}`;
  };
  // เลื่อนขึ้นบนหลังขั้นใหม่แสดงแล้ว และไม่ใช้แบบนุ่มนวล: ถ้าสั่งก่อนเนื้อหาเปลี่ยน
  // Firefox จะหยุดการเลื่อนแบบนุ่มนวลกลางทาง หน้าค้างอยู่ด้านล่าง
  // ครั้งแรกที่แสดง (เปิดหรือรีโหลด) กลับไปตำแหน่งที่จำไว้ของขั้นนั้นแทน
  const restored = useRef(false);
  useLayoutEffect(() => {
    if (!loaded) return;
    const top = restored.current ? 0 : savedScroll();
    restored.current = true;
    scrollTo({ top, behavior: 'instant' });
  }, [loaded, shown, resume]);
  const restart = () => {
    clearProgress();
    setAnswers({ tasks: [] });
    setDoneModel(undefined);
    setQuestion(0);
    go(1);
  };

  useEffect(() => {
    if (loaded && !resume) saveProgress({ answers, step: shown, doneModel });
  }, [loaded, resume, answers, shown, doneModel]);

  if (!loaded) return null;
  if (resume) {
    return (
      <LangContext.Provider value={lang}>
        <div className="mx-auto max-w-3xl px-4 pt-[5.25rem] pb-20">
          <div className="fade-in">
            <Resume
              step={resume.step}
              done={isDone(resume)}
              modelName={model?.name}
              onContinue={() => go(isDone(resume) ? 5 : resume.step)}
              onRestart={restart}
            />
          </div>
        </div>
      </LangContext.Provider>
    );
  }

  return (
    <LangContext.Provider value={lang}>
      <div className="mx-auto max-w-3xl px-4 pt-[5.25rem] pb-20">
        <Progress current={shown} />
        <div key={shown} className="fade-in mt-6">
          {shown === 1 && (
            <CheckMachine
              answers={answers}
              onChange={setAnswers}
              question={question}
              onQuestion={setQuestion}
              onDone={() => go(2)}
            />
          )}
          {shown === 2 && machine && (
            <Recommendation
              machine={machine}
              tasks={answers.tasks}
              onEdit={() => {
                setQuestion(0);
                go(1);
              }}
              onEditQuestion={(q) => {
                setQuestion(q);
                go(1);
              }}
              onNext={() => go(3)}
            />
          )}
          {shown === 3 && model && <InstallApp model={model} onBack={() => go(2)} onNext={() => go(4)} />}
          {shown === 4 && model && <LoadModel model={model} onBack={() => go(3)} onNext={() => go(5)} />}
          {shown === 5 && model && (
            <TryIt model={model} tasks={answers.tasks} onBack={() => go(4)} onNext={() => go(6)} />
          )}
          {shown === 6 && model && <GoOffline done={done} onDone={() => setDoneModel(model.id)} onBack={() => go(5)} />}
        </div>
      </div>
    </LangContext.Provider>
  );
}
