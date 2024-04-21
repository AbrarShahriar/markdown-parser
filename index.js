// @ts-nocheck
mermaid.initialize({ startOnLoad: false });

const MD_Types = {
  HEADER: "header",
  TEXT_FORMATTING: {
    BOLD: "bold",
    ITALIC: "italic",
    STRIKETHROUGH: "strikethrough",
    HIGHLIGHT: "highlight",
    UNDERLINE: "underline",
  },
  MEDIA: { IMAGE: "image", CHECKBOX: "checkbox" },
  LINK: "LINK",
  INDENTATION: { LINE_BREAK: "linebrake", TAB: "tab" },
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
      regex: /(?:\*)(?<! )(\S(.*?))(?! )(?:\*)/gm,
      template: `<strong>$1</strong>`,
    },
    // ITALIC
    {
      type: MD_Types.TEXT_FORMATTING.ITALIC,
      regex: /(?:\%)(?<! )(\S(.*?))(?! )(?:\%)/gm,
      template: `<em>$1</em>`,
    },
    // STRIKETHROUGH
    {
      type: MD_Types.TEXT_FORMATTING.STRIKETHROUGH,
      regex: /(?:\~)(?<! )(\S(.*?))(?! )(?:\~)/gm,
      template: `<del>$1</del>`,
    },
    // HIGHLIGHT
    {
      type: MD_Types.TEXT_FORMATTING.HIGHLIGHT,
      regex: /(?:\#)(?<! )(\S(.*?))(?! )(?:\#)/gm,
      template: `<mark>$1</mark>`,
    },
    // UNDERLINE
    {
      type: MD_Types.TEXT_FORMATTING.UNDERLINE,
      regex: /(?:\_)(?<! )(\S(.*?))(?! )(?:\_)/gm,
      template: `<u>$1</u>`,
    },
  ],

  // LISTS
  [
    // UNORDERED LIST
    {
      //   regex: /^(\*|\-)\s(\w.+)/gm,
      type: MD_Types.LIST.UL,
      regex: /^(?:[\*\-\+]\s+.+\n?)+/gm,
      template: (listBody) => "<ul>" + listBody + "</ul>",
    },

    // ORDERED LIST
    {
      type: MD_Types.LIST.OL,
      regex: /^(?:\d+\.\s+.+\n?)+/gm,
      template: (listBody) => "<ol>" + listBody + "</ol>",
    },
  ],

  // MEDIA
  [
    {
      type: MD_Types.MEDIA.IMAGE,
      regex: /(\!)(\[)+(.*)(\])(\()(.*)(\))/gm,
      template: `<img src="$6" alt="$3" />`,
    },
    {
      type: MD_Types.MEDIA.CHECKBOX,
      regex: /\[([\s|x])\]/gm,
      template: (checked) =>
        `<input type="checkbox" disabled ${checked && "checked"} />`,
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
    // {
    //   type: MD_Types.INDENTATION.TAB,
    //   regex: /^\_\_(.*)/gm,
    //   template: (level, body) =>
    //     `<div style="margin-left: ${level * 20}px">${body}</div>`,
    // },
    // {
    //   type: MD_Types.INDENTATION.LINE_BREAK,
    //   regex: /\n/gm,
    //   template: `<br>`,
    // },
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
                .split("\n")
                .filter((el) => el.trim())
                .forEach((element) => {
                  listBody += `<li>${element.substring(2)}</li>`;
                });

              html = html.replace(match, template(listBody) + "\n");
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

              if (lang === "mermaid") {
                html = html.replace(
                  match,
                  `<pre class="diagram mermaid">${blockBody}</pre>`
                );
                return;
              } else if (lang === "table") {
                html = html.replace(match, tableToHtml(blockBody));
                return;
              }
              html = html.replace(match, template(lang, blockBody));
            });
            return;

          case MD_Types.MEDIA.CHECKBOX:
            let matchedCheckboxes = html.match(regex) || [];
            matchedCheckboxes.forEach((match) => {
              let checked = match.substring(1, 2).trim();

              html = html.replace(match, template(checked && checked));
            });
            return;

          case MD_Types.INDENTATION.TAB:
            const matchedTabElements = html.match(regex) || [];

            matchedTabElements.forEach((match) => {
              let level = match.lastIndexOf("_") + 1;

              console.log(html);

              html = html.replace(
                match,
                template(level, parseMd(match.substring(level)))
              );
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

const localCreateEl = (el) => document.createElement(el);

const tableToHtml = (text = testData) => {
  let textLineArr = text.split("\n").filter((el) => el);

  const table = localCreateEl("table");

  table.classList.add("ttable");

  textLineArr.forEach((line, lineNumber) => {
    let tr = localCreateEl("tr");

    let trData = line.split(",");

    if (lineNumber == 0) {
      trData.forEach((col) => {
        let th = localCreateEl("th");
        th.textContent = col.trim();
        tr.append(th);
      });
    } else {
      trData.forEach((col) => {
        let td = localCreateEl("td");
        td.textContent = col.trim();
        tr.append(td);
      });
    }

    table.append(tr);
  });

  return table.outerHTML;
};
