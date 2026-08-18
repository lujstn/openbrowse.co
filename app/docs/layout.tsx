import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";
import { baseOptions } from "@/lib/layout.shared";
import { Provider } from "@/components/provider";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <Provider>
      <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
        {children}
      </DocsLayout>
    </Provider>
  );
}
