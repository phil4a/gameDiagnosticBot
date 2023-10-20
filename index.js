const TelegramBot = require('node-telegram-bot-api');
const token = '6934682720:AAFGX4zxJBwUcz07tuGSVTKhN6jgH76k1ss'; // Замените на свой API-токен

// Варианты сообщений с описаниями
const messages = [
	{
		text: 'Вы всегда помогаете (даже если не просят). Тусуетесь в чужих жизнях, не думаете о себе.',
		description:
			"Нам часто кажется, что помогать другим - наша святая обязанность, особенно когда речь идет о родителях, родственниках, близких людях. Помогать из состояния 'я должен' довольно тяжело. А что, если попробовать оказывать помощь из состояния 'Я могу сейчас помочь - я помогаю или Я могу помочь ровно столько сейчас'? А помогают ли вам? Как это происходит - вы просите или ждете помощи молча? Объемная тема для исследования, предлагаю поразмышлять.",
	},
	{
		text: 'Вы давно не отдыхали, накопили хроническую усталость.',
		description:
			'В обществе гораздо лояльнее относятся к тому, кто с утра до вечера работает. А вот если ты в отпуске да еще и не раз в год или в три - ну всё, значит с тобой что-то не так. Люди четко понимают, что надо зарабатывать деньги чтобы была еда, жилье, одежда и т.д., но зачастую люди не понимают, что без отдыха они теряют свою продуктивность и порой не замечают, как даже любимое дело приводит их к разочарованию и выгоранию.',
	},
	{
		text: 'Очень много думаете, но мало делаете.',
		description:
			'Привет всем вечным студентам и тем, кто бесконечно собирает теорию, но так и не переходит к практике, к тем самым действиям. Нам никогда не узнать - сработает ли тот или иной инструмент, если не попробовать. Самые лучшие результаты тогда, когда знания подкрепляются действием. Узнал-сделал, узнал-сделал и т.д.',
	},
];

// Состояния бота
const states = {};

// Инициализируем бота
const bot = new TelegramBot(token, { polling: true });

// Отслеживаем команду /start
bot.onText(/\/start/, (msg) => {
	const chatId = msg.chat.id;
	const userId = msg.from.id;

	// Если нет состояния для пользователя, устанавливаем начальное состояние
	if (!states[userId]) {
		states[userId] = 'start';
		const welcomeMessage =
			'Меня зовут Оксана Гаврилиди, я практикующий психолог. Более года я игротерапевт - тот самый человек, который ведет трансформационные игры с терапевтическим эффектом. В этом боте вы можете пройти короткую диагностику, которая позволит посмотреть на ваш запрос с помощью игры.';
		bot.sendMessage(chatId, welcomeMessage);

		// Отправляем второе сообщение через 1 секунду
		setTimeout(() => {
			const secondMessage =
				'Сформулируйте, пожалуйста, ваш запрос. Он может касаться любой сферы вашей жизни (отношения, доход, реализация, отдых и другие).';
			bot.sendMessage(chatId, secondMessage);
			// Переключаем состояние на ожидание новых сообщений
			states[userId] = 'waiting';
		}, 1000);
	} else {
		// Если пользователь уже начал диалог, игнорируем команду /start
		bot.sendMessage(chatId, 'Вы уже начали диалог. Пожалуйста, отправьте ваш запрос.');
	}
});

// Отслеживаем все остальные сообщения
bot.on('message', (msg) => {
	const userId = msg.from.id;

	if (states[userId] === 'waiting') {
		const chatId = msg.chat.id;

		// Получаем выбранный вариант ответа
		const selectedMessage = messages[Math.floor(Math.random() * messages.length)];

		// Формируем сообщение с кнопкой "ПОДРОБНЕЕ"
		const options = {
			reply_markup: {
				inline_keyboard: [[{ text: 'ПОДРОБНЕЕ', callback_data: 'description' }]],
			},
		};

		// Отправляем сообщение с кнопкой
		bot.sendMessage(chatId, selectedMessage.text, options);

		// Сохраняем выбранный вариант в состоянии
		states[userId] = 'description';

		// Сохраняем подробное описание в состоянии
		states[userId + '_description'] = selectedMessage.description;
	}
});

// Отслеживаем нажатие кнопки "ПОДРОБНЕЕ"
// Отслеживаем все остальные сообщения
bot.on('message', (msg) => {
	const userId = msg.from.id;

	if (states[userId] === 'waiting') {
		const chatId = msg.chat.id;

		// Получаем выбранный вариант ответа
		const selectedMessage = messages[Math.floor(Math.random() * messages.length)];

		// Формируем сообщение с кнопками "ПОДРОБНЕЕ" и "ДАЛЕЕ"
		const options = {
			reply_markup: {
				inline_keyboard: [
					[{ text: 'ПОДРОБНЕЕ', callback_data: 'description' }],
					[{ text: 'ДАЛЕЕ', callback_data: 'next' }],
				],
			},
		};

		// Отправляем сообщение с кнопками
		bot.sendMessage(chatId, selectedMessage.text, options);

		// Сохраняем выбранный вариант в состоянии
		states[userId] = 'description';

		// Сохраняем подробное описание в состоянии
		states[userId + '_description'] = selectedMessage.description;
	}
});

// Отслеживаем нажатие кнопок "ПОДРОБНЕЕ" и "ДАЛЕЕ"

bot.on('callback_query', (query) => {
	const userId = query.from.id;
	const chatId = query.message.chat.id;

	if (
		query.data === 'description' &&
		(states[userId] === 'description' || states[userId] === 'further')
	) {
		if (states[userId] === 'description') {
			// Получаем выбранный вариант ответа
			const selectedMessage = messages[Math.floor(Math.random() * messages.length)];

			// Формируем сообщение с кнопкой "ДАЛЕЕ"
			const options = {
				reply_markup: {
					inline_keyboard: [[{ text: 'ДАЛЕЕ', callback_data: 'further' }]],
				},
			};

			// Отправляем сообщение с подробным описанием и кнопкой "ДАЛЕЕ"
			bot.sendMessage(chatId, selectedMessage.description, options);

			// Сохраняем состояние "description" для последующего отслеживания нажатия "ДАЛЕЕ"
			states[userId] = 'description';
		} else if (states[userId] === 'further') {
			// Формируем сообщение "Узнать, какие ресурсы помогут мне решить мой запрос?" с кнопкой "ДА"
			const resourcesMessage = 'Узнать, какие ресурсы помогут мне решить мой запрос?';
			const options = {
				reply_markup: {
					inline_keyboard: [[{ text: 'ДА', callback_data: 'yes' }]],
				},
			};

			// Отправляем сообщение с этим вопросом и кнопкой "ДА"
			bot.sendMessage(chatId, resourcesMessage, options);

			// Закрываем инлайн-клавиатуру сразу после нажатия на кнопку "ДАЛЕЕ"
			bot.answerCallbackQuery(query.id);

			// Затем переключаем состояние на ожидание новых сообщений
			states[userId] = 'waiting';
		}
	} else if (query.data === 'further' && states[userId] === 'description') {
		// Формируем сообщение "Узнать, какие ресурсы помогут мне решить мой запрос?" с кнопкой "ДА"
		const resourcesMessage = 'Узнать, какие ресурсы помогут мне решить мой запрос?';
		const options = {
			reply_markup: {
				inline_keyboard: [[{ text: 'ДА', callback_data: 'yes' }]],
			},
		};

		// Отправляем сообщение с этим вопросом и кнопкой "ДА"
		bot.sendMessage(chatId, resourcesMessage, options);

		// Закрываем инлайн-клавиатуру сразу после нажатия на кнопку "ДАЛЕЕ"
		bot.answerCallbackQuery(query.id);

		// Затем переключаем состояние на ожидание новых сообщений
		states[userId] = 'waiting';
	}
});

// Отслеживаем нажатие кнопки "ДА"

// Отслеживаем нажатие кнопки "ДА"
bot.on('callback_query', (query) => {
	const userId = query.from.id;
	const chatId = query.message.chat.id;

	if (query.data === 'yes' && states[userId] === 'waiting') {
		// Генерируем два случайных индекса для выбора пунктов из списка
		const availableResources = [
			'ЗДОРОВЬЕ: к этому ресурсу можно отнести состояние и физического и ментального здоровья. Что с телом? Что с эмоциональным состоянием? Чего не хватает? ',
			'ВОЗМОЖНОСТИ: условия или обстоятельства, позволяющие сделать что-то',
			'ЭНЕРГИЯ: отвечает за то, чтобы ва могли справляться со всеми задачами, как ежедневными, так и направленными на будущее',
			'ДЕНЬГИ: самый понятный ресурс, не требующий объяснений',
			'ВРЕМЯ: невосполнимый ресурс, требующий к себе внимания - на что трачу, достаточно ли у меня времени или всегда острая нехватка? чем занято мое время?',
			'ПОМОЩЬ: умею ли просить о помощи? если не умею, что чувствую, справляясь самостоятельно со всеми задачами? умею ли  оказывать ее? из какого состояния я помогаю? ',
		];

		const selectedResources = [];
		while (selectedResources.length < 2) {
			const randomIndex = Math.floor(Math.random() * availableResources.length);
			const selectedResource = availableResources.splice(randomIndex, 1)[0];
			selectedResources.push(selectedResource);
		}

		// Формируем сообщение с выбранными ресурсами и кнопкой "Далее"
		const responseMessage =
			'Могут помочь:\n\n' + `1. ${selectedResources[0]}\n` + `2. ${selectedResources[1]}`;

		const options = {
			reply_markup: {
				inline_keyboard: [[{ text: 'Далее', callback_data: 'further_details' }]],
			},
		};

		// Отправляем сообщение с выбранными ресурсами, кнопкой "Далее" и кнопкой "Связаться"
		bot.sendMessage(chatId, responseMessage, options);

		// Затем переключаем состояние на ожидание новых сообщений
		states[userId] = 'waiting';
	}
	// Отслеживаем нажатие кнопки "Далее"
	// Отслеживаем нажатие кнопки "Далее"
	else if (query.data === 'further_details' && states[userId] === 'waiting') {
		// Формируем сообщение "Более подробно исследовать ваш запрос можно при помощи игры. чтобы узнать расписание ближайших игр"
		const detailsMessage =
			'Более подробно исследовать ваш запрос можно при помощи игры. Чтобы узнать расписание ближайших игр, свяжитесь с нами.';

		const options = {
			reply_markup: {
				inline_keyboard: [[{ text: 'Связаться', url: 'https://t.me/gavrilidi_art' }]],
			},
		};

		// Отправляем сообщение с информацией о игре и кнопкой "Связаться"
		bot.sendMessage(chatId, detailsMessage, options);

		// Затем переключаем состояние на ожидание новых сообщений
		states[userId] = 'waiting';
	}
});
