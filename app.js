const languages = [
  { name: "C", folder: "c", file: "helloWorld.c", symbol: "C", output: "Hello, World!", command: "gcc helloWorld.c -o helloWorld && ./helloWorld", description: "The classic greeting with printf and the standard library." },
  { name: "C#", folder: "c#", file: "helloWorld.cs", symbol: "C#", output: "Hello, World!", command: "dotnet run helloWorld.cs", description: "A single output statement in C#." },
  { name: "C++", folder: "c++", file: "helloWorld.c++", symbol: "C+", output: "Hello, World!", command: "g++ helloWorld.c++ -o helloWorld && ./helloWorld", description: "Output streams and the iostream library." },
  { name: "Dart", folder: "dart", file: "helloWorld.dart", symbol: "Da", output: "Hello, World!", command: "dart helloWorld.dart", description: "The main entry point and the print function." },
  { name: "Go", folder: "golang", file: "helloWorld.go", symbol: "Go", output: "Hello, World!", command: "go run helloWorld.go", description: "A package, a main function, and fmt.Println." },
  { name: "HTML", folder: "html", file: "helloWorld.html", symbol: "Ht", output: "Hello, World!", command: "open helloWorld.html", description: "An h1 tag turns a greeting into web content.", isHtml: true },
  { name: "Java", folder: "java", file: "helloWorld.java", symbol: "Ja", output: "Hello, World!", command: "java helloWorld.java", description: "The main entry point inside a class." },
  { name: "JavaScript", folder: "javaScript", file: "helloWorld.js", symbol: "Js", output: "Hello, World!\\nHello, World!", command: "node helloWorld.js", description: "console.log in Node.js, plus an alert for the browser." },
  { name: "Julia", folder: "julia", file: "helloWorld.jl", symbol: "Ju", output: "Hello, World!", command: "julia helloWorld.jl", description: "One call to println is all it takes to get started." },
  { name: "Kotlin", folder: "kotlin", file: "helloWorld.kt", symbol: "Kt", output: "Hello, World!", command: "kotlinc helloWorld.kt -include-runtime -d helloWorld.jar && java -jar helloWorld.jar", description: "A concise, familiar main function." },
  { name: "Lua", folder: "lua", file: "helloWorld.lua", symbol: "Lu", output: "Hello, World!", command: "lua helloWorld.lua", description: "A print function and lightweight syntax." },
  { name: "Perl", folder: "pearl", file: "helloWorld.pm", symbol: "Pl", output: "Hello, World!", command: "perl -e 'require \"./pearl/helloWorld.pm\"; HelloWorld::say_hello()'", description: "A Perl module with a subroutine for saying hello." },
  { name: "PHP", folder: "php", file: "helloWorld.php", symbol: "Ph", output: "Hello, World!", command: "php helloWorld.php", description: "echo writes a message directly to the output." },
  { name: "Python", folder: "python", file: "helloWorld.py", symbol: "Py", output: "Hello, World!", command: "python helloWorld.py", description: "One line is all it takes to say hello in Python." },
  { name: "R", folder: "R", file: "helloWorld.r", symbol: "R", output: "Hello, World!\\n[1] \"Hello, World!\"\\n[1] \"Hello, World!\"", command: "Rscript helloWorld.r", description: "Three ways to build and print the same greeting." },
  { name: "Ruby", folder: "ruby", file: "helloWorld.rb", symbol: "Rb", output: "Hello, World!", command: "ruby helloWorld.rb", description: "puts prints the greeting and adds a line break." },
  { name: "Rust", folder: "rust", file: "helloWorld.rs", symbol: "Rs", output: "Hello, World!", command: "rustc helloWorld.rs && ./helloWorld", description: "println! is a macro, recognizable by its exclamation mark." },
  { name: "Scala", folder: "scala", file: "helloWorld.sc", symbol: "Sc", output: "Hello, World!\\nHello, World!", command: "scala helloWorld.sc", description: "The example includes both a classic and a modern starting point." },
  { name: "TypeScript", folder: "typeScript", file: "helloWorld.ts", symbol: "Ts", output: "Hello, World!", command: "npx tsx helloWorld.ts", description: "JavaScript with types, compiled and ready to run." },
];
const languageList = document.querySelector("#language-list");
const searchInput = document.querySelector("#language-search");
const sourceCode = document.querySelector("#source-code");
const lineNumbers = document.querySelector("#line-numbers");
const toast = document.querySelector("#toast");
const fileName = document.querySelector("#file-name");
const fileIndicator = document.querySelector("#file-indicator");
const terminalOutput = document.querySelector("#terminal-output");
const languageDescription = document.querySelector("#language-description");
const languageCount = document.querySelector("#language-count");
const previousButton = document.querySelector("#previous-language");
const nextButton = document.querySelector("#next-language");
const copyButton = document.querySelector("#copy-code");
const sourceCache = new Map();
let activeLanguage = "Python";
let visibleLanguages = [...languages];
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}
function highlightCode(source, language) {
  if (language === "HTML") {
    return escapeHtml(source).replace(/(&lt;\/?[\w-]+(?:\s[^&]*?)?\/?&gt;)/g, '<span class="syntax-tag">$1</span>');
  }
  const escaped = escapeHtml(source);
  const tokens = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/|^\s*#(?!include\b)[^\n]*|\b(?:const|let|var|function|return|if|else|for|while|class|public|private|static|void|int|string|String|package|import|use|strict|warnings|sub|def|fun|fn|println|print|echo|puts|main|object|Unit|true|false|null|new|do|end|begin|extends|implements|final|var|val|func|type|in|as|from|export|default|async|await|namespace|using|Console|fmt|std|iostream|include)\b|\b\d+\b)/gm;
  let result = "";
  let cursor = 0;
  for (const match of escaped.matchAll(tokens)) {
    result += escaped.slice(cursor, match.index);
    const token = match[0];
    let className = "syntax-keyword";
    if (/^(["'`])/.test(token)) className = "syntax-string";
    else if (/^(\/\/|\/\*|#)/.test(token)) className = "syntax-comment";
    else if (/^\d/.test(token)) className = "syntax-number";
    result += `<span class="${className}">${token}</span>`;
    cursor = match.index + token.length;
  }
  return result + escaped.slice(cursor);
}
function getSource(language) {
  if (!sourceCache.has(language.name)) {
    const sourcePath = `${encodeURIComponent(language.folder)}/${encodeURIComponent(language.file)}`;
    sourceCache.set(language.name, fetch(sourcePath).then((response) => {
      if (!response.ok) throw new Error(`Could not load ${language.file} (${response.status}).`);
      return response.text();
    }));
  }
  return sourceCache.get(language.name);
}
function renderLanguageList() {
  languageList.replaceChildren();
  languageCount.textContent = String(visibleLanguages.length).padStart(2, "0");
  if (visibleLanguages.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-search";
    empty.textContent = "No languages found. Try another search.";
    languageList.append(empty);
    return;
  }
  visibleLanguages.forEach((language) => {
    const button = document.createElement("button");
    button.className = "language-option";
    button.type = "button";
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(language.name === activeLanguage));
    const symbol = document.createElement("span");
    symbol.className = "language-symbol";
    symbol.textContent = language.symbol;
    const name = document.createElement("span");
    name.className = "language-name";
    name.textContent = language.name;
    const extension = document.createElement("span");
    extension.className = "language-extension";
    extension.textContent = language.file.slice(language.file.lastIndexOf("."));
    button.append(symbol, name, extension);
    button.addEventListener("click", () => selectLanguage(language.name));
    languageList.append(button);
  });
}
async function selectLanguage(name) {
  const language = languages.find((item) => item.name === name);
  if (!language) return;
  activeLanguage = name;
  renderLanguageList();
  fileName.textContent = language.file;
  fileIndicator.textContent = language.symbol;
  languageDescription.textContent = language.description;
  terminalOutput.replaceChildren();
  const command = document.createElement("span");
  command.className = "terminal-command";
  command.textContent = language.command;
  terminalOutput.append("$ ", command, document.createElement("br"));
  const prompt = document.createElement("span");
  prompt.className = "prompt-symbol terminal-chevron";
  prompt.textContent = "›";
  const output = document.createElement("span");
  output.className = "output-text";
  output.textContent = language.output.replace(/\\n/g, "\n");
  terminalOutput.append(prompt, " ", output);
  sourceCode.innerHTML = '<span class="loading-mark">Loading example<span class="loading-dots">...</span></span>';
  lineNumbers.textContent = "·";
  previousButton.disabled = false;
  nextButton.disabled = false;
  try {
    const source = await getSource(language);
    if (activeLanguage !== name) return;
    sourceCode.innerHTML = highlightCode(source, language.name);
    lineNumbers.textContent = source.split("\n").map((_, index) => index + 1).join("\n");
  } catch (error) {
    if (activeLanguage !== name) return;
    sourceCode.innerHTML = `<span class="load-error">${escapeHtml(error.message)} Start a local server to load source files.</span>`;
    lineNumbers.textContent = "!";
  }
}
function moveLanguage(direction) {
  if (languages.length === 0) return;
  const currentIndex = languages.findIndex((language) => language.name === activeLanguage);
  const nextIndex = (currentIndex + direction + languages.length) % languages.length;
  selectLanguage(languages[nextIndex].name);
  const selected = languageList.querySelector('[aria-selected="true"]');
  selected?.scrollIntoView({ block: "nearest" });
}
let toastTimer;
function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLocaleLowerCase();
  visibleLanguages = languages.filter((language) => language.name.toLocaleLowerCase().includes(query));
  renderLanguageList();
});
previousButton.addEventListener("click", () => moveLanguage(-1));
nextButton.addEventListener("click", () => moveLanguage(1));
copyButton.addEventListener("click", async () => {
  const language = languages.find((item) => item.name === activeLanguage);
  try {
    await navigator.clipboard.writeText(await getSource(language));
    showToast(`${language.file} copied to clipboard`);
  } catch {
    showToast("Could not copy. Check your browser permissions.");
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== searchInput && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape" && document.activeElement === searchInput) {
    searchInput.value = "";
    visibleLanguages = [...languages];
    renderLanguageList();
    searchInput.blur();
  }
  if (document.activeElement === searchInput) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const currentIndex = visibleLanguages.findIndex((language) => language.name === activeLanguage);
      if (visibleLanguages.length) {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const startingIndex = currentIndex < 0 ? (direction > 0 ? -1 : 0) : currentIndex;
        const nextIndex = (startingIndex + direction + visibleLanguages.length) % visibleLanguages.length;
        selectLanguage(visibleLanguages[nextIndex].name);
      }
    }
    return;
  }
  if (event.key === "ArrowRight") moveLanguage(1);
  if (event.key === "ArrowLeft") moveLanguage(-1);
});
renderLanguageList();
selectLanguage(activeLanguage);