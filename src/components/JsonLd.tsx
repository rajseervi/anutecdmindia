/**
 * JSON-LD structured data injector.
 * Renders a <script type="application/ld+json"> block for SEO.
 */
export default function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
