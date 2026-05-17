insert into gennyoon.categories (id, name, slug) values
  ('e4d8cfde-dd37-46b3-9f7a-96ff5070ed73', 'AI 개발',  'ai-dev'),
  ('ec3d323e-37ea-42f9-966e-c6122ddada24', '노마드',   'nomad'),
  ('79dbd5f0-0dc5-45e7-b3b1-2c9092ff5a2e', '비즈니스', 'business'),
  ('1c135a02-5acf-4da4-9173-15382bdbe5b0', '에세이',   'essay')
on conflict (id) do update
  set name = excluded.name,
      slug = excluded.slug;
