export const debounce = (func: (...args: any[]) => void, ms: number) => {
  let timerId: number | undefined;

  return (...args: any[]) => {
    if (timerId) {
      clearInterval(timerId);
    }

    timerId = window.setTimeout(() => func(...args), ms);
  };
};
