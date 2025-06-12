// List of file patterns to ignore
const IGNORED_FILE_PATTERNS = [
  // Package management
  /package-lock\.json$/,
  /yarn\.lock$/,
  /pnpm-lock\.yaml$/,
  /\.lock$/,
  
  // IDE and editor files
  /\.vscode\/.*/,
  /\.idea\/.*/,
  /\.DS_Store$/,
  /\.swp$/,
  /\.swo$/,
  
  // Build and cache directories
  /node_modules\/.*/,
  /dist\/.*/,
  /build\/.*/,
  /\.next\/.*/,
  /\.cache\/.*/,
  /coverage\/.*/,
  
  // Environment and config files
  /\.env.*$/,
  /\.config\.js$/,
  /\.config\.ts$/,
  /config\.js$/,
  /config\.ts$/,
  
  // Log files
  /\.log$/,
  /logs\/.*/,
  
  // Test coverage
  /coverage\/.*/,
  /\.nyc_output\/.*/,
  
  // Temporary files
  /\.tmp$/,
  /\.temp$/,
  /\.bak$/,
  
  // Documentation
  /docs\/.*/,
  /\.md$/,
  
  // Git related
  /\.git\/.*/,
  /\.gitignore$/,
  /\.gitattributes$/,
  
  // Docker
  /Dockerfile$/,
  /docker-compose\.ya?ml$/,
  /\.dockerignore$/,
  
  // CI/CD
  /\.github\/.*/,
  /\.gitlab\/.*/,
  /\.circleci\/.*/,
  /\.travis\.ya?ml$/,
  /\.jenkins\/.*/,
  
  // Misc
  /\.editorconfig$/,
  /\.prettierrc$/,
  /\.eslintrc$/,
  /\.babelrc$/,
  /tsconfig\.json$/,
  /jest\.config\.(js|ts)$/,
  /webpack\.config\.(js|ts)$/,
  /rollup\.config\.(js|ts)$/,
  /babel\.config\.(js|ts)$/,
  /postcss\.config\.(js|ts)$/,
  /tailwind\.config\.(js|ts)$/,
  /tsconfig\.app\.tsbuildinfo$/,
];

/**
 * Checks if a file should be ignored based on predefined patterns
 * @param filename The name of the file to check
 * @returns boolean indicating whether the file should be ignored
 */
export function shouldIgnoreFile(filename: string): boolean {
  return IGNORED_FILE_PATTERNS.some(pattern => pattern.test(filename));
}

/**
 * Filters an array of files to exclude ignored files
 * @param files Array of file objects with filename property
 * @returns Filtered array of files
 */
export function filterIgnoredFiles<T extends { filename: string }>(files: T[]): T[] {
  return files.filter(file => !shouldIgnoreFile(file.filename));
} 