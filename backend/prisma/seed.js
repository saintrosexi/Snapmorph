const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const templates = [
    {
      slug: 'hh-ru-pro',
      title: 'Анкета HH.ru',
      category: 'Полезное',
      previewBeforeUrl: '',
      previewAfterUrl: '/templates/hh_ru.png',
      basePrompt: 'A high-quality, professional business portrait for a resume. Neutral studio background, professional attire, sharp focus.',
      instantIdConfig: {},
    },
    {
      slug: 'cyberpunk-2077',
      title: 'Cyberpunk 2077',
      category: 'Веселье',
      previewBeforeUrl: '',
      previewAfterUrl: '/templates/cyberpunk.png',
      basePrompt: 'A cinematic cyberpunk style portrait. Neon lights, futuristic fashion, high detail, volumetric lighting.',
      instantIdConfig: {},
    },
    {
      slug: 'gta-vi-style',
      title: 'GTA VI Style',
      category: 'В тренде',
      previewBeforeUrl: '',
      previewAfterUrl: '/templates/gta_vi.png',
      basePrompt: 'A person in the style of GTA VI promotional art. Saturated colors, comic-book shading, Vice City background.',
      instantIdConfig: {},
    }
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
