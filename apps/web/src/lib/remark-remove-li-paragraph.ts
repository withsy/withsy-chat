import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root, Paragraph, ListItem, BlockContent } from "mdast";

export const remarkRemoveParagraphInList: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "listItem", (node: ListItem) => {
      if (node.children.length === 1 && node.children[0].type === "paragraph") {
        const paragraph = node.children[0] as Paragraph;
        node.children = paragraph.children as unknown as BlockContent[];
      }
    });
  };
};
