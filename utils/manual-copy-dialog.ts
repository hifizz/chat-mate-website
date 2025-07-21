  // 显示手动复制对话框
export  const showManualCopyDialog = (content:string) => {
    // 创建一个临时的文本区域供用户手动复制
    const textArea = document.createElement('textarea');
    textArea.value = content;
    textArea.style.position = 'fixed';
    textArea.style.left = '50%';
    textArea.style.top = '50%';
    textArea.style.transform = 'translate(-50%, -50%)';
    textArea.style.width = '80%';
    textArea.style.height = '60%';
    textArea.style.zIndex = '9999';
    textArea.style.backgroundColor = 'white';
    textArea.style.border = '2px solid #ccc';
    textArea.style.borderRadius = '8px';
    textArea.style.padding = '16px';
    textArea.setAttribute('readonly', 'true');

    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '关闭';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '8px';
    closeButton.style.right = '8px';
    closeButton.style.padding = '4px 8px';
    closeButton.style.backgroundColor = '#f0f0f0';
    closeButton.style.border = '1px solid #ccc';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    container.style.zIndex = '9998';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';

    const dialog = document.createElement('div');
    dialog.style.position = 'relative';
    dialog.style.backgroundColor = 'white';
    dialog.style.borderRadius = '8px';
    dialog.style.padding = '16px';
    dialog.style.width = '80%';
    dialog.style.maxWidth = '600px';
    dialog.style.maxHeight = '80%';

    const title = document.createElement('h3');
    title.textContent = '请手动复制以下内容：';
    title.style.marginBottom = '12px';
    title.style.fontSize = '16px';
    title.style.fontWeight = 'bold';

    dialog.appendChild(title);
    dialog.appendChild(textArea);
    dialog.appendChild(closeButton);
    container.appendChild(dialog);

    // 关闭对话框
    const closeDialog = () => {
      document.body.removeChild(container);
    };

    closeButton.onclick = closeDialog;
    container.onclick = (e) => {
      if (e.target === container) {
        closeDialog();
      }
    };

    // 选中文本
    textArea.focus();
    textArea.select();

    document.body.appendChild(container);
  };