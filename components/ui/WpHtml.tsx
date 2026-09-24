import Image from "next/image";
import parse, { domToReact, Element, type DOMNode, type HTMLReactParserOptions } from "html-react-parser";
import { sanitizeWpHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

const WP_UPLOADS = /^https:\/\/(www\.)?amicarehospital\.in\/wp-content\/uploads\//;

/** Wrapper tags Elementor nests everywhere; we keep only their children. */
const UNWRAP = new Set(["div", "span", "figure"]);

const options: HTMLReactParserOptions = {
  replace(node) {
    if (!(node instanceof Element)) return;
    const children = () => domToReact(node.children as DOMNode[], options);

    if (UNWRAP.has(node.name)) return <>{children()}</>;

    if (node.name === "img") {
      const { src, alt = "", width, height } = node.attribs;
      if (!src || !WP_UPLOADS.test(src)) return <></>;
      return (
        <Image
          src={src}
          alt={alt}
          width={Number(width) || 800}
          height={Number(height) || 500}
          sizes="(max-width: 768px) 100vw, 640px"
          className="h-auto w-full rounded-xl"
        />
      );
    }

    if (node.name === "a") {
      const href = node.attribs.href ?? "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
          {children()}
        </a>
      );
    }

    // Section titles are h2/h3 on this page; WP sub-headings become h4.
    if (/^h[1-6]$/.test(node.name)) return <h4>{children()}</h4>;
  },
};

/** Renders sanitised WordPress HTML with our own typography. */
export function WpHtml({ html, className }: { html: string; className?: string }) {
  return <div className={cn("wp-content", className)}>{parse(sanitizeWpHtml(html), options)}</div>;
}
