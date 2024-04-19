// @ts-nocheck

const MD_Types = {
  HEADER: "header",
  TEXT_FORMATTING: "text_formatting",
  IMAGE: "image",
  LINK: "LINK",
  INDENTATION: "indentation",
  LIST_UL: "list_ul",
  LIST_OL: "list_ol",
};

const el = {
  input: document.querySelector(".input"),
  output: document.querySelector(".output"),
  renderBtn: document.querySelector(".render"),
};

el.renderBtn.addEventListener("click", () => {
  el.output.innerHTML = "";
  el.output.innerHTML = parseMd(el.input.value);
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

  // TEXT FORMATTING
  [
    // BOLD
    {
      type: MD_Types.TEXT_FORMATTING,
      regex: /(\*\*)([a-zA-z0-9\s]+)(\*\*)/gm,
      template: `<strong>$2</strong>`,
    },
    // ITALIC
    {
      type: MD_Types.TEXT_FORMATTING,
      regex: /(\_\_)([a-zA-z0-9\s]+)(\_\_)/gm,
      template: `<em>$2</em>`,
    },
    // STRIKETHROUGH
    {
      type: MD_Types.TEXT_FORMATTING,
      regex: /(\~)([a-zA-z0-9\s]+)(\~)/gm,
      template: `<del>$2</del>`,
    },
    // HIGHLIGHT
    {
      type: MD_Types.TEXT_FORMATTING,
      regex: /(\#)([a-zA-z0-9\s]+)(\#)/gm,
      template: `<mark>$2</mark>`,
    },
    // BLOCKQUOTE
    {
      type: MD_Types.TEXT_FORMATTING,
      regex: /^(\>)\s(.*)/gm,
      template: `<blockquote>$2</blockquote>`,
    },
  ],

  // LISTS
      [
          // UNORDERED LIST
          {
              //   regex: /^(\*|\-)\s(\w.+)/gm,
        type: MD_Types.LIST_UL,
        regex: /^(?:[\*\-\+]\s+.+\n?)+/gm,
        template: (listBody) => `<ul>
            ${listBody}
            </ul>`,
      },

      // ORDERED LIST
      {
        type: MD_Types.LIST_OL,
        regex: /^(?:\d+\.\s+.+\n?)+/gm,
        template: (listBody) => `<ol>
              ${listBody}
              </ol>`,
      },
    ],

  // IMAGE
  [
    {
      type: MD_Types.IMAGE,
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
          
      if (
        typeof template === "function" &&
        type === MD_Types.LIST_UL
      ) {
        let matchedElements = html.match(regex) || [];
        
        if(matchedElements[0]) {
          let listBody = ``;
          matchedElements[0].split("-").filter(el => el).forEach((element) => {
          console.log(listBody);
          (listBody += `<li>${element}</li>`);
        });
        
          html = html.replace(regex, template(listBody));
        }
        
        
      } else if (typeof template === "function" && type == MD_Types.LIST_OL) {
        
        let matchedElements = html.match(regex) || [];
        
        if (matchedElements[0]) {
          let listBody = ``;
          matchedElements[0].split("\n").filter(el => el).forEach((element) => {
            console.log(listBody);
            (listBody += `<li>${element.substring(2)}</li>`);
          });
        
          html = html.replace(regex, template(listBody));
        }
      } else {
        html = html.replace(regex, template);
      }
    });
  });

  html = html.replace();

  return html;
}
