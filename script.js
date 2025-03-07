const parts = {
  face: { current: 1, max: 3 },
  eyes: { current: 1, max: 3 },
  hair: { current: 1, max: 3 },
  mouth: { current: 1, max: 3 },
  body: { current: 1, max: 3 }
};

function updatePart(part) {
  const img = document.getElementById(part);
  // Если возникают CORS-ошибки, попробуйте добавить параметр ?timestamp
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

/* Сохранение: генерируем 1000x1000, пытаемся скачать и открыть новую страницу с dataURL */
async function savePortrait() {
  const saveButton = document.querySelectorAll('.btn-action')[1];
  saveButton.textContent = 'Генерация...';
  saveButton.disabled = true;

  const portrait = document.getElementById('portrait');
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = '1000px';
  tempContainer.style.height = '1000px';
  tempContainer.style.backgroundColor = portrait.style.backgroundColor || '#000';
  tempContainer.style.overflow = 'hidden';

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
      backgroundColor: portrait.style.backgroundColor || '#000',
      width: 1000,
      height: 1000,
      scale: 1
    });
    const dataUrl = canvas.toDataURL('image/png');

    // Пытаемся скачать
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = `avatar_${Date.now()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Пытаемся открыть новое окно с HTML-страницей
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <div style="padding:1rem; font-family: sans-serif;">
          <p>Скопируйте ссылку ниже и откройте её в браузере для сохранения изображения:</p>
          <textarea style="width:100%; height:80px;">${dataUrl}</textarea>
          <p>Предварительный просмотр:</p>
          <img src="${dataUrl}" style="max-width:100%; border:1px solid #ccc; border-radius:8px;">
        </div>
      `);
    } else {
      alert("Не удалось открыть новое окно. Скопируйте эту ссылку вручную:\n" + dataUrl);
    }
  } catch (error) {
    console.error('Ошибка при сохранении изображения:', error);
    alert('Ошибка при создании изображения. Проверьте настройки CORS или Mixed Content.');
  } finally {
    saveButton.textContent = 'Сохранить';
    saveButton.disabled = false;
    document.body.removeChild(tempContainer);
  }
}

/* Копировать URL: генерируем dataURL, пытаемся автокопировать и выводим в link-container */
async function copyURL() {
  const copyButton = document.querySelector('.btn-action[onclick="copyURL()"]');
  copyButton.textContent = 'Генерация...';
  copyButton.disabled = true;

  const portrait = document.getElementById('portrait');
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = '1000px';
  tempContainer.style.height = '1000px';
  tempContainer.style.backgroundColor = portrait.style.backgroundColor || '#000';
  tempContainer.style.overflow = 'hidden';

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
      backgroundColor: portrait.style.backgroundColor || '#000',
      width: 1000,
      height: 1000,
      scale: 1
    });
    const dataUrl = canvas.toDataURL('image/png');

    // Автокопирование (если доступно)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(dataUrl);
        alert("Ссылка на изображение скопирована в буфер обмена!");
      } catch (err) {
        console.warn("Автоматическое копирование не сработало:", err);
      }
    }

    // Выводим поле в .link-container
    const linkContainer = document.getElementById('link-container');
    linkContainer.innerHTML = ''; // очищаем старое

    // Создаем input (маленький, 100px)
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.readOnly = true;
    inputField.value = dataUrl;
    inputField.title = dataUrl; // полный URL по hover
    // Усечение текста
    inputField.style.width = '100px';
    inputField.style.whiteSpace = 'nowrap';
    inputField.style.overflow = 'hidden';
    inputField.style.textOverflow = 'ellipsis';
    // Двойной клик - выделяем
    inputField.addEventListener('dblclick', () => {
      inputField.select();
    });

    linkContainer.appendChild(inputField);
  } catch (error) {
    console.error('Ошибка при копировании URL:', error);
    alert('Ошибка при создании изображения. Проверьте настройки CORS или Mixed Content.');
  } finally {
    copyButton.textContent = 'Копировать URL';
    copyButton.disabled = false;
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
