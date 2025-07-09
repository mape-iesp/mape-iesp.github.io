import { z, defineCollection } from 'astro:content';

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.string().url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

const postCollection = defineCollection({
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});

const oqfCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    categories: z.array(z.string()),
    interventions: z.array(z.object({
      name: z.string(),
      category: z.string(),
      effect: z.enum(['positivo', 'positivo-moderado', 'indeterminado', 'negativo-moderado', 'negativo']),
      effectDescription: z.string(),
      implementation: z.string(),
      implementationComplexity: z.enum(['simples', 'moderada', 'complexa']),
      cost: z.enum(['muito-baixo', 'baixo', 'medio', 'alto', 'muito-alto']),
      summary: z.string(),
      studyLink: z.string().url().optional(),
    })),
  }),
});

export const collections = {
  post: postCollection,
  oqf: oqfCollection,
};
