<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/vue';

type Operator = '+' | '-' | 'x' | '/';

const display = ref('0');
const storedValue = ref<number | null>(null);
const pendingOperator = ref<Operator | null>(null);
const waitingForOperand = ref(false);
const error = ref(false);

const numberRows = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3']
];
const operatorLabels: Operator[] = ['/', 'x', '-', '+'];
const displayValue = computed(() => display.value);

function clear() {
  display.value = '0';
  storedValue.value = null;
  pendingOperator.value = null;
  waitingForOperand.value = false;
  error.value = false;
}

function inputDigit(digit: string) {
  if (error.value) clear();
  if (waitingForOperand.value) {
    display.value = digit;
    waitingForOperand.value = false;
    return;
  }
  display.value = display.value === '0' ? digit : display.value + digit;
}

function inputDecimal() {
  if (error.value) clear();
  if (waitingForOperand.value) {
    display.value = '0.';
    waitingForOperand.value = false;
    return;
  }
  if (!display.value.includes('.')) display.value += '.';
}

function backspace() {
  if (error.value || waitingForOperand.value) return;
  display.value = display.value.length > 1 ? display.value.slice(0, -1) : '0';
  if (display.value === '-') display.value = '0';
}

function calculate(left: number, right: number, operator: Operator): number | null {
  if (operator === '+') return left + right;
  if (operator === '-') return left - right;
  if (operator === 'x') return left * right;
  return right === 0 ? null : left / right;
}

function inputOperator(operator: Operator) {
  if (error.value) return;
  const currentValue = Number(display.value);
  if (storedValue.value !== null && pendingOperator.value && !waitingForOperand.value) {
    const result = calculate(storedValue.value, currentValue, pendingOperator.value);
    if (result === null) {
      display.value = 'Error';
      error.value = true;
      return;
    }
    display.value = String(result);
    storedValue.value = result;
  } else {
    storedValue.value = currentValue;
  }
  pendingOperator.value = operator;
  waitingForOperand.value = true;
}

function equals() {
  if (error.value || storedValue.value === null || !pendingOperator.value) return;
  const result = calculate(storedValue.value, Number(display.value), pendingOperator.value);
  if (result === null) {
    display.value = 'Error';
    error.value = true;
    return;
  }
  display.value = String(result);
  storedValue.value = null;
  pendingOperator.value = null;
  waitingForOperand.value = true;
}
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonTitle>Ionic Calculator</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent :fullscreen="true" class="calculator-content">
      <main class="calculator-shell">
        <section class="display-panel" aria-live="polite">
          <span class="display-label">Result</span>
          <output class="display-value">{{ displayValue }}</output>
        </section>

        <IonGrid class="keypad" :fixed="true">
          <IonRow>
            <IonCol size="6"><IonButton class="key key-muted" expand="block" @click="clear">AC</IonButton></IonCol>
            <IonCol size="3"><IonButton class="key key-muted" expand="block" @click="backspace">DEL</IonButton></IonCol>
            <IonCol size="3"><IonButton class="key key-operator" expand="block" @click="inputOperator('/')">/</IonButton></IonCol>
          </IonRow>
          <IonRow v-for="(row, rowIndex) in numberRows" :key="rowIndex">
            <IonCol v-for="digit in row" :key="digit" size="3"><IonButton class="key" expand="block" @click="inputDigit(digit)">{{ digit }}</IonButton></IonCol>
            <IonCol size="3"><IonButton class="key key-operator" expand="block" @click="inputOperator(operatorLabels[rowIndex + 1])">{{ operatorLabels[rowIndex + 1] }}</IonButton></IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6"><IonButton class="key" expand="block" @click="inputDigit('0')">0</IonButton></IonCol>
            <IonCol size="3"><IonButton class="key" expand="block" @click="inputDecimal">.</IonButton></IonCol>
            <IonCol size="3"><IonButton class="key key-equals" expand="block" @click="equals">=</IonButton></IonCol>
          </IonRow>
        </IonGrid>
      </main>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.calculator-content {
  --background: #f4f7fb;
}

.calculator-shell {
  width: min(100%, 520px);
  margin: 0 auto;
  padding: 28px 18px 34px;
}

.display-panel {
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 12px;
  padding: 24px;
  border-radius: 18px;
  background: #102a43;
  color: #ffffff;
  box-shadow: 0 14px 30px rgba(16, 42, 67, 0.18);
}

.display-label {
  color: #9fb3c8;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.display-value {
  width: 100%;
  overflow: hidden;
  font-size: clamp(2.25rem, 10vw, 4rem);
  font-variant-numeric: tabular-nums;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.keypad {
  padding: 20px 0 0;
}

.key {
  --background: #ffffff;
  --color: #102a43;
  --border-radius: 14px;
  --box-shadow: 0 5px 12px rgba(16, 42, 67, 0.08);
  height: 64px;
  margin: 5px 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.key-muted {
  --background: #d9e2ec;
  --color: #243b53;
}

.key-operator {
  --background: #f0a202;
  --color: #1f2933;
}

.key-equals {
  --background: #1976d2;
  --color: #ffffff;
}
</style>
