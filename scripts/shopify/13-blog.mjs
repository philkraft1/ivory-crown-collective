#!/usr/bin/env node
/**
 * Publishes the SEO articles to the store's blog.
 *
 *   node scripts/shopify/13-blog.mjs           # preview
 *   node scripts/shopify/13-blog.mjs --apply
 *
 * The "News" blog exists but has zero posts. These three articles target the
 * searches this niche can actually win -- "book character day costume ideas",
 * "wizard of oz school play costumes", "christmas pageant costumes" -- rather than
 * "halloween costumes", where the competition is Spirit Halloween and Amazon.
 *
 * Copy lives in content/articles.mjs so it is reviewable in a diff.
 */
import { graphql, mutate } from "./lib/client.mjs";
import { FLAGS, log, writeReport } from "./lib/cli.mjs";
import { ARTICLES } from "./content/articles.mjs";
import { BRAND } from "./lib/env.mjs";

const BLOGS_QUERY = `
  query Blogs {
    blogs(first: 10) {
      edges {
        node {
          id
          handle
          title
          articles(first: 100) { edges { node { id handle title } } }
        }
      }
    }
  }
`;

const ARTICLE_CREATE = `
  mutation ArticleCreate($article: ArticleCreateInput!) {
    articleCreate(article: $article) {
      article { id handle title }
      userErrors { field message }
    }
  }
`;

const ARTICLE_UPDATE = `
  mutation ArticleUpdate($id: ID!, $article: ArticleUpdateInput!) {
    articleUpdate(id: $id, article: $article) {
      article { id handle title }
      userErrors { field message }
    }
  }
`;

log.banner("13 - Blog", `${ARTICLES.length} articles targeting long-tail niche searches.`);

const data = await graphql(BLOGS_QUERY);
const blogs = data.blogs.edges.map((e) => e.node);

if (!blogs.length) {
  log.err("No blog found. Create one in Online Store > Blog posts, then re-run.");
  process.exit(1);
}

const blog = blogs.find((b) => b.handle === "news") ?? blogs[0];
const existing = new Map(blog.articles.edges.map((e) => [e.node.handle, e.node]));

log.step(`Blog "${blog.title}" (/blogs/${blog.handle}) - ${existing.size} existing article(s)`);
if (existing.size === 0) log.warn("Blog is empty, which is a missed organic channel.");
log.blank();

let created = 0;
let updated = 0;
let failed = 0;

for (const article of ARTICLES) {
  const already = existing.get(article.handle);
  const words = article.body.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;

  if (FLAGS.dryRun) {
    log.info(`${already ? "update" : "create"}  ${article.title}`);
    log.detail(`/blogs/${blog.handle}/${article.handle}  -  ${words} words`);
    log.detail(`seo: ${article.seoTitle}`);
    already ? updated++ : created++;
    continue;
  }

  const input = {
    blogId: blog.id,
    title: article.title,
    handle: article.handle,
    body: article.body,
    summary: article.summary,
    tags: article.tags,
    author: { name: BRAND.name },
    isPublished: true,
  };

  try {
    if (already) {
      // blogId is not accepted on update; the article already belongs to a blog.
      const { blogId, ...updateInput } = input;
      await mutate(ARTICLE_UPDATE, { id: already.id, article: updateInput }, "articleUpdate");
      log.ok(`updated  ${article.handle}`);
      updated++;
    } else {
      await mutate(ARTICLE_CREATE, { article: input }, "articleCreate");
      log.ok(`created  ${article.handle}`);
      created++;
    }
  } catch (error) {
    log.err(`${article.handle} - ${error.message}`);
    failed++;
  }
}

writeReport("docs/shopify/blog-plan.json", {
  generatedAt: new Date().toISOString(),
  blog: { handle: blog.handle, title: blog.title },
  articles: ARTICLES.map((a) => ({
    handle: a.handle,
    title: a.title,
    url: `/blogs/${blog.handle}/${a.handle}`,
    seoTitle: a.seoTitle,
    seoDescription: a.seoDescription,
    tags: a.tags,
    words: a.body.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length,
  })),
});

log.summary([
  [FLAGS.dryRun ? "would create" : "created", created],
  [FLAGS.dryRun ? "would update" : "updated", updated],
  ["failed", failed],
]);

log.blank();
log.warn("Set each article's SEO title and description in the admin - the API does not expose them.");
log.detail("Values are in docs/shopify/blog-plan.json");
log.detail("Add a featured image to each post; posts without one look broken in listings.");
