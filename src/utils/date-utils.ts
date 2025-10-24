export function getYearMonthAndNext(): string[] {
  const today = new Date();
  // const year = today.getFullYear();
  // const month = today.getMonth(); // 0-11
  const dayOfWeek = today.getDay(); // 0 = domingo, 5 = sexta, 6 = sábado

  // Verifica se hoje é sexta-feira
  if (dayOfWeek === 5) {
    // Cria datas para sábado e domingo
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + 1);

    const sunday = new Date(today);
    sunday.setDate(today.getDate() + 2);

    // Verifica se sábado ou domingo são o primeiro dia do próximo mês
    const isNextMonthStarting =
      saturday.getDate() === 1 || sunday.getDate() === 1;

    if (isNextMonthStarting) {
      const currentMonthStr = getYearMonth(today);
      const nextMonthStr = getYearMonth(saturday);

      return [currentMonthStr, nextMonthStr];
    }
  }

  // Caso contrário, retorna apenas mês atual
  return [getYearMonth(today)];
}

export function getYearMonth(dateInput?: string | Date): string {
  const today = dateInput ? new Date(dateInput) : new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  return `${year}-${(month + 1).toString().padStart(2, '0')}`;
}

export function expirationDatePlusDays(dateInput: string, numberOfDayCount: number, weekDay: "SEXTA" | "SEGUNDA" = "SEGUNDA"): boolean {
  let weekDayNumber = 1
  if (weekDay === 'SEXTA') {
    weekDayNumber = 5
  }
  if (!dateInput || !numberOfDayCount) return false
  const dateValidation = new Date(dateInput);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  dateValidation.setHours(0, 0, 0, 0);
  dateValidation.setDate(dateValidation.getDate() + numberOfDayCount);
  dateValidation.setHours(0, 0, 0, 0);

  if (dateValidation.getTime() === today.getTime()) {
    return true
  }
  const dayOfWeek = today.getDay()
  if (dayOfWeek !== weekDayNumber) {
    return false
  }

  const sunday = new Date(today);
  sunday.setDate(today.getDate() + (weekDayNumber = 1 ? - 1 : + 2));
  sunday.setHours(0, 0, 0, 0);

  const saturday = new Date(today);
  saturday.setDate(today.getDate() + (weekDayNumber = 1 ? - 2 : + 1));
  saturday.setHours(0, 0, 0, 0);

  const isExpiredPlusDaysOnWeeked = (saturday.getTime() === dateValidation.getTime()) || (sunday.getTime() === dateValidation.getTime())
  return isExpiredPlusDaysOnWeeked

}

export function isTodayOrWeekendBefore(dateInput: string | Date): boolean {
  if (!dateInput) return false
  const createdDate = new Date(dateInput);
  const today = new Date();

  // Normaliza todas as datas (zera horas)
  createdDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // Se for o mesmo dia
  if (createdDate.getTime() === today.getTime()) {
    return true;
  }

  const day = today.getDay()
  if (day !== 1) {
    return false;
  }
  // Cria datas para sábado e domingo anteriores
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  twoDaysAgo.setHours(0, 0, 0, 0);

  // Verifica se ontem foi fim de semana e se a data criada foi ontem ou anteontem
  const wasWeekend = (createdDate.getTime() === yesterday.getTime() ||
    createdDate.getTime() === twoDaysAgo.getTime());

  return wasWeekend;
}

export function isDueTodayOrNextWeekend(dateInput: string): boolean {
  if (!dateInput) return false
  const createdDate = new Date(dateInput);
  const today = new Date();

  // Normaliza todas as datas (zera horas)
  createdDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // Se for o mesmo dia
  if (createdDate.getTime() === today.getTime()) {
    return true;
  }

  const day = today.getDay(); // 0 = Sunday, 6 = Saturday

  if (day !== 5) {
    return false
  }
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + 1);
  saturday.setHours(0, 0, 0, 0);
  const sunday = new Date(today);
  sunday.setDate(today.getDate() + 2);
  sunday.setHours(0, 0, 0, 0);

  const isNextWeekend = (createdDate.getTime() === sunday.getTime() ||
    createdDate.getTime() === saturday.getTime())

  return isNextWeekend;
}

export function actualAndPreviousMonth(): string[] {
  const today = new Date();

  const currentMonth = getYearMonth(today);

  // Get previous month (adjusting for year rollover)

  const previousMonthDateBefore = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  const previousMonthBefore = getYearMonth(previousMonthDateBefore)
  const previousMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const previousMonth = getYearMonth(previousMonthDate);

  return [previousMonthBefore, previousMonth, currentMonth];
}

export function formatDateToDDMMYYYY(dateString: string | null): string | null {
  if (!dateString) return null;

  const date = new Date(dateString);

  // Garante que seja uma data válida
  if (isNaN(date.getTime())) {
    return null
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}



