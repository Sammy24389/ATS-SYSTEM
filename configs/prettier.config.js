// Prettier Configuration
// ATS Resume Platform

module.exports = {
    // Line width
    printWidth: 100,

    // Indentation
    tabWidth: 2,
    useTabs: false,

    // Quotes
    singleQuote: true,
    jsxSingleQuote: false,

    // Semicolons
    semi: true,

    // Trailing commas
    trailingComma: "es5",

    // Brackets
    bracketSpacing: true,
    bracketSameLine: false,

    // Arrow functions
    arrowParens: "always",

    // Line endings
    endOfLine: "lf",

    // Prose wrapping (for markdown)
    proseWrap: "preserve",

    // HTML whitespace sensitivity
    htmlWhitespaceSensitivity: "css",

    // Vue-specific
    vueIndentScriptAndStyle: false,

    // Embedded language formatting
    embeddedLanguageFormatting: "auto",

    // Single attribute per line in HTML/JSX
    singleAttributePerLine: false,

    // Overrides for specific file types
    overrides: [
        {
            files: "*.md",
            options: {
                proseWrap: "always",
                printWidth: 80,
            },
        },
        {
            files: "*.json",
            options: {
                printWidth: 80,
            },
        },
        {
            files: ["*.yml", "*.yaml"],
            options: {
                tabWidth: 2,
                singleQuote: false,
            },
        },
    ],
};
