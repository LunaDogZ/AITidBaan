import { useEffect, useState } from 'react';
import { toMachine, type Answers } from './answers';
import { Progress } from './Progress';
import { CheckMachine } from './CheckMachine';
import { Recommendation } from './Recommendation';

// ขั้นอยู่ใน URL hash (#step-1) เพื่อให้ปุ่ม back ของเบราว์เซอร์ใช้ได้
function stepFromHash(): number {
  const n = Number(location.hash.match(/^#step-(\d)$/)?.[1]);
  return n >= 1 && n <= 6 ? n : 1;
}

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({ tasks: [] });
  const [question, setQuestion] = useState(0);

  useEffect(() => {
    const sync = () => setStep(stepFromHash());
    sync();
    addEventListener('hashchange', sync);
    return () => removeEventListener('hashchange', sync);
  }, []);

  const machine = toMachine(answers);
  const ready = machine !== null && answers.tasks.length > 0;
  // เข้า #step-2 ตรงๆ โดยยังไม่ได้ตอบ ให้กลับไปขั้นแรก ทั้งหน้าจอและ URL
  // (ถ้าแก้แค่หน้าจอ พอตอบครบจะกระโดดไปขั้น 2 เองโดยไม่ได้กดไปต่อ)
  useEffect(() => {
    if (step > 1 && !ready) {
      history.replaceState(null, '', '#step-1');
      setStep(1);
    }
  }, [step, ready]);
  const shown = ready ? step : 1;
  const go = (n: number) => {
    location.hash = `step-${n}`;
    scrollTo({ top: 0 });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-24 pb-20">
      <Progress current={shown} />
      <div key={shown} className="fade-in mt-8">
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
          <Recommendation machine={machine} tasks={answers.tasks} onEdit={() => go(1)} onNext={() => go(3)} />
        )}
        {shown >= 3 && (
          <div className="rounded-2xl border border-line bg-surface p-8">
            <p className="text-xl font-bold">ขั้นนี้ยังไม่ได้ทำใน prototype</p>
            <p className="mt-2 text-muted">prototype รอบนี้มีแค่ขั้นเช็กเครื่องกับผลแนะนำ</p>
            <button onClick={() => go(2)} className="mt-6 font-semibold text-accent underline underline-offset-4">
              กลับไปดูผลแนะนำ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
