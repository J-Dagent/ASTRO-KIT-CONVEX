import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { Copy } from "lucide-react";
import { DocsNavigation } from "./docs-navigation";
import "highlight.js/styles/github-dark.css";

const styles = {
  h1: "text-3xl sm:text-4xl font-bold tracking-tight mb-8",
  h2: "text-xl sm:text-2xl font-semibold mt-12 mb-4 border-b border-border pb-3",
  h3: "text-lg sm:text-xl font-medium mt-8 mb-3",
  p: "my-4 leading-7 text-sm sm:text-base text-foreground/90",
  a: "text-primary underline break-words",
  ul: "list-disc ml-4 sm:ml-6 my-2 text-sm sm:text-base",
  ol: "list-decimal ml-4 sm:ml-6 my-2 text-sm sm:text-base",
  li: "my-1",
  code: "bg-muted px-1.5 py-0.5 rounded font-mono text-xs sm:text-sm text-muted-foreground border border-border",
  pre: "bg-zinc-950 p-3 sm:p-5 rounded-b-lg overflow-x-auto text-xs sm:text-sm border border-zinc-800 text-zinc-100",
  blockquote: "border-l-4 border-primary pl-3 sm:pl-4 italic my-3 sm:my-4 text-sm sm:text-base",
};

function CodeBlock({ children, ...props }: React.ComponentProps<"pre">) {
  return (
    <div className="group relative my-4" data-code-block>
      <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-border bg-muted/50 px-3 py-2 backdrop-blur-sm">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Code
        </span>
        <button
          type="button"
          data-copy-code
          className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs text-foreground transition-colors hover:bg-primary/20"
        >
          <Copy className="h-3.5 w-3.5" />
          <span>Copier</span>
        </button>
      </div>
      <pre className={`${styles.pre} rounded-t-none`} {...props}>{children}</pre>
    </div>
  );
}

export function MarkdownDocument({ content, name }: { content: string; name: string }) {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8 lg:py-14">
      <DocsNavigation current={name} />
      <article className="min-w-0 max-w-4xl">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            h1: ({ children }) => <h1 className={styles.h1}>{children}</h1>,
            h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
            h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
            p: ({ children }) => <p className={styles.p}>{children}</p>,
            a: ({ href, children }) => (
              <a href={href} className={styles.a} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>
                {children}
              </a>
            ),
            ul: ({ children }) => <ul className={styles.ul}>{children}</ul>,
            ol: ({ children }) => <ol className={styles.ol}>{children}</ol>,
            li: ({ children }) => <li className={styles.li}>{children}</li>,
            code: ({ className, children, ...props }) =>
              !className || !className.includes("language-") ? (
                <code className={styles.code} {...props}>{children}</code>
              ) : (
                <code className={className} {...props}>{children}</code>
              ),
            pre: CodeBlock,
            blockquote: ({ children }) => <blockquote className={styles.blockquote}>{children}</blockquote>,
            hr: () => <hr className="my-9 border-border" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
