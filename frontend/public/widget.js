(function () {
  // Create chat button
  const button = document.createElement("div");
  button.innerHTML = "💬";
  button.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    background: #2563eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 24px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    transition: transform 0.2s;
  `;

  button.onmouseenter = () => (button.style.transform = "scale(1.1)");
  button.onmouseleave = () => (button.style.transform = "scale(1)");

  // Create iframe
  const iframe = document.createElement("iframe");
  iframe.src = "https://ai-lead-system-pvc7.vercel.app/chat";
  iframe.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 24px;
    width: 400px;
    height: 550px;
    border: none;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 9998;
    display: none;
  `;

  let isOpen = false;

  button.onclick = () => {
    isOpen = !isOpen;
    iframe.style.display = isOpen ? "block" : "none";
    button.innerHTML = isOpen ? "✕" : "💬";
  };

  document.body.appendChild(iframe);
  document.body.appendChild(button);
})();