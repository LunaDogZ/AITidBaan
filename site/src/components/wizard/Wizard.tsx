import { useEffect, useLayoutEffect, useState } from 'react';
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
import { clearProgress, loadProgress, resumeLink, saveProgress, type Progress as Saved } from '../../lib/progress';
import type { Lang } from '../../i18n';
import { LangContext } from './lang';

// ขั้นอยู่ใน URL hash (#step-1) เพื่อให้ปุ่ม back ของเบราว์เซอร์ใช้ได้
function stepFromHash(): number {
  const n = Number(location.hash.match(/^#step-(\d)$/)?.[1]);
  return n >= 1 && n <= 6 ? n : 1;
}

export default function Wizard({ lang }: { lang: Lang }) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({ tasks: [] });
  const [question, setQuestion] = useState(0);
  const [done, setDone] = useState(false);
  // ค่าที่จำไว้ต้องโหลดก่อนเช็กขั้นด้านล่าง ไม่งั้นลิงก์ #step-4 จากปุ่ม "ทำต่อ" หน้าแรกจะโดนดึงกลับขั้นแรก
  const [loaded, setLoaded] = useState(false);
  // เข้าวิซาร์ดตรงๆ (ไม่ได้ระบุขั้น) ขณะที่มีความคืบหน้าเดิม ให้ถามก่อนว่าจะทำต่อไหม
  const [resume, setResume] = useState<Saved | null>(null);

  useEffect(() => {
    const saved = loadProgress();
    const first = stepFromHash();
    if (saved) {
      setAnswers(saved.answers);
      setDone(saved.done);
      if (first === 1 && resumeLink(saved, lang)) setResume(saved);
    }
    setStep(first);
    setLoaded(true);
    const sync = () => setStep(stepFromHash());
    addEventListener('hashchange', sync);
    return () => removeEventListener('hashchange', sync);
  }, []);

  const machine = toMachine(answers);
  const ready = machine !== null && answers.tasks.length > 0;
  // เข้า #step-2 ตรงๆ โดยยังไม่ได้ตอบ ให้กลับไปขั้นแรก ทั้งหน้าจอและ URL
  // (ถ้าแก้แค่หน้าจอ พอตอบครบจะกระโดดไปขั้น 2 เองโดยไม่ได้กดไปต่อ)
  // ขั้น ③-⑥ ต้องมีโมเดลที่แนะนำ ถ้าไม่มี (RAM 4GB) ให้อยู่ที่หน้าผลแนะนำ
  const model = machine ? recommend(machine, answers.tasks, MODELS) : null;
  const allowed = !ready ? 1 : !model ? 2 : 6;
  useEffect(() => {
    if (loaded && step > allowed) {
      history.replaceState(null, '', `#step-${allowed}`);
      setStep(allowed);
    }
  }, [loaded, step, allowed]);
  const shown = Math.min(step, allowed);
  const go = (n: number) => {
    setResume(null);
    location.hash = `step-${n}`;
  };
  // เลื่อนขึ้นบนหลังขั้นใหม่แสดงแล้ว และไม่ใช้แบบนุ่มนวล: ถ้าสั่งก่อนเนื้อหาเปลี่ยน
  // Firefox จะหยุดการเลื่อนแบบนุ่มนวลกลางทาง หน้าค้างอยู่ด้านล่าง
  useLayoutEffect(() => {
    scrollTo({ top: 0, behavior: 'instant' });
  }, [shown, resume]);
  const restart = () => {
    clearProgress();
    setAnswers({ tasks: [] });
    setDone(false);
    setQuestion(0);
    go(1);
  };

  useEffect(() => {
    if (loaded && !resume) saveProgress({ answers, step: shown, done });
  }, [loaded, resume, answers, shown, done]);

  if (!loaded) return null;
  if (resume) {
    return (
      <LangContext.Provider value={lang}>
        <div className="mx-auto max-w-3xl px-4 pt-[5.25rem] pb-20">
          <div className="fade-in">
            <Resume
              step={resume.step}
              done={resume.done}
              modelName={model?.name}
              onContinue={() => go(resume.done ? 5 : resume.step)}
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
              onEdit={() => go(1)}
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
          {shown === 6 && model && <GoOffline done={done} onDone={() => setDone(true)} onBack={() => go(5)} />}
        </div>
      </div>
    </LangContext.Provider>
  );
}
