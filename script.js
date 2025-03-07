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

async function sharePortrait() {
  const portrait = document.getElementById('portrait');
  const shareButton = document.querySelector('.btn-action[onclick="sharePortrait()"]');
  shareButton.textContent = 'Генерация...';
  shareButton.disabled = true;

  // Создаем временный контейнер 1000x1000
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = '1000px';
  tempContainer.style.height = '1000px';
  tempContainer.style.backgroundColor = portrait.style.backgroundColor || '#000';
  tempContainer.style.overflow = 'hidden';

  // Клонируем слои (img) с размерами 1000x1000
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
    document.body.removeChild(tempContainer);
    
    // Если Web Share API поддерживает файлы, пробуем поделиться файлом
    if (navigator.canShare && navigator.canShare({ files: [] })) {
      // Преобразуем dataURL в File
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'avatar.png', { type: 'image/png' });
      
      try {
        await navigator.share({
          title: 'Airicore Avatar Forge',
          text: 'Смотри мой аватар!',
          files: [file]
        });
      } catch (shareError) {
        console.error('Ошибка при шаринге:', shareError);
        alert('Ошибка при попытке поделиться.');
      }
    } else if (navigator.clipboard) {
      // Если нет поддержки share, копируем data URL в буфер обмена
      await navigator.clipboard.writeText(dataUrl);
      alert('URL изображения скопирован в буфер обмена. Откройте его в браузере для сохранения.');
    } else {
      // Если ничего не сработало, открываем новое окно
      window.open(dataUrl, '_blank');
      alert('Откройте новое окно и сохраните изображение.');
    }
  } catch (error) {
    console.error('Ошибка при генерации изображения для шаринга:', error);
    alert('Ошибка при создании изображения.');
  } finally {
    shareButton.textContent = 'Поделиться';
    shareButton.disabled = false;
  }
}
