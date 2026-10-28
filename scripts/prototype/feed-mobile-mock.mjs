// Backend falso para o spike do feed mobile: todos os dados são fictícios.
import http from "node:http";

const ago = (min) => new Date(Date.now() - min * 60_000).toISOString();

const me = {
  id: "u-demo",
  username: "pessoa-demo",
  name: "Pessoa Demo",
  headline: "Conta fictícia",
  email: "demo@example.invalid",
  company: null,
  location: null,
  avatar: null,
  banner: null,
  badge: null,
  bio: null,
  skills: [],
  goals: [],
  availability: null,
  portfolio: null,
  externalLinks: [],
  openToWork: false,
  isMentor: false,
};

const badge = (fill, glyph) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
<circle cx="16" cy="16" r="16" fill="${fill}"/><text x="16" y="22" font-size="16" text-anchor="middle" fill="#fff" font-family="Arial">${glyph}</text></svg>`;
const badges = {
  b1: badge("#111", "K"),
  b2: badge("#e76f00", "J"),
  b3: badge("#d62828", "♥"),
  b4: badge("#f4d35e", "◔"),
  b5: badge("#5bcefa", "✦"),
};

const img = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700">
<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#3a0ca3"/><stop offset="1" stop-color="#4cc9f0"/></linearGradient></defs>
<rect width="1200" height="700" fill="url(#g)"/><text x="600" y="370" font-size="64" text-anchor="middle" fill="#fff" font-family="Arial">print fictício do projeto</text></svg>`;

const base = {
  authorAvatar: null,
  tags: [],
  mediaIds: [],
  visibility: "PUBLIC",
  status: "ACTIVE",
  reactionSummary: {},
  counters: { reactions: 0, comments: 0, saves: 0, shares: 0 },
};

const posts = [
  {
    ...base,
    id: "p1",
    authorId: "u1",
    authorUsername: "rafa-lima",
    authorName: "Rafa Lima",
    authorBadges: [
      "http://localhost:5199/api/badge/b1.svg",
      "http://localhost:5199/api/badge/b2.svg",
      "http://localhost:5199/api/badge/b3.svg",
      "http://localhost:5199/api/badge/b4.svg",
      "http://localhost:5199/api/badge/b5.svg",
    ],
    authorContributor: { color: null },
    type: "PAGE",
    topic: "TECNOLOGIA",
    createdAt: ago(23),
    content: "Sabe qual é a diferença entre",
    pageHtml: `<div style="padding:24px;background:#120d1f;color:#d9c8ff;font-family:sans-serif"><h1 style="margin:0 0 12px;font-size:30px">Sabe qual é a diferença entre lista e conjunto?</h1><p style="font-size:16px;color:#b9b0d6">Uma página fictícia escrita só para o protótipo do feed.</p></div>`,
    counters: { reactions: 12, comments: 4, saves: 2, shares: 1 },
  },
  {
    ...base,
    id: "p2",
    authorId: "u2",
    authorUsername: "ana-souza",
    authorName: "Ana Souza",
    authorBadges: ["http://localhost:5199/api/badge/b2.svg"],
    type: "PROJECT",
    topic: "TECNOLOGIA",
    createdAt: ago(55),
    content:
      "Terminei a primeira versão do meu app de hábitos! Feito em React Native, com sincronização offline. Feedbacks são bem-vindos 🙏",
    mediaIds: ["m1"],
    counters: { reactions: 31, comments: 9, saves: 5, shares: 2 },
  },
  {
    ...base,
    id: "p3",
    authorId: "u3",
    authorUsername: "joaopedrodesenvolvedordesistemas",
    authorName: "João Pedro Desenvolvedor de Sistemas Distribuídos",
    type: "QUESTION",
    createdAt: ago(130),
    content:
      "Vocês usam monorepo no trabalho? Quais ferramentas recomendam para um time de 6 pessoas?",
    counters: { reactions: 3, comments: 14, saves: 0, shares: 0 },
  },
];

const seals = {
  p1: { seals: [{ seal: "INSPIRADOR", count: 4 }], mySeals: [] },
  p2: {
    seals: [
      { seal: "INTERESSANTE", count: 7 },
      { seal: "DICA", count: 2 },
    ],
    mySeals: [],
  },
  p3: { seals: [], mySeals: [] },
};

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    const path = url.pathname;
    const send = (status, body, type = "application/json") => {
      res.writeHead(status, { "content-type": type });
      res.end(type === "application/json" ? JSON.stringify(body) : body);
    };
    const b = path.match(/^\/api\/badge\/(b\d)\.svg$/);
    if (b) return send(200, badges[b[1]], "image/svg+xml");
    if (path === "/api/img.svg") return send(200, img, "image/svg+xml");
    if (path === "/api/auth/me")
      return send(200, {
        ...me,
        emailVerified: true,
        twoFactorEnabled: false,
        identityVerified: true,
        hasPassword: true,
      });
    if (path === "/api/me") return send(200, me);
    if (path === "/api/feed") return send(200, { items: posts, nextCursor: null });
    if (path === "/api/feed/posts/seals") {
      const ids = (url.searchParams.get("ids") ?? "").split(",");
      return send(
        200,
        Object.fromEntries(ids.map((id) => [id, seals[id] ?? { seals: [], mySeals: [] }])),
      );
    }
    if (path === "/api/media/m1")
      return send(200, {
        id: "m1",
        cdnUrl: "http://localhost:5199/api/img.svg",
        mimeType: "image/svg+xml",
      });
    const c = path.match(/^\/api\/feed\/posts\/[^/]+\/comments$/);
    if (c) return send(200, { items: [], nextCursor: null });
    console.log("404", req.method, req.url);
    send(404, { error: "not_found" });
  })
  .listen(8099, () => console.log("mock feed em http://localhost:8099"));
