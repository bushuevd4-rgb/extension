/**
 * panel.js
 * Загружает data.json с GitHub Pages и отображает информацию о персонаже.
 */

// ─── 1. Укажите URL вашего data.json на GitHub Pages ───
//    Формат: https://<username>.github.io/<repo>/<path>/data.json
//    Для вашего репозитория это будет примерно так:
const DATA_URL = "https://bushuevd4-rgb.github.io/extension/data.json";

// ─── 2. Ссылки на DOM-элементы ───
const statusEl = document.getElementById("status");
const cardEl = document.getElementById("character-card");
const avatarEl = document.getElementById("avatar");
const nameEl = document.getElementById("name");
const classEl = document.getElementById("class");
const mplusEl = document.getElementById("mplus-score");
const raidProgressTextEl = document.getElementById("raid-progress-text");
const raidNameEl = document.getElementById("raid-name");
const raidPercentEl = document.getElementById("raid-percent");
const progressFillEl = document.getElementById("progress-fill");

/**
 * Безопасно устанавливает текстовое содержимое элемента.
 * Используем textContent, а не innerHTML, чтобы избежать XSS.
 */
function setText(el, value) {
  if (el) {
    el.textContent = value ?? "—";
  }
}

/**
 * Основная функция загрузки данных.
 */
async function loadCharacterData() {
  try {
    // ─── 3. Fetch-запрос к JSON-файлу на GitHub Pages ───
    const response = await fetch(DATA_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Парсим JSON
    const data = await response.json();

    // ─── 4. Валидация структуры (защита от неожиданного формата) ───
    if (!data || typeof data !== "object" || !data.character) {
      throw new Error("Некорректная структура data.json");
    }

    const { character, mythic_plus, raid } = data;

    // ─── 5. Заполняем карточку ───
    //    Все значения экранируются через textContent.
    setText(nameEl, character.name);
    setText(classEl, character.class);

    if (character.avatar_url) {
      avatarEl.src = character.avatar_url;
    } else {
      avatarEl.style.display = "none";
    }

    // Мифик+ рейтинг
    setText(mplusEl, mythic_plus?.score?.toFixed(0) ?? "—");

    // Прогресс рейда
    if (raid) {
      setText(raidNameEl, raid.name ?? "Рейд");
      setText(
        raidProgressTextEl,
        `${raid.killed ?? 0}/${raid.total ?? 0}`
      );

      const percent =
        raid.total > 0
          ? Math.round((raid.killed / raid.total) * 100)
          : 0;

      setText(raidPercentEl, `${percent}%`);
      progressFillEl.style.width = `${percent}%`;
    }

    // ─── 6. Показываем карточку, скрываем статус ───
    statusEl.classList.add("hidden");
    cardEl.classList.remove("hidden");
  } catch (error) {
    console.error("[Panel Extension] Ошибка загрузки:", error);

    // Показываем сообщение об ошибке
    statusEl.textContent = "Не удалось загрузить данные 😕";
    statusEl.classList.add("error");
  }
}

// ─── 7. Запуск при готовности DOM ───
document.addEventListener("DOMContentLoaded", loadCharacterData);
