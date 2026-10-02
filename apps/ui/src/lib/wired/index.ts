/**
 * Wired Elements — набор веб-компонентов с «рукописным» видом.
 *
 * Импорты выполняются ради побочного эффекта: они регистрируют кастомные
 * элементы в `customElements`. Список нужно импортировать до `mount()` —
 * иначе Svelte не найдёт сеттеры на прототипах и выставит свойства
 * как атрибуты, а сами элементы останутся незарегистрированными.
 *
 * Здесь перечислены только используемые элементы, чтобы не тянуть в бандл
 * весь набор библиотеки.
 */
import 'wired-elements/lib/wired-card.js';
import 'wired-elements/lib/wired-divider.js';
import 'wired-elements/lib/wired-item.js';
import 'wired-elements/lib/wired-checkbox.js';
import 'wired-elements/lib/wired-icon-button.js';
