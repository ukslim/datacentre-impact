function wireDialog(dialogId: string, openBtnId: string, closeBtnId: string): void {
  const dialog = document.getElementById(dialogId);
  const openBtn = document.getElementById(openBtnId);
  const closeBtn = document.getElementById(closeBtnId);

  if (!dialog || !openBtn || !closeBtn) {
    throw new Error(`Dialog elements are missing for "${dialogId}"`);
  }

  const modal = dialog as HTMLDialogElement;

  openBtn.addEventListener('click', () => {
    modal.showModal();
  });

  closeBtn.addEventListener('click', () => {
    modal.close();
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.close();
    }
  });
}

export function initDialogs(): void {
  wireDialog('help-dialog', 'help-open-btn', 'help-close-btn');
  wireDialog('estimates-dialog', 'estimates-open-btn', 'estimates-close-btn');
}
