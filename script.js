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

/* Функция загрузки на imgBB */
async function uploadToImgBB(dataUrl) {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  const formData = new URLSearchParams();
  formData.append("image", base64);
  const apiKey = "efe2ee7dac2ce58757259bce5532966b";
  const endpoint = `https://api.imgbb.com/1/upload?key=${apiKey}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData.toString()
  });
  const result = await response.json();
  if (result.success) {
    return result.data.url;
  } else {
    throw new Error(result.error ? result.error.message : "Ошибка загрузки на imgBB");
  }
}

/* Функция сохранения: генерирует изображение 1000x1000, инициирует скачивание и открывает модальное окно с dataURL */
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
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = `avatar_${Date.now()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showModal(dataUrl);
  } catch (error) {
    console.error('Ошибка при сохранении изображения:', error);
    alert('Ошибка при создании изображения. Проверьте настройки CORS или Mixed Content.');
  } finally {
    saveButton.textContent = 'Сохранить';
    saveButton.disabled = false;
    document.body.removeChild(tempContainer);
  }
}

/* Функция копирования URL: генерирует dataURL, загружает на imgBB для короткой ссылки и открывает модальное окно */
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
    let shortUrl;
    try {
      shortUrl = await uploadToImgBB(dataUrl);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shortUrl);
        alert("Короткая ссылка скопирована в буфер обмена!");
      }
    } catch (uploadError) {
      alert("Не удалось загрузить изображение на imgBB. Используется длинная ссылка.");
      shortUrl = dataUrl;
    }
    showModal(shortUrl);
  } catch (error) {
    console.error('Ошибка при копировании URL:', error);
    alert('Ошибка при создании изображения. Проверьте настройки CORS или Mixed Content.');
  } finally {
    copyButton.textContent = "Копировать URL";
    copyButton.disabled = false;
    document.body.removeChild(tempContainer);
  }
}

/* Функция показа модального окна с ссылкой и превью */
function showModal(link) {
  const modal = document.getElementById('modal-overlay');
  const modalLink = document.getElementById('modal-link');
  const modalImg = document.getElementById('modal-img');
  modalLink.value = link;
  modalImg.src = link;
  modal.style.display = 'flex';
}

/* Закрытие модального окна */
document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('modal-overlay').style.display = 'none';
});

/* Переключение темы */
document.getElementById('theme-toggle').addEventListener('click', () => {
  toggleTheme();
});
document.getElementById('theme-toggle-compact').addEventListener('click', () => {
  toggleTheme();
});
function toggleTheme() {
  const body = document.body;
  if (body.classList.contains('theme-dark')) {
    body.classList.remove('theme-dark');
    body.classList.add('theme-light');
    document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i> Тёмная тема';
    document.getElementById('theme-toggle-compact').innerHTML = '<i class="fas fa-moon"></i> Тёмная тема';
  } else {
    body.classList.remove('theme-light');
    body.classList.add('theme-dark');
    document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i> Светлая тема';
    document.getElementById('theme-toggle-compact').innerHTML = '<i class="fas fa-sun"></i> Светлая тема';
  }
}
