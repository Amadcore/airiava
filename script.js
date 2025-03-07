const parts = {
  face: { current: 1, max: 3 },
  eyes: { current: 1, max: 3 },
  hair: { current: 1, max: 3 },
  mouth: { current: 1, max: 3 },
  body: { current: 1, max: 3 }
};

function updatePart(part) {
  const img = document.getElementById(part);
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

/* Функция, которая генерирует итоговое изображение размером 1000x1000px */
async function generateImageDataURL() {
  const portrait = document.getElementById('portrait');
  // Создаем временный контейнер
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = '1000px';
  tempContainer.style.height = '1000px';
  tempContainer.style.backgroundColor = portrait.style.backgroundColor || '#000';
  tempContainer.style.overflow = 'hidden';

  // Клонируем слои с новыми размерами
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
      useCORS: true,
      backgroundColor: portrait.style.backgroundColor || '#000',
      width: 1000,
      height: 1000,
      scale: 1
    });
    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl;
  } finally {
    document.body.removeChild(tempContainer);
  }
}

/* Кнопка "Сохранить": открывает новое окно с изображением */
async function savePortrait() {
  const saveButton = document.querySelectorAll('.btn-action')[1];
  saveButton.textContent = 'Генерация...';
  saveButton.disabled = true;

  try {
    const dataUrl = await generateImageDataURL();
    window.open(dataUrl, '_blank');
    alert("Откройте новое окно и сохраните изображение через опции браузера.");
  } catch (error) {
    console.error('Ошибка генерации изображения:', error);
    alert('Ошибка при создании изображения.');
  } finally {
    saveButton.textContent = 'Сохранить';
    saveButton.disabled = false;
  }
}

/* Кнопка "Копировать URL": копирует dataURL в буфер обмена или открывает новое окно */
async function copyURL() {
  const copyButton = document.querySelectorAll('.btn-action')[2];
  copyButton.textContent = 'Генерация...';
  copyButton.disabled = true;

  try {
    const dataUrl = await generateImageDataURL();
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(dataUrl);
      alert("URL изображения скопирован в буфер обмена. Вы можете вставить его в браузере для сохранения.");
    } else {
      window.open(dataUrl, '_blank');
      alert("Откройте новое окно и сохраните изображение вручную.");
    }
  } catch (error) {
    console.error('Ошибка копирования URL:', error);
    alert('Ошибка при генерации URL изображения.');
  } finally {
    copyButton.textContent = 'Копировать URL';
    copyButton.disabled = false;
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
