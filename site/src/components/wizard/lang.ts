import { createContext, useContext } from 'react';
import type { Lang } from '../../i18n';

// ภาษาของหน้า ส่งมาจาก wizard.astro ทีเดียว คอมโพเนนต์ลูกเรียก useLang() เอา
export const LangContext = createContext<Lang>('th');
export const useLang = () => useContext(LangContext);
