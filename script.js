const parts = {
  face: { current: 1, max: 3 },
  eyes: { current: 1, max: 3 },
  hair: { current: 1, max: 3 },
  mouth: { current: 1, max: 3 },
  body: { current: 1, max: 3 }
};

function updatePart(part) {
  const img = document.getElementById(part);
  // Если возникают CORS-ошибки, уберите crossOrigin="anonymous" и useCORS:true
  // img.src = `assets/${part}/${part}${parts[part].current}.png?${Date.now()}`; // Можно добавить ? для кэширования
  img.src = `assets/${part}/${part}${parts[part].current}.png`;
  img.alt = `${part} ${parts[part].current}`;
  img.classList.add('animate-fade-in');
  setTimeout(() => img.classList.remove('animate-fade-in'), 500);
}

function prevPart(part) {
  parts[part].current = (parts[part].current - 1) || parts[part].max;
  updatePart(part);
}

function nextPart(part) {
  parts[part].current = (parts[part].current % parts[part].max) + 1;
  updatePart(part);
}

function changeBgColor(color) {
  document.getElementById('portrait').style.backgroundColor = color;
}

function randomizeAvatar() {
  for (let part in parts) {
    parts[part].current = Math.floor(Math.random() * parts[part].max) + 1;
    updatePart(part);
  }
  const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
  changeBgColor(randomColor);
  const colorInput = document.querySelector('.color-picker');
  if (colorInput) {
    colorInput.value = randomColor;
  }
}

/* Генерируем 1000x1000 картинку и открываем её в новом окне */
async function savePortrait() {
  const saveButton = document.querySelectorAll('.btn-action')[1];
  saveButton.textContent = 'Генерация...';
  saveButton.disabled = true;

  const portrait = document.getElementById('portrait');

  // Временный контейнер
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = '1000px';
  tempContainer.style.height = '1000px';
  tempContainer.style.backgroundColor = portrait.style.backgroundColor || '#000';
  tempContainer.style.overflow = 'hidden';

  // Копируем слои
  const images = portrait.querySelectorAll('img');
  images.forEach(img => {
    const clone = img.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.width = '1000px';
    clone.style.height = '1000px';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.objectFit = 'cover';
    tempContainer.appendChild(clone);
  });

  document.body.appendChild(tempContainer);

  try {
    const canvas = await html2canvas(tempContainer, {
      // useCORS: true, // Если возникают проблемы, попробуйте отключить
      backgroundColor: portrait.style.backgroundColor || '#000',
      width: 1000,
      height: 1000,
      scale: 1
    });
    const dataUrl = canvas.toDataURL('image/png');
    window.open(dataUrl, '_blank');
    alert("Откройте новое окно и сохраните изображение через стандартное меню.");
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    alert('Ошибка при создании изображения. Проверьте CORS / Mixed Content.');
  } finally {
    saveButton.textContent = 'Сохранить';
    saveButton.disabled = false;
    document.body.removeChild(tempContainer);
  }
}

/* Переключение темы */
document.getElementById('theme-toggle').addEventListener('click', () => {
  const body = document.body;
  if (body.classList.contains('theme-dark')) {
    body.classList.remove('theme-dark');
    body.classList.add('theme-light');
    document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i> Тёмная тема';
  } else {
    body.classList.remove('theme-light');
    body.classList.add('theme-dark');
    document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i> Светлая тема';
  }
});
