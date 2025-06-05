import { getPermalink, getAsset } from './utils/permalinks';

export const headerData = {

  links: [
    {
        text: 'Início',
        href: getPermalink(''),
      },
    {
      text: 'Sobre',
      links: [
        {
          text: 'Grupo',
          href: getPermalink('grupo#grupo'),
        },
        {
            text: 'Linhas de pesquisa',
            href: getPermalink('grupo#linhas'),
          },
        {
          text:  'Equipe',
          href: getPermalink('grupo#quem'),
        },
    ],
    },
    {
      text: 'Pesquisa',
      links: [
        {
            text: 'Projetos',
            href: getPermalink('projetos'),
          },
      ],
    },
    {
      text: 'Publicações',
      links: [
        {
          text: 'Artigos',
          href: getPermalink('publicacoes#artigos'),
        },
        {
          text: 'Working papers',
          href: getPermalink('publicacoes#papers'),
        },
        {
         text: 'Livros e capítulos',
         href: getPermalink('publicacoes#livros'),
        },
        {
        text: 'Na imprensa',
        href: getPermalink('publicacoes#imprensa'),
        },
      ],
    },
    {
      text: 'Utilidades',
      links: [
        {
          text: 'Ferramentas',
          href: getPermalink('ferramentas'),
        },
        {
          text: 'mape_municipios',
          href: getPermalink('dados'),
        },
      ],
    },
    {
        text: 'Blog',
        href: getPermalink('blog'),
      },
    {
      text: 'Contato',
      href: getPermalink('contato'),
    },
  ],
  actions: [
    { icon: 'tabler:brand-instagram', href: 'https://instagram.com/'},
    { icon: 'tabler:brand-x', href: 'https://x.com' },
    ],
};

export const footerData = {
    links: [
        {
          title: 'Pesquisa',
          links: [
            { text: 'Projetos', href: getPermalink('projetos') },
            { text: 'Publicações', href: getPermalink('publicacoes') },
            { text: 'Notas na imprensa', href: getPermalink('publicacoes#imprensa') },
          ],
        },
        {
            title: 'Utilidades',
            links: [
              { text: 'Ferramentas', href: getPermalink('ferramentas')},
              { text: 'Dados', href: getPermalink('dados')},
            ],
          },
        {
          title: 'Sobre',
          links: [
            { text: 'Quem somos', href: getPermalink('grupo#grupo') },
            { text: 'Atuação', href: getPermalink('grupo#linhas') },
            { text: 'Equipe', href: getPermalink('grupo#equipe') },
            { text: 'Contato', href: getPermalink('contato') },
          ],
        },
        {
            title: 'Institucional',
            links: [
              { text: 'UERJ', href: 'https://www.uerj.br/' },
              { text: 'IESP-UERJ', href: 'https://www.iesp.uerj.br/' },
              { text: 'CNPq', href: '#' },
            ],
          },
    ],
    socialLinks: [
        { ariaLabel: 'X', icon: 'tabler:brand-x', href: 'https://twitter.com/mape_iesp' },
        { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'http://instagram.com/mape.iesp' },
        { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
      ],
      footNote: `<p class="text-sm text-muted dark:text-gray-900">@2024 MAPE com base em <a class="underline dark:text-muted" href="https://onwidget.com/">onWidget</a>·</p>`,
};
