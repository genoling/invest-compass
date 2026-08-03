/**
 * 模拟交易状态持久化（Firestore）
 *
 * 将模拟账户/持仓/订单/成交/权益曲线存储到 Firestore，
 * 刷新页面后数据不丢失。
 */
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/config";
import type { SimulatorState } from "@/lib/types/trading";

/** 模拟交易在 Firestore 中的文档路径 */
const SIM_DOC = "simulation/account";

/** 将模拟状态保存到 Firestore */
export async function saveSimState(state: SimulatorState): Promise<void> {
  try {
    const db = getDb();
    await setDoc(doc(db, SIM_DOC), state as unknown as Record<string, unknown>);
  } catch (e) {
    console.warn("保存模拟交易状态失败（可能未配置 Firestore）:", e);
  }
}

/** 从 Firestore 加载模拟状态 */
export async function loadSimState(): Promise<SimulatorState | null> {
  try {
    const db = getDb();
    const snap = await getDoc(doc(db, SIM_DOC));
    if (snap.exists()) {
      return snap.data() as unknown as SimulatorState;
    }
    return null;
  } catch (e) {
    console.warn("加载模拟交易状态失败（可能未配置 Firestore）:", e);
    return null;
  }
}

/** 订阅 Firestore 中的模拟状态（实时同步） */
export function subscribeSimState(
  onChange: (state: SimulatorState) => void
): Unsubscribe | null {
  try {
    const db = getDb();
    return onSnapshot(doc(db, SIM_DOC), (snap) => {
      if (snap.exists()) {
        onChange(snap.data() as unknown as SimulatorState);
      }
    });
  } catch (e) {
    console.warn("订阅模拟交易状态失败（可能未配置 Firestore）:", e);
    return null;
  }
}
