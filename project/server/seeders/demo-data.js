// Idempotent demo seed for the thesis project.
//
// Usage:
//   node seeders/demo-data.js          (from the server/ directory)
//   node server/seeders/demo-data.js   (from the repository root)
//
// What it does:
//   1. Ensures 5 categories exist (matched by slug)
//   2. Ensures 6 events exist (matched by title)
//   3. Ensures 5 news posts exist (matched by title)
//   4. For the "filled" olympiad event: creates 30 demo seat-holder users
//      (matched by email) and 30 watchlist rows so the event reads as full
//      ("Мест нет" badge in the UI) — there is no counter column on the
//      events table, the count is computed from watchlist rows.
//
// Idempotency is achieved with `findOrCreate` keyed by unique columns.
// Categories are attached only on first creation so that manual reassignments
// in the admin UI are preserved on subsequent runs.

require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('../db');
const {
  Category, EventPost, NewsPost, User, Watchlist,
} = require('../models/models');
const { ROLES } = require('../constants/roles');

const stats = {
  categories: { created: 0, skipped: 0 },
  events: { created: 0, skipped: 0 },
  news: { created: 0, skipped: 0 },
  demoSeatUsers: { created: 0, skipped: 0 },
  demoSeatRows: { created: 0, skipped: 0 },
};

// ---- Date helpers ---------------------------------------------------------
const NOW = new Date();
const inDays = (delta) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + delta);
  return d;
};

// ---- Categories -----------------------------------------------------------
const CATEGORIES = [
  { name: 'Конференции', slug: 'conferences' },
  { name: 'Хакатоны', slug: 'hackathons' },
  { name: 'Олимпиады', slug: 'olympiads' },
  { name: 'Университетские новости', slug: 'university-news' },
  { name: 'Наука', slug: 'science' },
];

async function seedCategories() {
  const idBySlug = {};
  for (const c of CATEGORIES) {
    const [row, created] = await Category.findOrCreate({
      where: { slug: c.slug },
      defaults: { name: c.name, slug: c.slug },
    });
    idBySlug[c.slug] = row.id;
    stats.categories[created ? 'created' : 'skipped']++;
  }
  return idBySlug;
}

// ---- Events ---------------------------------------------------------------
function eventList() {
  return [
    {
      title: 'Хакатон КубГУ 2025',
      description: '48-часовой хакатон по разработке мобильных приложений. Призовой фонд 150 000 руб.',
      starts: inDays(14),
      place: 'Главный корпус КубГУ, ауд. 215',
      registration_required: true,
      max_participants: 50,
      latitude: 45.0355,
      longitude: 38.9739,
      categorySlug: 'hackathons',
    },
    {
      title: 'Научная конференция молодых учёных',
      description: 'Ежегодная конференция. Приём докладов до 10 числа текущего месяца.',
      starts: inDays(21),
      place: 'Актовый зал, корпус А',
      registration_required: true,
      max_participants: 120,
      latitude: 45.036,
      longitude: 38.975,
      categorySlug: 'conferences',
    },
    {
      title: 'Олимпиада по программированию',
      description: 'Соревнование по алгоритмическим задачам. Языки: C++, Python, Java.',
      starts: inDays(7),
      place: 'Компьютерный класс 304, корпус Б',
      registration_required: true,
      max_participants: 30,
      latitude: 45.0348,
      longitude: 38.9728,
      categorySlug: 'olympiads',
      preFillSeats: 30, // demo: every seat taken → "Мест нет"
    },
    {
      title: 'День открытых дверей факультета ИТ',
      description: 'Приходите узнать о направлениях подготовки и поговорить с преподавателями.',
      starts: inDays(5),
      place: 'Фойе главного корпуса',
      registration_required: false,
      max_participants: null,
      latitude: 45.0355,
      longitude: 38.9739,
      categorySlug: 'university-news',
    },
    {
      title: 'Воркшоп по машинному обучению',
      description: 'Практическое занятие по обучению нейронных сетей на реальных данных.',
      starts: inDays(10),
      place: null,
      registration_required: true,
      max_participants: 20,
      latitude: 45.0362,
      longitude: 38.9755,
      categorySlug: 'science',
    },
    {
      title: 'Межвузовский турнир по киберспорту',
      description: 'Турнир по Dota 2 и CS2 среди студентов вузов Краснодарского края.',
      starts: inDays(28),
      place: null,
      registration_required: true,
      max_participants: 64,
      latitude: null,
      longitude: null,
      categorySlug: 'hackathons',
    },
  ];
}

async function seedEvents(categoryIdBySlug, ownerUserId) {
  for (const e of eventList()) {
    // NOTE: the EventPost model does NOT declare a belongsTo(User) author
    // association (Stage 1 only set up Watchlist as User↔EventPost link).
    // findOrCreate strips unknown attributes from defaults, so passing
    // userId here would just emit a warning and stay null. The existing
    // event-create flow in the controller has the same nullable-author
    // behaviour, so we keep events author-less here.
    const [row, created] = await EventPost.findOrCreate({
      where: { title: e.title },
      defaults: {
        title: e.title,
        description: e.description,
        starts: e.starts,
        place: e.place,
        status: 'Опубликован',
        registration_required: e.registration_required,
        max_participants: e.max_participants,
        latitude: e.latitude,
        longitude: e.longitude,
      },
    });

    if (created) {
      stats.events.created++;
      // Categories are attached only on first creation so that manual
      // re-assignments by editors are preserved on subsequent seed runs.
      const catId = categoryIdBySlug[e.categorySlug];
      if (catId) {
        await row.setCategories([catId]);
      }
    } else {
      stats.events.skipped++;
    }

    // Demo seat-holders are filled regardless of create/skip — the inner
    // findOrCreate calls handle their own idempotency.
    if (e.preFillSeats) {
      await fillDemoSeats(row.id, e.preFillSeats);
    }
  }
}

async function fillDemoSeats(eventpostId, count) {
  // Single bcrypt hash is reused for all demo users — saves ~30 hashing
  // rounds on the first run.
  const hashed = await bcrypt.hash('seed-demo-password', 5);
  for (let i = 1; i <= count; i++) {
    const email = `seat-demo-${i}@seed.local`;
    const [u, userCreated] = await User.findOrCreate({
      where: { email },
      defaults: {
        email,
        username: `seat-demo-${i}`,
        password: hashed,
        role: ROLES.USER,
      },
    });
    stats.demoSeatUsers[userCreated ? 'created' : 'skipped']++;

    const [, rowCreated] = await Watchlist.findOrCreate({
      where: { userId: u.id, eventpostId },
      defaults: {
        userId: u.id,
        eventpostId,
        notified: false,
        is_attended: false,
        registered_at: NOW,
      },
    });
    stats.demoSeatRows[rowCreated ? 'created' : 'skipped']++;
  }
}

// ---- News -----------------------------------------------------------------
const NEWS = [
  {
    title: 'КубГУ вошёл в топ-50 российских университетов',
    description:
      'В новом рейтинге наш университет поднялся на 12 строк и занял 47 место. ' +
      'Это результат планомерной работы над научной деятельностью, привлечения молодых преподавателей ' +
      'и расширения международных программ. Поздравляем коллектив!',
    daysAgo: 3,
    categorySlug: 'university-news',
  },
  {
    title: 'Открыт приём заявок на грант для молодых исследователей',
    description:
      'Фонд выделяет до 500 000 рублей на индивидуальный проект. Подать заявку могут аспиранты ' +
      'и кандидаты наук в возрасте до 35 лет. Дедлайн — 15 июля. Подробности на сайте управления научной работы.',
    daysAgo: 5,
    categorySlug: 'science',
  },
  {
    title: 'Студенты ФИТ заняли первое место на всероссийском хакатоне',
    description:
      'На хакатоне «AI Sprint 2026» команда «Кубфаст» представила проект Aurora — голосового ассистента ' +
      'для слабовидящих. Жюри отметило высокое качество кода и социальную значимость работы.',
    daysAgo: 7,
    categorySlug: 'hackathons',
  },
  {
    title: 'Новый курс по искусственному интеллекту с осеннего семестра',
    description:
      'С 1 сентября в программу 3 курса бакалавриата ФИТ войдёт обязательный модуль «Введение в современный AI». ' +
      'Преподаватель — Иван Петров, к.т.н. Программа включает основы машинного обучения, работу с трансформерами и этику AI.',
    daysAgo: 14,
    categorySlug: 'university-news',
  },
  {
    title: 'Результаты весенней олимпиады по математике',
    description:
      'Победителем стала Анна Сидорова (МиИТ-2), второе и третье места заняли Дмитрий Гончаров и Мария Лебедева. ' +
      'Все призёры приглашены на финальный этап во Владимир в мае.',
    daysAgo: 21,
    categorySlug: 'olympiads',
  },
];

async function seedNews(categoryIdBySlug, ownerUserId) {
  for (const n of NEWS) {
    const date = inDays(-n.daysAgo);
    const [row, created] = await NewsPost.findOrCreate({
      where: { title: n.title },
      defaults: {
        title: n.title,
        description: n.description,
        last_updated: date,
        userId: ownerUserId,
      },
    });

    if (created) {
      stats.news.created++;
      const catId = categoryIdBySlug[n.categorySlug];
      if (catId) {
        await row.setCategories([catId]);
      }
    } else {
      stats.news.skipped++;
    }
  }
}

// ---- Owner of seeded content ---------------------------------------------
async function pickOwnerId() {
  // Prefer the first existing ADMIN as content author. Fall back to any
  // user if no ADMIN exists yet. Refuse to seed against an empty users
  // table — the FK on eventposts.userId/newsposts.userId would fail.
  const admin = await User.findOne({ where: { role: ROLES.ADMIN } });
  if (admin) return admin.id;
  const anyUser = await User.findOne({ where: { email: { [require('sequelize').Op.notLike]: 'seat-demo-%' } } });
  if (anyUser) {
    console.warn(`[seed] No ADMIN found — content will be owned by user #${anyUser.id} (${anyUser.email}).`);
    return anyUser.id;
  }
  throw new Error('Database has no real users — register at least one user (preferably ADMIN) first.');
}

async function main() {
  await sequelize.authenticate();
  const ownerId = await pickOwnerId();

  const categoryIdBySlug = await seedCategories();
  await seedEvents(categoryIdBySlug, ownerId);
  await seedNews(categoryIdBySlug, ownerId);

  console.log('\n=== Seed summary ===');
  console.log(`Categories:      created ${stats.categories.created}, skipped ${stats.categories.skipped}`);
  console.log(`Events:          created ${stats.events.created}, skipped ${stats.events.skipped}`);
  console.log(`News:            created ${stats.news.created}, skipped ${stats.news.skipped}`);
  console.log(`Demo seat users: created ${stats.demoSeatUsers.created}, skipped ${stats.demoSeatUsers.skipped}`);
  console.log(`Demo seat rows:  created ${stats.demoSeatRows.created}, skipped ${stats.demoSeatRows.skipped}`);
  console.log('====================\n');
}

main()
  .then(() => sequelize.close())
  .catch((e) => {
    console.error('Seed failed:', e.message);
    if (process.env.DEBUG) console.error(e.stack);
    process.exit(1);
  });
