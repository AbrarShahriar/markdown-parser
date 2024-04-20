// @ts-nocheck
mermaid.initialize({ startOnLoad: false });

const MD_Types = {
  HEADER: "header",
  TEXT_FORMATTING: {
    BOLD: "bold",
    ITALIC: "italic",
    STRIKETHROUGH: "strikethrough",
    HIHGLIGHT: "highlight",
  },
  MEDIA: { IMAGE: "image" },
  LINK: "LINK",
  INDENTATION: "indentation",
  LIST: { UL: "list_ul", OL: "list_ol" },
  BLOCK: { QUOTE: "quote", CODE: "code" },
};

const el = {
  input: document.querySelector(".input"),
  output: document.querySelector(".output"),
  renderBtn: document.querySelector(".render"),
};

el.renderBtn.addEventListener("click", async () => {
  el.output.innerHTML = "";
  el.output.innerHTML = parseMd(el.input.value);

  hljs.highlightAll();
  renderMathInElement(el.output, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
    ],
    throwOnError: false,
  });
  await mermaid.run();
});

const ruleSets = [
  // HEADERS
  [
    {
      type: MD_Types.HEADER,
      regex: /^(#{6}\s)(.*)/gm,
      template: `<h6>$2</h6>`,
    },
    {
      type: MD_Types.HEADER,
      regex: /^(#{5}\s)(.*)/gm,
      template: `<h5>$2</h5>`,
    },
    {
      type: MD_Types.HEADER,
      regex: /^(#{4}\s)(.*)/gm,
      template: `<h4>$2</h4>`,
    },
    {
      type: MD_Types.HEADER,
      regex: /^(#{3}\s)(.*)/gm,
      template: `<h3>$2</h3>`,
    },
    {
      type: MD_Types.HEADER,
      regex: /^(#{2}\s)(.*)/gm,
      template: `<h2>$2</h2>`,
    },
    {
      type: MD_Types.HEADER,
      regex: /^(#{1}\s)(.*)/gm,
      template: `<h1>$2</h1>`,
    },
  ],

  // LINES
  [
    {
      type: MD_Types.LINE,
      regex: /^(\-\-\-)/gm,
      template: `<hr>`,
    },
  ],

  // BLOCKS
  [
    // BLOCKQUOTE
    {
      type: MD_Types.BLOCK.QUOTE,
      regex: /^([\>]\s+.+\n?)+/gm,
      template: (blockquoteBody) =>
        `<blockquote>${blockquoteBody}</blockquote>`,
    },
    // CODEBLOCK
    {
      type: MD_Types.BLOCK.CODE,
      regex: /\`\`\`(\w+){0,}?(?:\n([\s\S]*?)\n)\`\`\`/gm,
      template: (lang, codeBody) =>
        `<pre><code class="language-${lang}">${codeBody}</code></pre>`,
    },
  ],

  // TEXT FORMATTING
  [
    // BOLD
    {
      type: MD_Types.TEXT_FORMATTING.BOLD,
      regex: /(\*\*)([a-zA-z0-9\s]+)(\*\*)/gm,
      template: `<strong>$2</strong>`,
    },
    // ITALIC
    {
      type: MD_Types.TEXT_FORMATTING.ITALIC,
      regex: /(\_\_)([a-zA-z0-9\s]+)(\_\_)/gm,
      template: `<em>$2</em>`,
    },
    // STRIKETHROUGH
    {
      type: MD_Types.TEXT_FORMATTING.STRIKETHROUGH,
      regex: /(\~)([a-zA-z0-9\s]+)(\~)/gm,
      template: `<del>$2</del>`,
    },
    // HIGHLIGHT
    {
      type: MD_Types.TEXT_FORMATTING.HIHGLIGHT,
      regex: /(\#)([a-zA-z0-9\s]+)(\#)/gm,
      template: `<mark>$2</mark>`,
    },
  ],

  // LISTS
  [
    // UNORDERED LIST
    {
      //   regex: /^(\*|\-)\s(\w.+)/gm,
      type: MD_Types.LIST.UL,
      regex: /^(?:[\*\-\+]\s+.+\n?)+/gm,
      template: (listBody) => `<ul>
            ${listBody}
            </ul>`,
    },

    // ORDERED LIST
    {
      type: MD_Types.LIST.OL,
      regex: /^(?:\d+\.\s+.+\n?)+/gm,
      template: (listBody) => `<ol>
              ${listBody}
              </ol>`,
    },
  ],

  // IMAGE
  [
    {
      type: MD_Types.MEDIA.IMAGE,
      regex: /(\!)(\[)+(.*)(\])(\()(.*)(\))/gm,
      template: `<img src="$6" alt="$3" />`,
    },
  ],

  // LINK
  [
    {
      type: MD_Types.LINK,
      regex: /(\[)+(.*)(\])(\()(.*)(\))/gm,
      template: `<a href="$5">$2</a>`,
    },
  ],

  // INDENTATION
  [
    {
      type: MD_Types.INDENTATION,
      regex: /\n/gm,
      template: `<br>`,
    },
  ],
];

function parseMd(md) {
  let html = md;

  ruleSets.forEach((ruleSet) => {
    ruleSet.forEach(({ regex, template, type }) => {
      if (typeof template === "function") {
        switch (type) {
          case MD_Types.LIST.UL:
            let matchedULElements = html.match(regex) || [];

            matchedULElements.forEach((match) => {
              let listBody = ``;
              match
                .split("-")
                .filter((el) => el)
                .forEach((element) => {
                  listBody += `<li>${element}</li>`;
                });

              html = html.replace(match, template(listBody));
            });

            return;

          case MD_Types.LIST.OL:
            let matchedOLElements = html.match(regex) || [];

            matchedOLElements.forEach((match) => {
              let listBody = ``;
              match
                .split("\n")
                .filter((el) => el)
                .forEach((element) => {
                  listBody += `<li>${element.substring(2)}</li>`;
                });

              html = html.replace(match, template(listBody));
            });
            return;

          case MD_Types.BLOCK.QUOTE:
            let matchedBlockQuote = html.match(regex) || [];
            matchedBlockQuote.forEach((match) => {
              let blockBody = "";
              match
                .split(">")
                .filter((el) => el)
                .forEach((element) => {
                  blockBody += `${element}`;
                });

              html = html.replace(match, template(blockBody));
            });
            return;

          case MD_Types.BLOCK.CODE:
            let matchedCodeQuote = html.match(regex) || [];
            matchedCodeQuote.forEach((match) => {
              let blockBody = "";
              let metadata = match.split("\n");

              let lang = metadata[0].substring(3).trim();

              metadata
                .filter(
                  (el, i) =>
                    !(i == 0 || i == match.split("\n").length - 1) && el
                )
                .forEach((el) => (blockBody += `${el}\r\n`));

              html = html.replace(match, template(lang, blockBody));
            });
            return;

          default:
            return;
        }
      } else {
        html = html.replace(regex, template);
      }
    });
  });

  html = html.replace();
  return html;
}
