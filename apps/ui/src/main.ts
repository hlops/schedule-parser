import { mount } from 'svelte';
import App from './App.svelte';
import './global.css';

const target = document.getElementById('app');

if (!target) {
	throw new Error('Не найден контейнер #app');
}

const app = mount(App, { target });

export default app;
