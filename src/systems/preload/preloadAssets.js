export function preloadAssets(onProgress) {
  const tasks = [
    () =>
      new Promise((resolve) => {
        if (!document.fonts?.ready) {
          resolve();
          return;
        }

        document.fonts.ready.finally(resolve);
      }),
    () =>
      new Promise((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(resolve);
        });
      }),
  ];

  let completed = 0;

  const markProgress = () => {
    completed += 1;
    onProgress(completed / tasks.length);
  };

  return Promise.all(tasks.map((task) => task().finally(markProgress)));
}
